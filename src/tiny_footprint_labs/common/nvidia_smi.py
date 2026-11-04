"""Device queries through ``nvidia-smi``; every call returns None or a stub when it is absent."""

from __future__ import annotations

import subprocess
import time
from typing import Any


def parse_device_line(line: str) -> dict[str, Any]:
    """Parse one ``name,memory.total,driver_version`` CSV line; names may contain commas."""
    parts = [part.strip() for part in line.strip().rsplit(",", 2)]
    if len(parts) == 3:
        name, total, driver = parts
        return {"name": name, "totalMib": int(float(total)), "driverVersion": driver}
    return {"name": line.strip(), "totalMib": None, "driverVersion": None}


def used_mib() -> int | None:
    """Return used device memory in MiB, or None when nvidia-smi is unavailable."""
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return int(out.splitlines()[0].strip())
    except (OSError, subprocess.SubprocessError, ValueError, IndexError):
        return None


def device_info() -> dict[str, Any]:
    """Identify the NVIDIA device under test."""
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return parse_device_line(out.splitlines()[0])
    except (OSError, subprocess.SubprocessError, ValueError, IndexError) as error:
        return {"name": "NVIDIA (query failed)", "totalMib": None, "driverVersion": None, "error": str(error)}


def sample_peak(duration_s: float = 0.35) -> int | None:
    """Sample used memory for ``duration_s`` and return the peak."""
    peak: int | None = None
    start = time.time()
    while time.time() - start < duration_s:
        used = used_mib()
        if used is not None:
            peak = used if peak is None else max(peak, used)
        time.sleep(0.05)
    return peak
