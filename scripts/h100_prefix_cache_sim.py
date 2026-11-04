#!/usr/bin/env python3
"""Thin orchestrator: compute the H100 KV-cache roofline and write its receipt."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from tiny_footprint_labs.common.receipt import exit_code_for, write_report
from tiny_footprint_labs.h100.roofline import build_report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(ROOT / "output" / "data" / "simulation" / "h100_prefix_cache_sim.json"))
    args = parser.parse_args()
    report = build_report()
    write_report(report, args.out)
    print(args.out)
    return exit_code_for(report)


if __name__ == "__main__":
    raise SystemExit(main())
