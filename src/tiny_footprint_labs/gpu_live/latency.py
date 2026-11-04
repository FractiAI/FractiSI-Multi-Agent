"""Materialization latency with versus without Tiny Footprint, on a real NVIDIA device.

Without: each turn copies full duplicated system and KV buffers per session.
With: one shared system copy plus a compact per-session delta copy.
"""

from __future__ import annotations

import time
from ctypes import c_char, create_string_buffer
from typing import Any

from tiny_footprint_labs.common.stats import ratio, summarize_ms
from tiny_footprint_labs.gpu_live.accounting import payload_accounting
from tiny_footprint_labs.gpu_live.cuda import CudaAlloc

HONESTY = (
    "Wall-clock cuMemcpyHtoD + cuCtxSynchronize on this GPU for "
    "with/without Tiny Footprint materialization. Not frontier LLM decode TTFT/TPS."
)


def _filled_buffer(size: int, value: int) -> Any:
    """A host buffer with non-zero pages, so the driver cannot trivially elide the copy."""
    buffer = create_string_buffer(size)
    for index in range(0, size, 4096):
        buffer[index] = c_char(value)
    return buffer


def measure_latency(cuda: CudaAlloc, sessions: int, sys_bytes: int, kv_bytes: int, trials: int = 24) -> dict[str, Any]:
    """Time per-turn materialization and session bring-up in both arms."""
    payload = payload_accounting(sessions, sys_bytes, kv_bytes)
    host_sys_n = payload["hostSysBytes"]
    host_kv_n = payload["hostKvBytes"]
    host_delta_n = payload["hostDeltaBytes"]
    host_sys = _filled_buffer(host_sys_n, 1)
    host_kv = _filled_buffer(host_kv_n, 2)
    host_delta = _filled_buffer(host_delta_n, 3)

    conv_sys = [cuda.alloc(host_sys_n) for _ in range(sessions)]
    conv_kv = [cuda.alloc(host_kv_n) for _ in range(sessions)]
    tiny_sys = cuda.alloc(host_sys_n)
    tiny_delta = [cuda.alloc(host_delta_n) for _ in range(sessions)]

    def conv_turn() -> float:
        cuda.sync()
        start = time.perf_counter()
        for index in range(sessions):
            cuda.htod(conv_sys[index], host_sys, host_sys_n)
            cuda.htod(conv_kv[index], host_kv, host_kv_n)
        cuda.sync()
        return (time.perf_counter() - start) * 1000.0

    def tiny_turn() -> float:
        cuda.sync()
        start = time.perf_counter()
        cuda.htod(tiny_sys, host_sys, host_sys_n)
        for index in range(sessions):
            cuda.htod(tiny_delta[index], host_delta, host_delta_n)
        cuda.sync()
        return (time.perf_counter() - start) * 1000.0

    for _ in range(3):
        conv_turn()
        tiny_turn()
    conv_samples = [conv_turn() for _ in range(trials)]
    tiny_samples = [tiny_turn() for _ in range(trials)]

    def bringup(sizes: list[int]) -> float:
        pointers: list[int] = []
        start = time.perf_counter()
        for size in sizes:
            pointers.append(cuda.alloc(size))
        cuda.sync()
        elapsed = (time.perf_counter() - start) * 1000.0
        for pointer in pointers:
            cuda.free(pointer)
        return elapsed

    conventional_sizes = [size for _ in range(sessions) for size in (host_sys_n, host_kv_n)]
    tiny_sizes = [host_sys_n, *([host_delta_n] * sessions)]
    bring_conv = [bringup(conventional_sizes) for _ in range(8)]
    bring_tiny = [bringup(tiny_sizes) for _ in range(8)]

    conv_turn_s = summarize_ms(conv_samples)
    tiny_turn_s = summarize_ms(tiny_samples)
    conv_bring_s = summarize_ms(bring_conv)
    tiny_bring_s = summarize_ms(bring_tiny)
    turn_ratio = ratio(tiny_turn_s["p50Ms"], conv_turn_s["p50Ms"])
    bring_ratio = ratio(tiny_bring_s["p50Ms"], conv_bring_s["p50Ms"])

    return {
        "metric": "chat_stack_materialization_latency",
        "honesty": HONESTY,
        "trials": trials,
        "payloadBytesPerTurn": {
            "conventional": payload["conventional"],
            "tinyFootprint": payload["tinyFootprint"],
            "trafficReductionRatio": payload["trafficReductionRatio"],
        },
        "withoutTinyFootprint": {
            "label": "conventional_duplicated_resident_state",
            "turnMaterializeMs": conv_turn_s,
            "sessionBringupMs": conv_bring_s,
        },
        "withTinyFootprint": {
            "label": "shared_pattern_plus_deltas",
            "turnMaterializeMs": tiny_turn_s,
            "sessionBringupMs": tiny_bring_s,
        },
        "comparison": {
            "turnP50RatioTinyOverConventional": turn_ratio,
            "bringupP50RatioTinyOverConventional": bring_ratio,
            "turnFasterWithTinyFootprint": bool(turn_ratio is not None and turn_ratio < 1.0),
            "bringupFasterWithTinyFootprint": bool(bring_ratio is not None and bring_ratio < 1.0),
            "turnSpeedup": (1.0 / turn_ratio) if turn_ratio else None,
            "bringupSpeedup": (1.0 / bring_ratio) if bring_ratio else None,
        },
        # Soft gate: Tiny Footprint must not be >25% slower on turn p50.
        "passLatencyGate": bool(turn_ratio is not None and turn_ratio <= 1.25),
    }
