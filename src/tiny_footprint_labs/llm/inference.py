"""Timing and equivalence for real forward passes with and without a shared prefix.

Both arms use the identical token ids, built by concatenating the tokenized prefix
and suffix, so tokenizer boundary effects cannot differ between them. Decode is an
explicit greedy loop rather than ``generate``, because the arms must agree on what
a cache contains and that loop's meaning does not change between library versions.
"""

from __future__ import annotations

import random
import time
from collections.abc import Sequence
from typing import Any

from tiny_footprint_labs.common.stats import ratio, summarize_ms
from tiny_footprint_labs.llm.device import sync_device
from tiny_footprint_labs.llm.kv import KvPair, as_cache, kv_pairs

ARM_WITHOUT = "without"
ARM_WITH = "with"


def run_forward(model: Any, input_ids: Any, past_pairs: Sequence[KvPair] | None) -> Any:
    """One forward pass; the prefix KV, when given, is wrapped in a fresh cache."""
    import torch

    with torch.no_grad():
        return model(
            input_ids=input_ids,
            past_key_values=None if past_pairs is None else as_cache(past_pairs),
            use_cache=True,
        )


def greedy_decode(model: Any, first_output: Any, new_tokens: int) -> list[int]:
    """Greedy decode from a completed prefill."""
    import torch

    output = first_output
    tokens: list[int] = []
    with torch.no_grad():
        for _ in range(new_tokens):
            next_id = output.logits[:, -1, :].argmax(dim=-1, keepdim=True)
            tokens.append(int(next_id.item()))
            output = model(input_ids=next_id, past_key_values=output.past_key_values, use_cache=True)
    return tokens


def timed_turn(
    model: Any,
    backend: str,
    arm: str,
    full_ids: Any,
    suffix_ids: Any,
    prefix_pairs: Sequence[KvPair],
    new_tokens: int,
) -> tuple[float, float]:
    """Run one turn in one arm and return (prefill ms, decode ms)."""
    sync_device(backend)
    start = time.perf_counter()
    output = run_forward(model, full_ids, None) if arm == ARM_WITHOUT else run_forward(model, suffix_ids, prefix_pairs)
    _ = output.logits
    sync_device(backend)
    prefill_ms = (time.perf_counter() - start) * 1000.0

    start = time.perf_counter()
    greedy_decode(model, output, new_tokens)
    sync_device(backend)
    decode_ms = (time.perf_counter() - start) * 1000.0
    return prefill_ms, decode_ms


def measure_timing(
    model: Any,
    backend: str,
    prefix_ids: Any,
    suffix_ids_per_turn: Sequence[Any],
    new_tokens: int,
    trials: int,
    warmup: int,
    seed: int,
) -> dict[str, Any]:
    """Time both arms, interleaved in seeded random order to spread drift across them.

    The prefix prefill runs once per trial and is charged to the "with" arm, because
    that arm has to pay for it exactly once. Per-turn samples exclude it; per-trial
    totals include it.
    """
    import torch

    rng = random.Random(seed)
    full_ids_per_turn = [torch.cat([prefix_ids, suffix], dim=1) for suffix in suffix_ids_per_turn]
    calls: dict[str, dict[str, list[float]]] = {arm: {"prefill": [], "decode": []} for arm in (ARM_WITHOUT, ARM_WITH)}
    totals: dict[str, dict[str, list[float]]] = {arm: {"prefill": [], "decode": []} for arm in (ARM_WITHOUT, ARM_WITH)}
    prefix_prefill_ms: list[float] = []

    def timed_prefix() -> tuple[float, list[KvPair]]:
        sync_device(backend)
        start = time.perf_counter()
        output = run_forward(model, prefix_ids, None)
        pairs = kv_pairs(output.past_key_values)
        sync_device(backend)
        return (time.perf_counter() - start) * 1000.0, pairs

    _, warm_pairs = timed_prefix()
    for _ in range(warmup):
        for arm in (ARM_WITHOUT, ARM_WITH):
            timed_turn(model, backend, arm, full_ids_per_turn[0], suffix_ids_per_turn[0], warm_pairs, new_tokens)

    for _ in range(trials):
        prefix_ms, prefix_pairs = timed_prefix()
        prefix_prefill_ms.append(prefix_ms)
        trial_total = {arm: {"prefill": 0.0, "decode": 0.0} for arm in (ARM_WITHOUT, ARM_WITH)}
        trial_total[ARM_WITH]["prefill"] += prefix_ms
        for full_ids, suffix_ids in zip(full_ids_per_turn, suffix_ids_per_turn, strict=True):
            order = [ARM_WITHOUT, ARM_WITH]
            rng.shuffle(order)
            for arm in order:
                prefill_ms, decode_ms = timed_turn(model, backend, arm, full_ids, suffix_ids, prefix_pairs, new_tokens)
                calls[arm]["prefill"].append(prefill_ms)
                calls[arm]["decode"].append(decode_ms)
                trial_total[arm]["prefill"] += prefill_ms
                trial_total[arm]["decode"] += decode_ms
        for arm in (ARM_WITHOUT, ARM_WITH):
            totals[arm]["prefill"].append(trial_total[arm]["prefill"])
            totals[arm]["decode"].append(trial_total[arm]["decode"])

    def arm_report(arm: str) -> dict[str, Any]:
        return {
            "prefillCallMs": summarize_ms(calls[arm]["prefill"]),
            "decodeCallMs": summarize_ms(calls[arm]["decode"]),
            "prefillBatchMs": summarize_ms(totals[arm]["prefill"]),
            "decodeBatchMs": summarize_ms(totals[arm]["decode"]),
            "prefillCallSamplesMs": calls[arm]["prefill"],
            "prefillBatchSamplesMs": totals[arm]["prefill"],
            "decodeBatchSamplesMs": totals[arm]["decode"],
        }

    without = arm_report(ARM_WITHOUT)
    with_arm = arm_report(ARM_WITH)
    return {
        "order": "interleaved within each turn in seeded random order",
        "withoutTinyFootprint": without,
        "withTinyFootprint": with_arm,
        "prefixPrefillMs": summarize_ms(prefix_prefill_ms),
        "comparison": {
            "prefillP50Speedup": ratio(without["prefillBatchMs"]["p50Ms"], with_arm["prefillBatchMs"]["p50Ms"]),
            "prefillCallP50Speedup": ratio(without["prefillCallMs"]["p50Ms"], with_arm["prefillCallMs"]["p50Ms"]),
            "decodeP50Speedup": ratio(without["decodeBatchMs"]["p50Ms"], with_arm["decodeBatchMs"]["p50Ms"]),
        },
    }


