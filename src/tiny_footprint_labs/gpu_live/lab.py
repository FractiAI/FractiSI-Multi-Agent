"""Live chat-stack device-memory and latency lab on a real NVIDIA device.

Device memory via nvidia-smi and cuMemAlloc. Latency is the materialization (host
to device) path for the chat-stack proxy, not frontier LLM decode TTFT/TPS. On
GeForce this is typically GDDR; datacenter HBM is the operator analogue.
"""

from __future__ import annotations

from typing import Any

from tiny_footprint_labs.common.nvidia_smi import device_info, sample_peak, used_mib
from tiny_footprint_labs.gpu_live.accounting import MIB, alloc_accounting, delta_bytes
from tiny_footprint_labs.gpu_live.cuda import CudaAlloc
from tiny_footprint_labs.gpu_live.latency import measure_latency


def run_lab(
    sessions: int = 32,
    kv_mib_per_session: int = 8,
    system_prompt_mib: int = 24,
    weight_stub_mib: int = 64,
    latency_trials: int = 24,
) -> dict[str, Any]:
    """Allocate both arms on the device, sample nvidia-smi, then time materialization."""
    cuda = CudaAlloc()
    device = device_info()
    baseline_idle = used_mib()
    try:
        weight_bytes = weight_stub_mib * MIB
        sys_bytes = system_prompt_mib * MIB
        kv_bytes = kv_mib_per_session * MIB
        cuda.alloc(weight_bytes)

        conv_ptrs = []
        for _ in range(sessions):
            conv_ptrs.append(cuda.alloc(sys_bytes))
            conv_ptrs.append(cuda.alloc(kv_bytes))
        conv_peak = sample_peak()
        for pointer in conv_ptrs:
            cuda.free(pointer)

        cuda.alloc(sys_bytes)
        for _ in range(sessions):
            cuda.alloc(delta_bytes(kv_bytes))
        tiny_peak = sample_peak()
        cuda.free_all_but_first()

        conv_used = max(0, conv_peak - (baseline_idle or 0)) if conv_peak is not None else None
        tiny_used = max(0, tiny_peak - (baseline_idle or 0)) if tiny_peak is not None else None
        smi_reduction = None
        if conv_used and tiny_used is not None and conv_used > 0:
            smi_reduction = 1.0 - (tiny_used / conv_used)

        accounting = alloc_accounting(sessions, kv_mib_per_session, system_prompt_mib, weight_stub_mib)
        latency = measure_latency(cuda, sessions, sys_bytes, kv_bytes, trials=latency_trials)
        label = device.get("name") or "NVIDIA"
        alloc_reduction = accounting["reductionRatio"]
        return {
            "ok": True,
            "product": "Tiny Footprint",
            "device": label,
            "deviceDetail": {
                "name": label,
                "totalMib": device.get("totalMib"),
                "driverVersion": device.get("driverVersion"),
                "api": "nvcuda cuMemAlloc + cuMemcpyHtoD + nvidia-smi",
            },
            "memoryClassNote": (
                f"Measured on {label} via nvidia-smi / cuMemAlloc / cuMemcpyHtoD. "
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
                "conventionalMib": accounting["conventionalMib"],
                "tinyMib": accounting["tinyMib"],
                "reductionRatio": alloc_reduction,
            },
            "latency": latency,
            "strategy": {
                "proposition": (
                    "A lot of cost is paying rent on duplicated resident state so the same "
                    "organizational pattern can be served many times."
                ),
                "sessionsPerNonWeightMibConventional": accounting["sessionsPerNonWeightMibConventional"],
                "sessionsPerNonWeightMibTinyFootprint": accounting["sessionsPerNonWeightMibTinyFootprint"],
                "concurrencyDensityGain": accounting["concurrencyDensityGain"],
                "implications": [
                    "pack more concurrent work per box",
                    "buy less memory per unit of AI service",
                    "stretch limited accelerator supply further",
                ],
            },
            "pass80": bool(alloc_reduction >= 0.8 or (smi_reduction is not None and smi_reduction >= 0.8)),
            "passLatency": bool(latency.get("passLatencyGate")),
        }
    finally:
        cuda.close()
