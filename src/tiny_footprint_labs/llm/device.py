"""Accelerator selection, synchronization and allocator readings."""

from __future__ import annotations

import gc
from typing import Any

from tiny_footprint_labs.common.receipt import LabNotRunnable


def pick_device(prefer: str = "auto") -> tuple[Any, str]:
    """Return the torch device and backend name; ``prefer`` may force one backend."""
    import torch

    if prefer == "cpu":
        return torch.device("cpu"), "cpu"
    if prefer in ("auto", "cuda") and torch.cuda.is_available():
        return torch.device("cuda"), "cuda"
    if prefer in ("auto", "mps") and torch.backends.mps.is_available():
        return torch.device("mps"), "mps"
    if prefer in ("auto", "directml"):
        try:
            import torch_directml

            return torch_directml.device(), "directml"
        except ImportError:
            pass
    if prefer != "auto":
        raise LabNotRunnable("backend_unavailable", f"requested backend unavailable: {prefer}")
    return torch.device("cpu"), "cpu"


def sync_device(backend: str) -> None:
    """Wait for queued accelerator work, so timers bound real execution."""
    import torch

    if backend == "cuda":
        torch.cuda.synchronize()
    elif backend == "mps":
        torch.mps.synchronize()


def allocated_bytes(backend: str) -> int | None:
    """Device allocator reading, or None where this backend exposes none."""
    import torch

    if backend == "cuda":
        return int(torch.cuda.memory_allocated())
    if backend == "mps":
        return int(torch.mps.current_allocated_memory())
    return None


def release_memory(backend: str) -> None:
    """Collect garbage and return cached blocks, before an allocator reading."""
    import torch

    gc.collect()
    if backend == "cuda":
        torch.cuda.empty_cache()
    elif backend == "mps":
        torch.mps.synchronize()
        torch.mps.empty_cache()
