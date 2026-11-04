import json
import sys
from pathlib import Path

from tiny_footprint_labs.common.receipt import EXIT_FAIL, EXIT_NOT_RUN, EXIT_OK
from tiny_footprint_labs.llm.matrix import matrix_failed, run_command, run_matrix, run_slug

RUN = {"model": "org/Model.Name", "backend": "mps", "revision": "abc", "trainSteps": 3, "prefixTokens": 16}
REPO_ROOT = Path(__file__).resolve().parents[3]
LLM = {"sessions": 2, "userTurns": 1, "newTokens": 1, "trials": 1, "warmup": 0, "logitTolerance": 0.05, "runs": [RUN]}


def test_slugs_are_filename_safe() -> None:
    assert run_slug(RUN) == "org-model-name-mps"


def test_the_command_passes_the_plan_through(tmp_path: Path) -> None:
    command = run_command(tmp_path / "lab.py", RUN, LLM, 7, tmp_path / "out.json")
    assert command[0] == sys.executable
    assert command[command.index("--revision") + 1] == "abc"
    assert command[command.index("--seed") + 1] == "7"
    assert command[command.index("--train-steps") + 1] == "3"


def test_every_planned_run_gets_its_own_process_and_outcome(tmp_path: Path) -> None:
    plan = tmp_path / "plan.json"
    plan.write_text(json.dumps({"llm": LLM, "seeds": {"primary": 1}}), encoding="utf-8")
    script = tmp_path / "lab.py"
    script.write_text(
        "import sys, pathlib\n"
        "out = sys.argv[sys.argv.index('--out') + 1]\n"
        "pathlib.Path(out).write_text('{}')\n"
        "sys.exit(3)\n",
        encoding="utf-8",
    )
    outcomes = run_matrix(plan, script, tmp_path / "receipts", REPO_ROOT)
    assert outcomes[0]["run"] == "org-model-name-mps"
    assert outcomes[0]["exitCode"] == 3
    assert outcomes[0]["receipt"] is True
    assert (tmp_path / "receipts" / "org-model-name-mps.json").exists()
    assert matrix_failed(outcomes) is False


def _plan_and_script(tmp_path: Path, body: str) -> tuple[Path, Path]:
    plan = tmp_path / "plan.json"
    plan.write_text(json.dumps({"llm": LLM, "seeds": {"primary": 1}}), encoding="utf-8")
    script = tmp_path / "lab.py"
    script.write_text("import sys, pathlib\nout = sys.argv[sys.argv.index('--out') + 1]\n" + body, encoding="utf-8")
    return plan, script


def test_every_receipt_is_bound_to_the_plan_and_the_lab_source(tmp_path: Path) -> None:
    plan, script = _plan_and_script(tmp_path, "pathlib.Path(out).write_text('{\"status\": \"pass\"}')\n")
    run_matrix(plan, script, tmp_path / "receipts", REPO_ROOT)
    receipt = json.loads((tmp_path / "receipts" / "org-model-name-mps.json").read_text(encoding="utf-8"))
    assert receipt["status"] == "pass"
    assert len(receipt["planSha256"]) == 64
    assert len(receipt["sourceFingerprint"]["sha256"]) == 64
    assert receipt["load"]["start"]["loadAverage"]["one"] >= 0
    assert receipt["load"]["end"]["at"] >= receipt["load"]["start"]["at"]


def test_negative_control_a_run_that_dies_leaves_no_old_receipt_and_fails_the_stage(tmp_path: Path) -> None:
    plan, script = _plan_and_script(tmp_path, "sys.stderr.write('boom')\nsys.exit(2)\n")
    stale = tmp_path / "receipts" / "org-model-name-mps.json"
    stale.parent.mkdir()
    stale.write_text('{"status": "pass"}', encoding="utf-8")
    outcomes = run_matrix(plan, script, tmp_path / "receipts", REPO_ROOT)
    assert stale.exists() is False
    assert outcomes[0]["receipt"] is False
    assert "boom" in outcomes[0]["stderr"]
    assert matrix_failed(outcomes) is True


def test_only_a_finished_run_or_a_declared_not_run_passes_the_stage() -> None:
    ok = {"exitCode": EXIT_OK, "receipt": True}
    not_run = {"exitCode": EXIT_NOT_RUN, "receipt": True}
    assert matrix_failed([ok, not_run]) is False
    assert matrix_failed([{"exitCode": EXIT_FAIL, "receipt": True}]) is True
    assert matrix_failed([{"exitCode": -9, "receipt": False}]) is True
    assert matrix_failed([{"exitCode": EXIT_OK, "receipt": False}]) is True
