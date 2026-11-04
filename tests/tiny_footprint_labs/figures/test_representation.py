from pathlib import Path
from typing import Any

import pytest

from tiny_footprint_labs.figures import representation
from tiny_footprint_labs.figures.style import apply_style, percent

FIGURES = [
    representation.workload_reductions,
    representation.aggregate_sensitivity,
    representation.session_scaling,
    representation.rhyme_crossover,
    representation.gpu_proxy_sensitivity,
]


@pytest.mark.parametrize("figure", FIGURES)
def test_each_figure_writes_a_file_and_a_complete_record(figure: Any, summary: dict[str, Any], tmp_path: Path) -> None:
    apply_style()
    record = figure(summary, tmp_path)
    assert (tmp_path / record.filename).stat().st_size > 1000
    assert record.label.startswith("fig:")
    assert record.caption.strip()
    assert record.alt_text.strip()
    assert record.alt_text != record.caption


def test_captions_and_alt_text_follow_the_data(summary: dict[str, Any], tmp_path: Path) -> None:
    apply_style()
    record = representation.aggregate_sensitivity(summary, tmp_path)
    published = summary["deterministic"]["sensitivity"]["published"]["ratio"]
    assert percent(published) in record.alt_text
    changed = {**summary, "deterministic": {**summary["deterministic"]}}
    sensitivity = dict(changed["deterministic"]["sensitivity"])
    sensitivity["published"] = {**sensitivity["published"], "ratio": 0.5}
    changed["deterministic"]["sensitivity"] = sensitivity
    assert "50.0%" in representation.aggregate_sensitivity(changed, tmp_path).alt_text
