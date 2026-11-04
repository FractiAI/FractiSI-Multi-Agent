#!/usr/bin/env python3
"""Thin orchestrator: run the real-model lab matrix under output/data/measured/llm/."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from tiny_footprint_labs.common.receipt import EXIT_FAIL, EXIT_OK
from tiny_footprint_labs.llm.matrix import matrix_failed, run_matrix


def main() -> int:
    outcomes = run_matrix(
        ROOT / "benchmarks" / "plan.json",
        ROOT / "scripts" / "gpu_llm_real_lab.py",
        ROOT / "output" / "data" / "measured" / "llm",
        ROOT,
    )
    print(json.dumps(outcomes, indent=2))
    return EXIT_FAIL if matrix_failed(outcomes) else EXIT_OK


if __name__ == "__main__":
    raise SystemExit(main())