def _compare_arms(
    model: Any,
    cache_prefix_ids: Any,
    prefix_ids: Any,
    suffix_ids_per_turn: Sequence[Any],
    new_tokens: int,
    tolerance: float,
) -> dict[str, Any]:
    """Compare a full prefill of prefix and suffix with a resume from a cache of ``cache_prefix_ids``."""
    import torch

    output = run_forward(model, cache_prefix_ids, None)
    prefix_pairs = kv_pairs(output.past_key_values)
    worst = 0.0
    token_sequences_equal = 0
    for suffix_ids in suffix_ids_per_turn:
        full_ids = torch.cat([prefix_ids, suffix_ids], dim=1)
        without = run_forward(model, full_ids, None)
        with_arm = run_forward(model, suffix_ids, prefix_pairs)
        difference = (without.logits[:, -1, :] - with_arm.logits[:, -1, :]).abs().max().item()
        worst = max(worst, float(difference))
        if greedy_decode(model, without, new_tokens) == greedy_decode(model, with_arm, new_tokens):
            token_sequences_equal += 1
    turns = len(suffix_ids_per_turn)
    return {
        "turns": turns,
        "worstLogitAbsDifference": worst,
        "tokenSequencesEqual": token_sequences_equal,
        "equivalent": worst <= tolerance and token_sequences_equal == turns,
    }


def check_equivalence(
    model: Any,
    prefix_ids: Any,
    suffix_ids_per_turn: Sequence[Any],
    new_tokens: int,
    tolerance: float,
) -> dict[str, Any]:
    """Compare logits and greedy tokens between the two arms, and test the comparison itself.

    The control resumes from a cache built from the prefix in reverse token order, which
    no correct server would use. A model whose outputs barely depend on context still
    compares as equivalent then, and the receipt records that its check shows nothing.
    """
    arms = _compare_arms(model, prefix_ids, prefix_ids, suffix_ids_per_turn, new_tokens, tolerance)
    wrong = _compare_arms(model, prefix_ids.flip(dims=[1]), prefix_ids, suffix_ids_per_turn, new_tokens, tolerance)
    return {
        "checked": "last-position logits and greedy tokens, without versus with the shared prefix",
        "newTokens": new_tokens,
        "logitTolerance": tolerance,
        **arms,
        "control": {
            "kind": "cache built from the prefix in reverse token order",
            "worstLogitAbsDifference": wrong["worstLogitAbsDifference"],
            "tokenSequencesEqual": wrong["tokenSequencesEqual"],
            "detected": not wrong["equivalent"],
        },
    }
