from pathlib import Path
from typing import Any

import pytest

from tiny_footprint_labs.figures import llm
from tiny_footprint_labs.figures.style import apply_style


def test_figures_write_files_and_complete_records(summary: dict[str, Any], tmp_path: Path) -> None:
    apply_style()
    for figure in (llm.llm_prefill, llm.kv_residency):
        record = figure(summary, tmp_path)
        assert (tmp_path / record.filename).stat().st_size > 1000
        assert record.alt_text.strip()


def test_a_run_that_did_not_run_contributes_no_marks(summary: dict[str, Any]) -> None:
    changed = {**summary, "llm": [*summary["llm"], {"status": "not_run", "reason": "x", "run": "y"}]}
    assert len(llm.completed_runs(changed)) == len(llm.completed_runs(summary))


def test_no_allocator_reading_is_an_error_rather_than_an_empty_figure(summary: dict[str, Any]) -> None:
    with pytest.raises(ValueError, match="allocator"):
        llm.largest_accelerator_run({**summary, "llm": []})
