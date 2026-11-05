"""The figure registry the template reads: label, file, caption, generator and alt text."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class FigureRecord:
    """One figure: its visible caption and separately authored alternative text."""

    label: str
    filename: str
    caption: str
    alt_text: str
    generated_by: str
    source: str
    section: str = "Results"


def registry_entries(
    records: Sequence[FigureRecord], figures_dir: Path, summary_sha256: str
) -> dict[str, dict[str, Any]]:
    """Registry mapping, keyed by label, in the layout template validators expect.

    Each entry also binds the figure's bytes and the summary it was drawn from, so
    verification can tell a stale or hand-edited figure from a current one.
    """
    return {
        record.label: {
            "figure_id": f"figure_{index:03d}",
            "filename": record.filename,
            "caption": record.caption,
            "label": record.label,
            "section": record.section,
            "generated_by": record.generated_by,
            "metadata": {
                "alt_text": record.alt_text,
                "source": record.source,
                "sha256": hashlib.sha256((figures_dir / record.filename).read_bytes()).hexdigest(),
                "summary_sha256": summary_sha256,
            },
        }
        for index, record in enumerate(records)
    }


def write_registry(records: Sequence[FigureRecord], path: Path, summary_sha256: str) -> None:
    """Refuse a record with no alternative text, then write the registry."""
    missing = [record.label for record in records if not record.alt_text.strip()]
    if missing:
        raise ValueError(f"figures without alt text: {missing}")
    path.write_text(json.dumps(registry_entries(records, path.parent, summary_sha256), indent=2, sort_keys=True) + "\n", encoding="utf-8")
