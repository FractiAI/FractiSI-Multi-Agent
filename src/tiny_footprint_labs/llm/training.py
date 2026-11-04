"""Training-step microbenchmark: one optimizer versus duplicated optimizer state.

The "without" arm steps several optimizers over the same model, a deliberate
anti-pattern carried over from the original lab. It measures what duplicated
optimizer state costs. It says nothing about any real training configuration.

Both arms do the same number of forward, backward and optimizer steps per round.
They warm up first and then alternate in seeded random order: without that, the arm
that happens to run first absorbs accelerator shader compilation and looks slower.
"""

from __future__ import annotations

import random
import time
from collections.abc import Sequence
from typing import Any

from tiny_footprint_labs.common.stats import ratio, summarize_ms
from tiny_footprint_labs.llm.device import sync_device


def _run_round(model: Any, pairs: Sequence[tuple[Any, Any]], backend: str) -> float:
    sync_device(backend)
    start = time.perf_counter()
    for optimizer, batch in pairs:
        optimizer.zero_grad(set_to_none=True)
        loss = model(input_ids=batch, labels=batch).loss
        loss.backward()
        optimizer.step()
    sync_device(backend)
    return (time.perf_counter() - start) * 1000.0


def measure_training(
    model_factory: Any,
    encoded: Sequence[Any],
    backend: str,
    steps: int,
    warmup: int = 2,
    seed: int = 20261103,
) -> dict[str, Any]:
    """Time optimizer rounds in both arms, warmed up and interleaved."""
    import torch

    def prepare(copies: int) -> list[tuple[Any, Any]]:
        model = model_factory()
        model.train()
        optimizers = [torch.optim.AdamW(model.parameters(), lr=1e-4) for _ in range(copies)]
        return [(model, [(optimizers[i % copies], batch) for i, batch in enumerate(encoded)])]

    arms: dict[str, Any] = {"without": prepare(len(encoded))[0], "with": prepare(1)[0]}
    for _ in range(warmup):
        for model, pairs in arms.values():
            _run_round(model, pairs, backend)

    rng = random.Random(seed)
    samples: dict[str, list[float]] = {"without": [], "with": []}
    for _ in range(steps):
        order = ["without", "with"]
        rng.shuffle(order)
        for name in order:
            model, pairs = arms[name]
            samples[name].append(_run_round(model, pairs, backend))

    without_step = summarize_ms(samples["without"])
    with_step = summarize_ms(samples["with"])
    without = {"stepMs": without_step, "optimizerCopies": len(encoded)}
    with_arm = {"stepMs": with_step, "optimizerCopies": 1}
    speedup = ratio(without_step["p50Ms"], with_step["p50Ms"])
    return {
        "order": "warmed up, then alternating in seeded random order",
        "warmup": warmup,
        "withoutTinyFootprint": without,
        "withTinyFootprint": with_arm,
        "comparison": {"stepP50Speedup": speedup, "fasterWithTinyFootprint": bool(speedup and speedup > 1.0)},
    }
