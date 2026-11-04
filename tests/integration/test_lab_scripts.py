"""The thin Python entry points, run as a user runs them."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SUITE = ROOT / "research" / "synthobs-tiny-gateway-rhyming-templates"


def run(script: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run([sys.executable, str(script), *args], capture_output=True, text=True, check=False)


def test_the_roofline_script_writes_its_receipt(tmp_path: Path) -> None:
    out = tmp_path / "h100.json"
    assert run(ROOT / "scripts" / "h100_prefix_cache_sim.py", "--out", str(out)).returncode == 0
    assert json.loads(out.read_text(encoding="utf-8"))["kind"] == "simulation"


@pytest.mark.skipif(sys.platform == "win32", reason="this host may have the runtime")
def test_regression_the_gpu_lab_reports_not_run_and_exits_three(tmp_path: Path) -> None:
    out = tmp_path / "live.json"
    done = run(ROOT / "scripts" / "gpu_live_chat_hbm_lab.py", "--out", str(out))
    assert done.returncode == 3
    receipt = json.loads(out.read_text(encoding="utf-8"))
    assert receipt["status"] == "not_run"
    assert "cuMemAlloc" not in receipt


def test_old_script_paths_forward_to_the_new_ones(tmp_path: Path) -> None:
    out = tmp_path / "h100.json"
    assert run(SUITE / "scripts" / "h100_prefix_cache_sim.py", "--out", str(out)).returncode == 0
    assert out.exists()


def test_the_hydration_entry_the_template_looks_for_exists() -> None:
    assert (ROOT / "scripts" / "z_generate_manuscript_variables.py").exists()
