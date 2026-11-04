#!/usr/bin/env python3
"""Thin orchestrator: run the real-model lab for one model and backend, and write its receipt."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from tiny_footprint_labs.common.receipt import LabNotRunnable, exit_code_for, not_run_report, write_report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default=None)
    parser.add_argument("--revision", default=None)
    parser.add_argument("--backend", default="auto")
    parser.add_argument("--sessions", type=int, default=6)
    parser.add_argument("--user-turns", type=int, default=2)
    parser.add_argument("--new-tokens", type=int, default=8)
    parser.add_argument("--trials", type=int, default=3)
    parser.add_argument("--warmup", type=int, default=2)
    parser.add_argument("--train-steps", type=int, default=5)
    parser.add_argument("--prefix-tokens", type=int, default=256)
    parser.add_argument("--logit-tolerance", type=float, default=5e-2)
    parser.add_argument("--seed", type=int, default=20261103)
    parser.add_argument("--out", default="")
    args = parser.parse_args()
    from tiny_footprint_labs.llm.lab import MODEL_ID_DEFAULT, run_lab

    try:
        report = run_lab(
            model_id=args.model or MODEL_ID_DEFAULT,
            revision=args.revision,
            backend_preference=args.backend,
            sessions=args.sessions,
            user_turns=args.user_turns,
            new_tokens=args.new_tokens,
            trials=args.trials,
            warmup=args.warmup,
            train_steps=args.train_steps,
            prefix_tokens=args.prefix_tokens,
            logit_tolerance=args.logit_tolerance,
            seed=args.seed,
        )
    except LabNotRunnable as error:
        report = not_run_report(error)
    except Exception as error:
        report = {"ok": False, "status": "fail", "error": str(error), "product": "Tiny Footprint"}
    print(write_report(report, args.out or None))
    return exit_code_for(report)


if __name__ == "__main__":
    raise SystemExit(main())
