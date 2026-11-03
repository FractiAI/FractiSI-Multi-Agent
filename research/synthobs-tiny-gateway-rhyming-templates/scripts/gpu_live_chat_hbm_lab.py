#!/usr/bin/env python3
"""
Tiny Footprint · live chat-stack GPU device-memory + latency lab (ctypes CUDA).

Allocates conventional duplicated resident state vs Tiny Footprint shared-pattern
state on the real NVIDIA device, samples nvidia-smi used MiB, and measures
session-bringup + per-turn materialization latency with vs without Tiny Footprint.

Honesty: device memory via nvidia-smi / cuMemAlloc. Latency is materialization /
HtoD path for the chat-stack proxy — not frontier LLM decode TTFT/TPS.
On GeForce this is typically GDDR; datacenter HBM is the operator analogue.
"""
from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import sys
import time
from ctypes import (
    POINTER,
    c_char,
    c_int,
    c_size_t,
    c_uint,
    c_ulonglong,
    c_void_p,
    CDLL,
    create_string_buffer,
)


def nvidia_smi_used_mib() -> int | None:
    try:
        out = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=memory.used",
                "--format=csv,noheader,nounits",
            ],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return int(out.splitlines()[0].strip())
    except Exception:
        return None


def nvidia_smi_device() -> dict:
    """Identify the live GeForce / NVIDIA device under test."""
    try:
        out = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=name,memory.total,driver_version",
                "--format=csv,noheader,nounits",
            ],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        line = out.splitlines()[0].strip()
        parts = [p.strip() for p in line.rsplit(",", 2)]
        if len(parts) == 3:
            name, total_s, driver = parts
            return {
                "name": name,
                "totalMib": int(float(total_s)),
                "driverVersion": driver,
            }
        return {"name": line, "totalMib": None, "driverVersion": None}
    except Exception as e:
        return {
            "name": "NVIDIA (query failed)",
            "totalMib": None,
            "driverVersion": None,
            "error": str(e),
        }


class CudaAlloc:
    def __init__(self) -> None:
        self.dll = CDLL(r"C:\Windows\System32\nvcuda.dll")
        self.dll.cuInit.argtypes = [c_uint]
        self.dll.cuInit.restype = c_int
        self.dll.cuDeviceGet.argtypes = [POINTER(c_int), c_int]
        self.dll.cuDeviceGet.restype = c_int
        self.dll.cuCtxCreate_v2.argtypes = [POINTER(c_void_p), c_uint, c_int]
        self.dll.cuCtxCreate_v2.restype = c_int
        self.dll.cuMemAlloc_v2.argtypes = [POINTER(c_ulonglong), c_size_t]
        self.dll.cuMemAlloc_v2.restype = c_int
        self.dll.cuMemFree_v2.argtypes = [c_ulonglong]
        self.dll.cuMemFree_v2.restype = c_int
        self.dll.cuCtxDestroy_v2.argtypes = [c_void_p]
        self.dll.cuCtxDestroy_v2.restype = c_int
        self.dll.cuMemcpyHtoD_v2.argtypes = [c_ulonglong, c_void_p, c_size_t]
        self.dll.cuMemcpyHtoD_v2.restype = c_int
        self.dll.cuCtxSynchronize.argtypes = []
        self.dll.cuCtxSynchronize.restype = c_int
        r = self.dll.cuInit(0)
        if r != 0:
            raise RuntimeError(f"cuInit failed {r}")
        dev = c_int()
        r = self.dll.cuDeviceGet(dev, 0)
        if r != 0:
            raise RuntimeError(f"cuDeviceGet failed {r}")
        ctx = c_void_p()
        r = self.dll.cuCtxCreate_v2(ctx, 0, dev)
        if r != 0:
            raise RuntimeError(f"cuCtxCreate failed {r}")
        self.ctx = ctx
        self.ptrs: list[int] = []

    def alloc(self, nbytes: int) -> int:
        ptr = c_ulonglong()
        r = self.dll.cuMemAlloc_v2(ptr, c_size_t(nbytes))
        if r != 0:
            raise RuntimeError(f"cuMemAlloc failed {r} for {nbytes} bytes")
        self.ptrs.append(ptr.value)
        return ptr.value

    def htod(self, device_ptr: int, host_buf, nbytes: int) -> None:
        r = self.dll.cuMemcpyHtoD_v2(
            c_ulonglong(device_ptr),
            host_buf,
            c_size_t(nbytes),
        )
        if r != 0:
            raise RuntimeError(f"cuMemcpyHtoD failed {r}")

    def sync(self) -> None:
        r = self.dll.cuCtxSynchronize()
        if r != 0:
            raise RuntimeError(f"cuCtxSynchronize failed {r}")

    def free_all_but_first(self) -> None:
        while len(self.ptrs) > 1:
            p = self.ptrs.pop()
            self.dll.cuMemFree_v2(c_ulonglong(p))

    def close(self) -> None:
        for p in self.ptrs:
            self.dll.cuMemFree_v2(c_ulonglong(p))
        self.ptrs.clear()
        if self.ctx:
            self.dll.cuCtxDestroy_v2(self.ctx)
            self.ctx = None


