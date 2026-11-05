"""Build every figure and the registry from the canonical analysis summary."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from tiny_footprint_labs.figures import llm, measured, representation, vendor
from tiny_footprint_labs.figures.registry import FigureRecord, write_registry
from tiny_footprint_labs.figures.style import apply_style

REGISTRY_NAME = "figure_registry.json"


def build_figures(summary: dict[str, Any], root: Path, out_dir: Path, summary_sha256: str) -> Sequence[FigureRecord]:
    """Render all figures into ``out_dir`` and return their records."""
    apply_style()
    records = [
        vendor.vendor_architecture(root, out_dir),
        representation.workload_reductions(summary, out_dir),
        representation.aggregate_sensitivity(summary, out_dir),
        representation.session_scaling(summary, out_dir),
        representation.rhyme_crossover(summary, out_dir),
        representation.gpu_proxy_sensitivity(summary, out_dir),
        measured.heap_vs_json(summary, out_dir),
        measured.heap_scaling(summary, out_dir),
        measured.materialization_latency(summary, out_dir),
        llm.llm_prefill(summary, out_dir),
        llm.kv_residency(summary, out_dir),
    ]
    write_registry(records, out_dir / REGISTRY_NAME, summary_sha256)
    return records


def build_from_files(root: Path, out_dir: Path | None = None) -> Path:
    """Read the summary from disk, render everything, and return the registry path."""
    raw = (root / "output" / "data" / "analysis_summary.json").read_bytes()
    target = out_dir or root / "output" / "figures"
    build_figures(json.loads(raw), root, target, hashlib.sha256(raw).hexdigest())
    return target / REGISTRY_NAME
