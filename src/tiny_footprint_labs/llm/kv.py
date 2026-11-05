"""Key-value cache accounting and shape-independent tensor access.

Transformers has represented the cache as nested tuples, as ``key_cache`` and
``value_cache`` lists, and as a list of layer objects. Everything here reads and
builds through these helpers, so the rest of the lab does not depend on which one
is installed.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from typing import Any

KvPair = tuple[Any, Any]


def kv_bytes_per_token(layers: int, heads: int, head_dim: int, dtype_bytes: int) -> int:
    """Standard accounting: key and value tensors, per layer, head and head dimension."""
    return 2 * layers * heads * head_dim * dtype_bytes


def shared_prefix_reduction(sessions: int, prefix_tokens: int, suffix_tokens: int) -> float:
    """Predicted reduction when a shared prefix is stored once instead of per session."""
    duplicated = sessions * (prefix_tokens + suffix_tokens)
    shared = prefix_tokens + sessions * suffix_tokens
    return 1.0 - shared / duplicated


def kv_pairs(past: Any) -> list[KvPair]:
    """Return (key, value) tensor pairs for every layer of a cache."""
    layers = getattr(past, "layers", None)
    if layers is not None:
        return [(layer.keys, layer.values) for layer in layers]
    key_cache = getattr(past, "key_cache", None)
    if key_cache is not None:
        return list(zip(key_cache, past.value_cache, strict=True))
    return [(pair[0], pair[1]) for pair in past]


def logical_bytes(pairs: Iterable[KvPair]) -> int:
    """Bytes the tensors logically occupy, independent of any allocator."""
    return sum(tensor.numel() * tensor.element_size() for pair in pairs for tensor in pair)


def slice_suffix(pairs: Sequence[KvPair], prefix_tokens: int) -> list[KvPair]:
    """Independently owned copies of only the per-session portion of a cache."""
    return [(key[:, :, prefix_tokens:, :].clone(), value[:, :, prefix_tokens:, :].clone()) for key, value in pairs]


def as_cache(pairs: Sequence[KvPair]) -> Any:
    """Build a fresh cache object over existing tensors, without copying them.

    Forward passes extend a cache by concatenation, which allocates new tensors, so
    the shared prefix tensors are left unmodified and can back every session.
    """
    from transformers import DynamicCache

    cache = DynamicCache()
    for index, (key, value) in enumerate(pairs):
        cache.update(key, value, index)
    return cache


def clone_pairs(pairs: Sequence[KvPair]) -> list[KvPair]:
    """Independently owned copies of every layer's key and value tensors."""
    return [(key.clone(), value.clone()) for key, value in pairs]


def splice_kv_pairs(
    recipient: Sequence[KvPair],
    donor: Sequence[KvPair],
    match_masks: Sequence[Any],
) -> list[KvPair]:
    """Organizational rhyme-KV splice: copy donor cells into recipient where masks are true.

    Position axis is dim 2 (batch, heads, positions, head_dim). Matching slots are the
    nested-story positions that measured as shareable; non-matching slots stay private
    to the recipient. This is the tensor-level rhyme share path — not exact-prefix reuse.
    """
    if len(recipient) != len(donor) or len(recipient) != len(match_masks):
        raise ValueError("recipient, donor and match_masks must have one entry per layer")
    spliced: list[KvPair] = []
    for (r_key, r_value), (d_key, d_value), mask in zip(recipient, donor, match_masks, strict=True):
        key = r_key.clone()
        value = r_value.clone()
        # mask: [positions] bool — broadcast onto (batch, heads, positions, head_dim)
        key[:, :, mask, :] = d_key[:, :, mask, :]
        value[:, :, mask, :] = d_value[:, :, mask, :]
        spliced.append((key, value))
    return spliced


def rhyme_kv_residency_bytes(
    full_kv_bytes_one_session: int,
    matching_cell_fraction: float,
    sessions: int,
) -> dict[str, float | int]:
    """Bytes if matching KV cells are stored once and non-matching cells stay private.

    ``matching_cell_fraction`` must come from a tensor meter (not a JSON byte fraction).
    Serving may only claim this saving when a spliced-cache resume stays logit-equivalent.
    """
    if sessions < 1:
        raise ValueError("sessions must be >= 1")
    fraction = max(0.0, min(1.0, float(matching_cell_fraction)))
    shared = fraction * full_kv_bytes_one_session
    private = (1.0 - fraction) * full_kv_bytes_one_session
    naive = sessions * full_kv_bytes_one_session
    tiny = shared + sessions * private
    return {
        "sessions": sessions,
        "fullKvBytesOneSession": full_kv_bytes_one_session,
        "matchingCellFraction": fraction,
        "sharedSpineBytes": int(round(shared)),
        "privateBytesPerSession": int(round(private)),
        "naiveBytes": int(naive),
        "rhymeKvBytes": int(round(tiny)),
        "reductionVersusNaive": 0.0 if naive == 0 else 1.0 - tiny / naive,
        "reductionVersusPrefixWhenNoExactHits": 0.0 if naive == 0 else 1.0 - tiny / naive,
    }
