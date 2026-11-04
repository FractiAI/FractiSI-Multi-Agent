#!/usr/bin/env python3
"""Thin orchestrator: render manuscript figures from output/data/analysis_summary.json."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from tiny_footprint_labs.figures.build import build_from_files


def main() -> int:
    print(build_from_files(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
