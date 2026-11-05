"""Fingerprints must agree with the Node implementation that verification uses."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from tiny_footprint_labs.common.fingerprint import sha256_hex, source_fingerprint
from tiny_footprint_labs.llm.matrix import LLM_SOURCE_ROOTS

REPO_ROOT = Path(__file__).resolve().parents[3]


def tree(tmp_path: Path) -> Path:
    (tmp_path / "pkg" / "sub").mkdir(parents=True)
    (tmp_path / "pkg" / "a.py").write_text("a = 1\n", encoding="utf-8")
    (tmp_path / "pkg" / "sub" / "b.json").write_text("{}\n", encoding="utf-8")
    (tmp_path / "pkg" / "notes.md").write_text("not source\n", encoding="utf-8")
    (tmp_path / "pkg" / ".hidden").mkdir()
    (tmp_path / "pkg" / ".hidden" / "c.py").write_text("ignored\n", encoding="utf-8")
    (tmp_path / "plan.json").write_text("{}\n", encoding="utf-8")
    return tmp_path


def test_only_source_files_count(tmp_path: Path) -> None:
    root = tree(tmp_path)
    assert source_fingerprint(root, ["pkg", "plan.json"])["fileCount"] == 3


def test_any_change_to_a_source_file_changes_the_hash(tmp_path: Path) -> None:
    root = tree(tmp_path)
    before = source_fingerprint(root, ["pkg"])["sha256"]
    (root / "pkg" / "a.py").write_text("a = 2\n", encoding="utf-8")
    assert source_fingerprint(root, ["pkg"])["sha256"] != before


def test_a_file_outside_the_roots_does_not_change_it(tmp_path: Path) -> None:
    root = tree(tmp_path)
    before = source_fingerprint(root, ["pkg"])["sha256"]
    (root / "plan.json").write_text("changed\n", encoding="utf-8")
    assert source_fingerprint(root, ["pkg"])["sha256"] == before


def test_hash_helper() -> None:
    assert sha256_hex(b"abc") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"


@pytest.mark.skipif(shutil.which("node") is None, reason="needs node")
def test_python_and_node_agree_on_the_real_lab_sources() -> None:
    script = (
        "import('./src/benchmarks/fingerprint.mjs').then(({ sourceFingerprint, LLM_SOURCE_ROOTS }) => "
        "console.log(JSON.stringify({ roots: LLM_SOURCE_ROOTS, fingerprint: sourceFingerprint(LLM_SOURCE_ROOTS) })))"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    node = json.loads(completed.stdout)
    assert tuple(node["roots"]) == LLM_SOURCE_ROOTS
    assert node["fingerprint"] == source_fingerprint(REPO_ROOT, LLM_SOURCE_ROOTS)
