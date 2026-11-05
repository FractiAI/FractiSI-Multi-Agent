#!/usr/bin/env python3
"""Thin orchestrator: run the live GPU chat-stack lab and write its receipt."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from tiny_footprint_labs.common.receipt import LabNotRunnable, exit_code_for, not_run_report, write_report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sessions", type=int, default=32)
    parser.add_argument("--kv-mib", type=int, default=8)
    parser.add_argument("--sys-mib", type=int, default=24)
    parser.add_argument("--weight-mib", type=int, default=64)
    parser.add_argument("--latency-trials", type=int, default=24)
    parser.add_argument("--out", default="")
    args = parser.parse_args()
    from tiny_footprint_labs.gpu_live.lab import run_lab

    try:
        report = run_lab(args.sessions, args.kv_mib, args.sys_mib, args.weight_mib, args.latency_trials)
    except LabNotRunnable as error:
        report = not_run_report(error)
    except Exception as error:
        report = {"ok": False, "status": "fail", "error": str(error), "product": "Tiny Footprint"}
    print(write_report(report, args.out or None))
    return exit_code_for(report)


if __name__ == "__main__":
    raise SystemExit(main())