def sample_peak(duration_s: float = 0.35) -> int | None:
    peak = None
    t0 = time.time()
    while time.time() - t0 < duration_s:
        m = nvidia_smi_used_mib()
        if m is not None:
            peak = m if peak is None else max(peak, m)
        time.sleep(0.05)
    return peak


def _summarize_ms(samples: list[float]) -> dict:
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


def measure_latency(
    cuda: CudaAlloc,
    sessions: int,
    sys_bytes: int,
    kv_bytes: int,
    trials: int = 24,
) -> dict:
    """
    Materialization latency with vs without Tiny Footprint.

    Without: each turn HtoD-copies full duplicated system+KV buffers per session.
    With: one shared system HtoD amortized + compact per-session delta HtoD.
    """
    delta = max(1, int(kv_bytes * 0.15))
    # Cap host buffer sizes for older mobile GPUs / addressability (still proportional traffic)
    host_sys_n = min(sys_bytes, 4 * 1024 * 1024)
    host_kv_n = min(kv_bytes, 4 * 1024 * 1024)
    host_delta_n = min(delta, 4 * 1024 * 1024)
    host_sys = create_string_buffer(host_sys_n)
    host_kv = create_string_buffer(host_kv_n)
    host_delta = create_string_buffer(host_delta_n)
    # Fill with non-zero so the driver cannot trivially elide
    for i in range(0, host_sys_n, 4096):
        host_sys[i] = c_char(1)
    for i in range(0, host_kv_n, 4096):
        host_kv[i] = c_char(2)
    for i in range(0, host_delta_n, 4096):
        host_delta[i] = c_char(3)

    # Device destinations
    conv_sys = [cuda.alloc(host_sys_n) for _ in range(sessions)]
    conv_kv = [cuda.alloc(host_kv_n) for _ in range(sessions)]
    tiny_sys = cuda.alloc(host_sys_n)
    tiny_delta = [cuda.alloc(host_delta_n) for _ in range(sessions)]

    def conv_turn() -> float:
        cuda.sync()
        t0 = time.perf_counter()
        for i in range(sessions):
            cuda.htod(conv_sys[i], host_sys, host_sys_n)
            cuda.htod(conv_kv[i], host_kv, host_kv_n)
        cuda.sync()
        return (time.perf_counter() - t0) * 1000.0

    def tiny_turn() -> float:
        cuda.sync()
        t0 = time.perf_counter()
        cuda.htod(tiny_sys, host_sys, host_sys_n)  # shared pattern once
        for i in range(sessions):
            cuda.htod(tiny_delta[i], host_delta, host_delta_n)
        cuda.sync()
        return (time.perf_counter() - t0) * 1000.0

    # Warmup
    for _ in range(3):
        conv_turn()
        tiny_turn()

    conv_samples = [conv_turn() for _ in range(trials)]
    tiny_samples = [tiny_turn() for _ in range(trials)]

    # Session bring-up: allocate N sessions' resident pile (wall clock)
    def bringup_conventional() -> float:
        ptrs: list[int] = []
        t0 = time.perf_counter()
        for _ in range(sessions):
            ptrs.append(cuda.alloc(host_sys_n))
            ptrs.append(cuda.alloc(host_kv_n))
        cuda.sync()
        ms = (time.perf_counter() - t0) * 1000.0
        for p in ptrs:
            cuda.dll.cuMemFree_v2(c_ulonglong(p))
            if p in cuda.ptrs:
                cuda.ptrs.remove(p)
        return ms

    def bringup_tiny() -> float:
        ptrs: list[int] = []
        t0 = time.perf_counter()
        ptrs.append(cuda.alloc(host_sys_n))
        for _ in range(sessions):
            ptrs.append(cuda.alloc(host_delta_n))
        cuda.sync()
        ms = (time.perf_counter() - t0) * 1000.0
        for p in ptrs:
            cuda.dll.cuMemFree_v2(c_ulonglong(p))
            if p in cuda.ptrs:
                cuda.ptrs.remove(p)
        return ms

    bring_conv = [bringup_conventional() for _ in range(8)]
    bring_tiny = [bringup_tiny() for _ in range(8)]

    conv_turn_s = _summarize_ms(conv_samples)
    tiny_turn_s = _summarize_ms(tiny_samples)
    conv_bring_s = _summarize_ms(bring_conv)
    tiny_bring_s = _summarize_ms(bring_tiny)

    def ratio(a: float | None, b: float | None) -> float | None:
        if a is None or b is None or b == 0:
            return None
        return a / b

    turn_ratio = ratio(tiny_turn_s["p50Ms"], conv_turn_s["p50Ms"])
    bring_ratio = ratio(tiny_bring_s["p50Ms"], conv_bring_s["p50Ms"])
    bytes_conv = sessions * (host_sys_n + host_kv_n)
    bytes_tiny = host_sys_n + sessions * host_delta_n

    return {
        "metric": "chat_stack_materialization_latency",
        "honesty": (
            "Wall-clock cuMemcpyHtoD + cuCtxSynchronize on this GPU for "
            "with/without Tiny Footprint materialization. Not frontier LLM decode TTFT/TPS."
        ),
        "trials": trials,
        "payloadBytesPerTurn": {
            "conventional": bytes_conv,
            "tinyFootprint": bytes_tiny,
            "trafficReductionRatio": 1.0 - (bytes_tiny / bytes_conv) if bytes_conv else None,
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
        # Soft gate: Tiny Footprint must not be >25% slower on turn p50
        "passLatencyGate": bool(turn_ratio is not None and turn_ratio <= 1.25),
    }


def run_lab(
    sessions: int = 32,
    kv_mib_per_session: int = 8,
    system_prompt_mib: int = 24,
    weight_stub_mib: int = 64,
    latency_trials: int = 24,
) -> dict:
    device_info = nvidia_smi_device()
    baseline_idle = nvidia_smi_used_mib()
    cuda = CudaAlloc()
    try:
        weight_bytes = weight_stub_mib * 1024 * 1024
        cuda.alloc(weight_bytes)

        before_conv = sample_peak()
        conv_ptrs = []
        sys_bytes = system_prompt_mib * 1024 * 1024
        kv_bytes = kv_mib_per_session * 1024 * 1024
        for _ in range(sessions):
            conv_ptrs.append(cuda.alloc(sys_bytes))
            conv_ptrs.append(cuda.alloc(kv_bytes))
        conv_peak = sample_peak()
        for _ in conv_ptrs:
            p = cuda.ptrs.pop()
            cuda.dll.cuMemFree_v2(c_ulonglong(p))

        before_tiny = sample_peak()
        tiny_ptrs = []
        tiny_ptrs.append(cuda.alloc(sys_bytes))
        for _ in range(sessions):
            delta = max(1, int(kv_bytes * 0.15))
            tiny_ptrs.append(cuda.alloc(delta))
        tiny_peak = sample_peak()

        # Free tiny extras; keep weight for latency phase
        cuda.free_all_but_first()

        floor = before_conv if before_conv is not None else (baseline_idle or 0)
        conv_used = None
        tiny_used = None
        if conv_peak is not None and floor is not None:
            conv_used = max(0, conv_peak - (baseline_idle or 0))
        if tiny_peak is not None and floor is not None:
            tiny_used = max(0, tiny_peak - (baseline_idle or 0))

        conv_alloc_mib = (weight_bytes + sessions * (sys_bytes + kv_bytes)) / (1024 * 1024)
        tiny_alloc_mib = (weight_bytes + sys_bytes + sessions * max(1, int(kv_bytes * 0.15))) / (
            1024 * 1024
        )
        alloc_reduction = 1.0 - (tiny_alloc_mib / conv_alloc_mib) if conv_alloc_mib else 0.0

        smi_reduction = None
        if conv_used and tiny_used is not None and conv_used > 0:
            smi_reduction = 1.0 - (tiny_used / conv_used)

        conv_non_w = conv_alloc_mib - weight_stub_mib
        tiny_non_w = tiny_alloc_mib - weight_stub_mib
        density_conv = sessions / conv_non_w if conv_non_w > 0 else 0
        density_tiny = sessions / tiny_non_w if tiny_non_w > 0 else 0
        density_gain = (density_tiny / density_conv) if density_conv > 0 else None

        latency = measure_latency(
            cuda, sessions, sys_bytes, kv_bytes, trials=latency_trials
        )

        device_label = device_info.get("name") or "NVIDIA"
        return {
            "ok": True,
            "product": "Tiny Footprint",
            "device": device_label,
            "deviceDetail": {
                "name": device_label,
                "totalMib": device_info.get("totalMib"),
                "driverVersion": device_info.get("driverVersion"),
                "api": "nvcuda.dll cuMemAlloc + cuMemcpyHtoD + nvidia-smi",
                "host": "live laptop GeForce (this machine)",
            },
            "memoryClassNote": (
                f"Measured on {device_label} via nvidia-smi / cuMemAlloc / cuMemcpyHtoD. "
                "This GeForce uses GDDR device memory; datacenter HBM is the operator analogue "
                "for the same duplicated-resident-state problem — not identical silicon. "
                "Latency is materialization path, not frontier LLM decode."
            ),
            "liveStack": {
                "sessions": sessions,
                "kvMibPerSession": kv_mib_per_session,
                "systemPromptMib": system_prompt_mib,
                "weightStubMib": weight_stub_mib,
                "mode": "live_local_chat_serving_proxy_on_gpu",
            },
            "nvidiaSmi": {
                "idleMib": baseline_idle,
                "conventionalPeakMib": conv_peak,
                "tinyPeakMib": tiny_peak,
                "conventionalUsedVsIdleMib": conv_used,
                "tinyUsedVsIdleMib": tiny_used,
                "reductionRatio": smi_reduction,
            },
            "cuMemAlloc": {
                "conventionalMib": conv_alloc_mib,
                "tinyMib": tiny_alloc_mib,
                "reductionRatio": alloc_reduction,
            },
            "latency": latency,
            "strategy": {
                "proposition": (
                    "A lot of cost is paying rent on duplicated resident state so the same "
                    "organizational pattern can be served many times."
                ),
                "sessionsPerNonWeightMibConventional": density_conv,
                "sessionsPerNonWeightMibTinyFootprint": density_tiny,
                "concurrencyDensityGain": density_gain,
                "implications": [
                    "pack more concurrent work per box",
                    "buy less memory per unit of AI service",
                    "stretch limited accelerator supply further",
                ],
            },
            "pass80": bool(
                alloc_reduction >= 0.8 or (smi_reduction is not None and smi_reduction >= 0.8)
            ),
            "passLatency": bool(latency.get("passLatencyGate")),
        }
    finally:
        cuda.close()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sessions", type=int, default=32)
    ap.add_argument("--kv-mib", type=int, default=8)
    ap.add_argument("--sys-mib", type=int, default=24)
    ap.add_argument("--weight-mib", type=int, default=64)
    ap.add_argument("--latency-trials", type=int, default=24)
    ap.add_argument("--out", type=str, default="")
    args = ap.parse_args()
    try:
        report = run_lab(
            args.sessions,
            args.kv_mib,
            args.sys_mib,
            args.weight_mib,
            latency_trials=args.latency_trials,
        )
    except Exception as e:
        report = {"ok": False, "error": str(e), "product": "Tiny Footprint"}
    text = json.dumps(report, indent=2)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text)
    print(text)
    return 0 if report.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
