"""Run the real-model lab once per model and backend named in the benchmark plan.

Each run gets its own interpreter, so allocator state from one run cannot leak into
the next run's readings. Each receipt is bound to the plan and the lab's source, and
any older receipt is removed first, so a run that dies cannot leave stale evidence.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from tiny_footprint_labs.common.fingerprint import sha256_hex, source_fingerprint
from tiny_footprint_labs.common.receipt import EXIT_NOT_RUN, EXIT_OK, write_report

# What determines a real-model result. src/benchmarks/fingerprint.mjs holds the same
# list for verification, and a test compares the two.
LLM_SOURCE_ROOTS = (
    "src/tiny_footprint_labs/llm",
    "src/tiny_footprint_labs/common",
    "scripts/gpu_llm_real_lab.py",
    "benchmarks/plan.json",
)
STDERR_TAIL_CHARS = 2000


def run_slug(run: dict[str, Any]) -> str:
    """A filename-safe identity for one model and backend."""
    return re.sub(r"[^a-z0-9]+", "-", f"{run['model']}-{run['backend']}".lower()).strip("-")


def run_command(script: Path, run: dict[str, Any], llm_plan: dict[str, Any], seed: int, out: Path) -> list[str]:
    """The lab invocation for one entry of the plan's matrix."""
    return [
        sys.executable,
        str(script),
        "--model",
        run["model"],
        "--revision",
        run["revision"],
        "--backend",
        run["backend"],
        "--sessions",
        str(llm_plan["sessions"]),
        "--user-turns",
        str(llm_plan["userTurns"]),
        "--new-tokens",
        str(llm_plan["newTokens"]),
        "--trials",
        str(llm_plan["trials"]),
        "--warmup",
        str(llm_plan["warmup"]),
        "--train-steps",
        str(run["trainSteps"]),
        "--prefix-tokens",
        str(run["prefixTokens"]),
        "--logit-tolerance",
        str(llm_plan["logitTolerance"]),
        "--seed",
        str(seed),
        "--out",
        str(out),
    ]


def bind_receipt(out: Path, plan_sha256: str, fingerprint: dict[str, Any]) -> None:
    """Record which plan and which lab source produced a receipt."""
    report = json.loads(out.read_text(encoding="utf-8"))
    report["planSha256"] = plan_sha256
    report["sourceFingerprint"] = fingerprint
    write_report(report, out)


def run_matrix(plan_path: Path, script: Path, out_dir: Path, repo_root: Path) -> list[dict[str, Any]]:
    """Run every planned combination and return each outcome. A run that cannot run is recorded."""
    plan_bytes = plan_path.read_bytes()
    plan = json.loads(plan_bytes)
    llm_plan = plan["llm"]
    plan_sha256 = sha256_hex(plan_bytes)
    fingerprint = source_fingerprint(repo_root, LLM_SOURCE_ROOTS)
    outcomes = []
    out_dir.mkdir(parents=True, exist_ok=True)
    for run in llm_plan["runs"]:
        out = out_dir / f"{run_slug(run)}.json"
        out.unlink(missing_ok=True)
        command = run_command(script, run, llm_plan, plan["seeds"]["primary"], out)
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
        has_receipt = out.exists()
        if has_receipt:
            bind_receipt(out, plan_sha256, fingerprint)
        outcome: dict[str, Any] = {
            "run": run_slug(run),
            "exitCode": completed.returncode,
            "out": str(out),
            "receipt": has_receipt,
        }
        if completed.returncode not in (EXIT_OK, EXIT_NOT_RUN):
            outcome["stderr"] = completed.stderr[-STDERR_TAIL_CHARS:]
        outcomes.append(outcome)
    return outcomes


def matrix_failed(outcomes: list[dict[str, Any]]) -> bool:
    """A run fails the stage unless it finished or reported that this host cannot run it."""
    return any(outcome["exitCode"] not in (EXIT_OK, EXIT_NOT_RUN) or not outcome["receipt"] for outcome in outcomes)
