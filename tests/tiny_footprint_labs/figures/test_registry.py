import hashlib
import json
from pathlib import Path

import pytest

from tiny_footprint_labs.figures.registry import FigureRecord, registry_entries, write_registry


def record(alt_text: str = "A description.") -> FigureRecord:
    return FigureRecord("fig:a", "a.png", "A caption.", alt_text, "gen.py", "source.json")


def image(directory: Path) -> Path:
    (directory / "a.png").write_bytes(b"image bytes")
    return directory


def test_entries_are_keyed_by_label_with_template_fields(tmp_path: Path) -> None:
    entry = registry_entries([record()], image(tmp_path), "summaryhash")["fig:a"]
    assert entry["figure_id"] == "figure_000"
    assert entry["filename"] == "a.png"
    assert entry["generated_by"] == "gen.py"
    assert entry["metadata"]["alt_text"] == "A description."
    assert entry["metadata"]["source"] == "source.json"


def test_entries_bind_the_image_and_the_summary_it_came_from(tmp_path: Path) -> None:
    metadata = registry_entries([record()], image(tmp_path), "summaryhash")["fig:a"]["metadata"]
    assert metadata["sha256"] == hashlib.sha256(b"image bytes").hexdigest()
    assert metadata["summary_sha256"] == "summaryhash"


def test_a_figure_with_no_alternative_text_is_refused(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="fig:a"):
        write_registry([record("  ")], image(tmp_path) / "r.json", "summaryhash")


def test_writing_is_stable(tmp_path: Path) -> None:
    write_registry([record()], image(tmp_path) / "a.json", "summaryhash")
    write_registry([record()], tmp_path / "b.json", "summaryhash")
    assert (tmp_path / "a.json").read_bytes() == (tmp_path / "b.json").read_bytes()
    assert "fig:a" in json.loads((tmp_path / "a.json").read_text(encoding="utf-8"))
