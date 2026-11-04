import json
import platform
import sys
from pathlib import Path
from typing import Any

import pytest

from tiny_footprint_labs.figures.build import REGISTRY_NAME, build_figures, build_from_files


def test_every_expected_figure_is_built_and_registered(
    summary: dict[str, Any], repo_root: Path, tmp_path: Path
) -> None:
    records = build_figures(summary, repo_root, tmp_path, "summaryhash")
    registry = json.loads((tmp_path / REGISTRY_NAME).read_text(encoding="utf-8"))
    assert len(records) == len(registry)
    for record in records:
        assert (tmp_path / record.filename).exists()
        assert registry[record.label]["metadata"]["alt_text"]


def test_the_committed_registry_is_current(repo_root: Path, tmp_path: Path) -> None:
    build_from_files(repo_root, tmp_path)
    fresh = (tmp_path / REGISTRY_NAME).read_text(encoding="utf-8")
    assert fresh == (repo_root / "output" / "figures" / REGISTRY_NAME).read_text(encoding="utf-8")


@pytest.mark.skipif(
    sys.platform != "darwin" or platform.machine() != "arm64",
    reason="glyph rendering can differ between platforms; the committed figures were drawn on macOS arm64",
)
def test_committed_figures_regenerate_byte_identically(repo_root: Path, tmp_path: Path) -> None:
    build_from_files(repo_root, tmp_path)
    committed = repo_root / "output" / "figures"
    for fresh in tmp_path.iterdir():
        assert fresh.read_bytes() == (committed / fresh.name).read_bytes(), fresh.name
