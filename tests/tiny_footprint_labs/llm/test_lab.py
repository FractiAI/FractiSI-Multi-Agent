import sys
from pathlib import Path

import pytest

from tiny_footprint_labs.common.receipt import LabNotRunnable
from tiny_footprint_labs.llm.lab import HONESTY, _load_stack, device_label, host_cpu_name, load_float32_model, run_lab


def test_a_real_run_produces_a_complete_receipt(tiny_model_dir: Path) -> None:
    report = run_lab(
        model_id=str(tiny_model_dir),
        backend_preference="cpu",
        sessions=2,
        user_turns=2,
        new_tokens=2,
        trials=2,
        warmup=1,
        train_steps=2,
        prefix_tokens=32,
        materialize_trials=1,
        logit_tolerance=1e-3,
    )
    assert report["ok"] is True
    assert report["status"] == "pass"
    assert report["labKind"] == "real_llm_local_cpu"
    assert report["passRealLlmGate"] is False, "a CPU run does not count as the accelerator lab"
    assert report["equivalence"]["equivalent"] is True
    assert report["workload"]["prefixTokens"] == 32
    assert report["residency"]["reduction"]["logical"] > 0
    assert report["training"]["comparison"]["stepP50Speedup"] > 0
    assert report["software"]["torch"]


def test_training_can_be_skipped(tiny_model_dir: Path) -> None:
    report = run_lab(
        model_id=str(tiny_model_dir),
        backend_preference="cpu",
        sessions=2,
        user_turns=1,
        new_tokens=1,
        trials=1,
        warmup=0,
        train_steps=0,
        prefix_tokens=16,
        materialize_trials=1,
        logit_tolerance=1e-3,
    )
    assert report["training"] is None


def test_it_says_it_tests_prefix_reuse() -> None:
    assert "prefix cache" in HONESTY


def test_the_device_is_named_after_what_ran() -> None:
    torch = pytest.importorskip("torch")
    assert host_cpu_name()
    assert device_label(torch, "cpu") == host_cpu_name()


def test_loading_uses_float32(tiny_model_dir: Path) -> None:
    torch = pytest.importorskip("torch")
    transformers = pytest.importorskip("transformers")
    model = load_float32_model(transformers.AutoModelForCausalLM, torch, str(tiny_model_dir), None)
    assert next(model.parameters()).dtype == torch.float32


def test_a_missing_stack_is_not_runnable() -> None:
    saved = {name: sys.modules.get(name) for name in ("torch", "transformers")}
    sys.modules["transformers"] = None  # type: ignore[assignment]
    try:
        with pytest.raises(LabNotRunnable) as caught:
            _load_stack()
        assert caught.value.reason == "llm_stack_unavailable"
    finally:
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module
