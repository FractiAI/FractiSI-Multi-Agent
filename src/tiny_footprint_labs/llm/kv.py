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
