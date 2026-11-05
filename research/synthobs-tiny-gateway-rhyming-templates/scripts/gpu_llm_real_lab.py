#!/usr/bin/env python3
"""Compatibility path: forwards to scripts/gpu_llm_real_lab.py at the repository root."""

import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).resolve().parents[3] / "scripts" / "gpu_llm_real_lab.py"), run_name="__main__")
