import json
from pathlib import Path

from tiny_footprint_labs.common.receipt import (
    EXIT_FAIL,
    EXIT_NOT_RUN,
    EXIT_OK,
    LabNotRunnable,
    exit_code_for,
    not_run_report,
    write_report,
)


def test_not_run_keeps_its_reason_and_detail() -> None:
    report = not_run_report(LabNotRunnable("no_runtime", "details"))
    assert report == {"ok": False, "status": "not_run", "liveRun": False, "reason": "no_runtime", "detail": "details"}
    assert "detail" not in not_run_report(LabNotRunnable("no_runtime"))


def test_exit_codes_keep_not_run_distinct_from_failure() -> None:
    assert exit_code_for({"ok": True}) == EXIT_OK
    assert exit_code_for({"ok": False}) == EXIT_FAIL
    assert exit_code_for({"ok": False, "status": "not_run"}) == EXIT_NOT_RUN
    assert len({EXIT_OK, EXIT_FAIL, EXIT_NOT_RUN}) == 3


def test_the_exit_code_contract_matches_the_node_adapter(repo_root: Path) -> None:
    source = (repo_root / "src" / "labs" / "python-runner.mjs").read_text(encoding="utf-8")
    assert f"LAB_EXIT_NOT_RUN = {EXIT_NOT_RUN}" in source


def test_writing_creates_parents_and_returns_the_text(tmp_path: Path) -> None:
    out = tmp_path / "nested" / "receipt.json"
    text = write_report({"ok": True}, out)
    assert json.loads(out.read_text(encoding="utf-8")) == {"ok": True}
    assert json.loads(text) == {"ok": True}
    assert json.loads(write_report({"ok": False}, None)) == {"ok": False}
