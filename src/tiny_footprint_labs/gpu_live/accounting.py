"""Buffer accounting for the live GPU lab.

Pure arithmetic: these figures follow from the requested buffer sizes and the
assumed delta fraction. The device confirms the allocations succeed; it does not
report these numbers. Device readings come separately from ``nvidia-smi``.
"""

from __future__ import annotations

from typing import Any

MIB = 1024 * 1024
# Assumed per-session delta as a fraction of the KV buffer. Not measured here.
DELTA_FRACTION = 0.15


def delta_bytes(kv_bytes: int, fraction: float = DELTA_FRACTION) -> int:
    """Per-session delta size implied by the assumed fraction."""
    return max(1, int(kv_bytes * fraction))


def alloc_accounting(
    sessions: int,
    kv_mib_per_session: int,
    system_prompt_mib: int,
    weight_stub_mib: int,
) -> dict[str, Any]:
    """Conventional and Tiny Footprint allocation totals for the requested sizes."""
    weight_bytes = weight_stub_mib * MIB
    sys_bytes = system_prompt_mib * MIB
    kv_bytes = kv_mib_per_session * MIB
    conventional = (weight_bytes + sessions * (sys_bytes + kv_bytes)) / MIB
    tiny = (weight_bytes + sys_bytes + sessions * delta_bytes(kv_bytes)) / MIB
    conventional_non_weight = conventional - weight_stub_mib
    tiny_non_weight = tiny - weight_stub_mib
    density_conventional = sessions / conventional_non_weight if conventional_non_weight > 0 else 0
    density_tiny = sessions / tiny_non_weight if tiny_non_weight > 0 else 0
    return {
        "conventionalMib": conventional,
        "tinyMib": tiny,
        "reductionRatio": 1.0 - (tiny / conventional) if conventional else 0.0,
        "sessionsPerNonWeightMibConventional": density_conventional,
        "sessionsPerNonWeightMibTinyFootprint": density_tiny,
        "concurrencyDensityGain": (density_tiny / density_conventional) if density_conventional > 0 else None,
    }


def payload_accounting(sessions: int, sys_bytes: int, kv_bytes: int, cap_bytes: int = 4 * MIB) -> dict[str, Any]:
    """Host-to-device bytes per turn, with the buffer cap the latency phase applies."""
    host_sys = min(sys_bytes, cap_bytes)
    host_kv = min(kv_bytes, cap_bytes)
    host_delta = min(delta_bytes(kv_bytes), cap_bytes)
    conventional = sessions * (host_sys + host_kv)
    tiny = host_sys + sessions * host_delta
    return {
        "hostSysBytes": host_sys,
        "hostKvBytes": host_kv,
        "hostDeltaBytes": host_delta,
        "conventional": conventional,
        "tinyFootprint": tiny,
        "trafficReductionRatio": 1.0 - (tiny / conventional) if conventional else None,
    }
