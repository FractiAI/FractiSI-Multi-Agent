#!/usr/bin/env python3
"""Compatibility path: forwards to scripts/h100_prefix_cache_sim.py at the repository root."""

import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).resolve().parents[3] / "scripts" / "h100_prefix_cache_sim.py"), run_name="__main__")
