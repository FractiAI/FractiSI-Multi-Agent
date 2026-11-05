import pytest

from tiny_footprint_labs.common.receipt import LabNotRunnable
from tiny_footprint_labs.llm.device import allocated_bytes, pick_device, release_memory, sync_device


def test_cpu_can_always_be_chosen_and_has_no_allocator_reading() -> None:
    torch = pytest.importorskip("torch")
    device, backend = pick_device("cpu")
    assert backend == "cpu"
    assert device == torch.device("cpu")
    assert allocated_bytes("cpu") is None
    sync_device("cpu")
    release_memory("cpu")


def test_automatic_choice_returns_a_usable_device() -> None:
    torch = pytest.importorskip("torch")
    device, backend = pick_device("auto")
    assert backend in {"cpu", "cuda", "mps", "directml"}
    assert torch.zeros(1).to(device).shape == (1,)


def test_an_unavailable_backend_means_not_run_rather_than_a_silent_fallback() -> None:
    torch = pytest.importorskip("torch")
    if not torch.cuda.is_available():
        with pytest.raises(LabNotRunnable, match="unavailable") as caught:
            pick_device("cuda")
        assert caught.value.reason == "backend_unavailable"


def test_an_accelerator_reports_allocations_when_present() -> None:
    torch = pytest.importorskip("torch")
    if torch.backends.mps.is_available():
        before = allocated_bytes("mps")
        tensor = torch.zeros(1024 * 1024, device="mps")
        sync_device("mps")
        assert allocated_bytes("mps") > before
        del tensor
        release_memory("mps")
