"""Measured key-value residency: N sessions held live, duplicated versus shared-prefix.

This is the memory half of the claim, measured on real tensors rather than assumed.
Holding a shared prefix once means a session's own tensors cover only its suffix, so
continuing a session requires concatenating them first. ``materializeMs`` is what
that costs per turn, and ``concatEquivalent`` shows the result matches the original.
"""

from __future__ import annotations

import time
from collections.abc import Sequence
from typing import Any

from tiny_footprint_labs.common.stats import summarize_ms
from tiny_footprint_labs.llm.device import allocated_bytes, release_memory, sync_device
from tiny_footprint_labs.llm.inference import run_forward
from tiny_footprint_labs.llm.kv import (
    KvPair,
    kv_bytes_per_token,
    kv_pairs,
    logical_bytes,
    shared_prefix_reduction,
    slice_suffix,
)


def _owned(pairs: Sequence[KvPair]) -> list[KvPair]:
    return [(key.clone(), value.clone()) for key, value in pairs]


def _delta(backend: str, before: int | None) -> int | None:
    sync_device(backend)
    after = allocated_bytes(backend)
    if before is None or after is None:
        return None
    return after - before


def measure_residency(
    model: Any,
    backend: str,
    prefix_ids: Any,
    suffix_ids_per_session: Sequence[Any],
    dtype_bytes: int,
    materialize_trials: int,
) -> dict[str, Any]:
    """Hold every session's KV live under both designs and read the allocator."""
    import torch

    config = model.config
    sessions = len(suffix_ids_per_session)
    prefix_tokens = int(prefix_ids.shape[1])
    suffix_tokens = int(suffix_ids_per_session[0].shape[1])
    head_dim = config.n_embd // config.n_head
    per_token = kv_bytes_per_token(config.n_layer, config.n_head, head_dim, dtype_bytes)

    release_memory(backend)
    before = allocated_bytes(backend)
    duplicated: list[list[KvPair]] = []
    for suffix_ids in suffix_ids_per_session:
        full_ids = torch.cat([prefix_ids, suffix_ids], dim=1)
        duplicated.append(_owned(kv_pairs(run_forward(model, full_ids, None).past_key_values)))
    release_memory(backend)
    duplicated_device = _delta(backend, before)
    duplicated_logical = sum(logical_bytes(pairs) for pairs in duplicated)
    reference = duplicated[0]

    before_shared = allocated_bytes(backend)
    shared_prefix = _owned(kv_pairs(run_forward(model, prefix_ids, None).past_key_values))
    suffixes = [
        slice_suffix(kv_pairs(run_forward(model, suffix_ids, shared_prefix).past_key_values), prefix_tokens)
        for suffix_ids in suffix_ids_per_session
    ]
    release_memory(backend)
    shared_device = _delta(backend, before_shared)
    shared_logical = logical_bytes(shared_prefix) + sum(logical_bytes(pairs) for pairs in suffixes)

    samples: list[float] = []
    rebuilt: list[KvPair] = []
    for _ in range(materialize_trials):
        sync_device(backend)
        start = time.perf_counter()
        rebuilt = [
            (torch.cat([p_key, s_key], dim=2), torch.cat([p_value, s_value], dim=2))
            for (p_key, p_value), (s_key, s_value) in zip(shared_prefix, suffixes[0], strict=True)
        ]
        sync_device(backend)
        samples.append((time.perf_counter() - start) * 1000.0)
    worst = max(
        float((original - candidate).abs().max().item())
        for original_pair, candidate_pair in zip(reference, rebuilt, strict=True)
        for original, candidate in zip(original_pair, candidate_pair, strict=True)
    )
    del duplicated, reference, rebuilt, suffixes, shared_prefix
    release_memory(backend)

    duplicated_formula = sessions * (prefix_tokens + suffix_tokens) * per_token
    shared_formula = (prefix_tokens + sessions * suffix_tokens) * per_token
    return {
        "sessions": sessions,
        "prefixTokens": prefix_tokens,
        "suffixTokens": suffix_tokens,
        "kvBytesPerTokenFormula": per_token,
        "duplicated": {
            "formulaBytes": duplicated_formula,
            "logicalBytes": duplicated_logical,
            "deviceAllocatedBytes": duplicated_device,
        },
        "shared": {
            "formulaBytes": shared_formula,
            "logicalBytes": shared_logical,
            "deviceAllocatedBytes": shared_device,
        },
        "reduction": {
            "predicted": shared_prefix_reduction(sessions, prefix_tokens, suffix_tokens),
            "logical": 1.0 - shared_logical / duplicated_logical,
            "device": (
                1.0 - shared_device / duplicated_device if shared_device is not None and duplicated_device else None
            ),
        },
        "materializeMs": summarize_ms(samples),
        "concatWorstAbsDifference": worst,
    }
