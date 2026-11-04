from pathlib import Path
from typing import Any

import pytest

from tiny_footprint_labs.llm.training import measure_training


def test_both_arms_run_warmed_and_report_their_optimizer_copies(tiny_model_dir: Path) -> None:
    torch = pytest.importorskip("torch")
    transformers = pytest.importorskip("transformers")

    def factory() -> Any:
        return transformers.AutoModelForCausalLM.from_pretrained(tiny_model_dir)

    batches = [torch.tensor([[1, 2, 3, 4]]), torch.tensor([[5, 6, 7, 8]])]
    result = measure_training(factory, batches, "cpu", steps=3, warmup=1, seed=1)
    assert result["withoutTinyFootprint"]["optimizerCopies"] == 2
    assert result["withTinyFootprint"]["optimizerCopies"] == 1
    assert result["withoutTinyFootprint"]["stepMs"]["n"] == 3
    assert result["comparison"]["stepP50Speedup"] > 0
    assert "interleaved" in result["order"] or "alternating" in result["order"]
