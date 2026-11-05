"""Summaries of timing samples, in the field layout the receipts have always used."""

from __future__ import annotations

import statistics
from collections.abc import Sequence


def summarize_ms(samples: Sequence[float]) -> dict[str, float | int | None]:
    """Summarize millisecond samples, keeping an empty sample distinct from zero."""
    if not samples:
        return {"n": 0, "meanMs": None, "p50Ms": None, "p95Ms": None, "minMs": None, "maxMs": None}
    ordered = sorted(samples)
    n = len(ordered)
    p50 = ordered[n // 2] if n % 2 == 1 else 0.5 * (ordered[n // 2 - 1] + ordered[n // 2])
    p95 = ordered[min(n - 1, int(0.95 * (n - 1)))]
    return {
        "n": n,
        "meanMs": statistics.fmean(ordered),
        "p50Ms": p50,
        "p95Ms": p95,
        "minMs": ordered[0],
        "maxMs": ordered[-1],
    }


def ratio(numerator: float | None, denominator: float | None) -> float | None:
    """Return ``numerator / denominator``, or None when either side is unavailable."""
    if numerator is None or denominator is None or denominator == 0:
        return None
    return numerator / denominator
