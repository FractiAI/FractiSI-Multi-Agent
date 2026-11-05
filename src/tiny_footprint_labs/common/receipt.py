"""Lab outcomes and receipt writing.

Exit codes are the contract with the Node adapter in ``src/labs/python-runner.mjs``:
a lab that cannot run on this host exits ``EXIT_NOT_RUN`` rather than failing, so
absent hardware is never reported as either a pass or a failure.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

EXIT_OK = 0
EXIT_FAIL = 1
EXIT_NOT_RUN = 3


class LabNotRunnable(Exception):
    """This host lacks something the lab needs; no evidence was produced either way."""

    def __init__(self, reason: str, detail: str = "") -> None:
        super().__init__(detail or reason)
        self.reason = reason
        self.detail = detail


def not_run_report(error: LabNotRunnable) -> dict[str, Any]:
    """Build the receipt for a lab that could not run."""
    report: dict[str, Any] = {"ok": False, "status": "not_run", "liveRun": False, "reason": error.reason}
    if error.detail:
        report["detail"] = error.detail
    return report


def write_report(report: dict[str, Any], out: str | Path | None) -> str:
    """Serialize a report, writing it to ``out`` when given, and return the text."""
    text = json.dumps(report, indent=2)
    if out:
        path = Path(out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text + "\n", encoding="utf-8")
    return text


def exit_code_for(report: dict[str, Any]) -> int:
    """Map a report onto the process exit code."""
    if report.get("status") == "not_run":
        return EXIT_NOT_RUN
    return EXIT_OK if report.get("ok") else EXIT_FAIL
