from pathlib import Path
from typing import Any

import pytest

from tiny_footprint_labs.figures import measured
from tiny_footprint_labs.figures.style import apply_style

FIGURES = [measured.heap_vs_json, measured.heap_scaling, measured.materialization_latency]


@pytest.mark.parametrize("figure", FIGURES)
def test_each_figure_writes_a_file_and_a_complete_record(figure: Any, summary: dict[str, Any], tmp_path: Path) -> None:
    apply_style()
    record = figure(summary, tmp_path)
    assert (tmp_path / record.filename).stat().st_size > 1000
    assert record.caption.strip()
    assert record.alt_text.strip()


def test_largest_sessions_reads_the_design(summary: dict[str, Any]) -> None:
    assert measured.largest_sessions(summary) == max(row["sessions"] for row in summary["heap"]["rows"])
