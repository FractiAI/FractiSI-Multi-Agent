"""Figures over the real-model lab: forward passes and key-value residency."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.ticker import FuncFormatter

from tiny_footprint_labs.figures.registry import FigureRecord
from tiny_footprint_labs.figures.style import BLUE, FULL_WIDTH_IN, ORANGE, TEXT_SECONDARY, percent, save_figure

SOURCE = "output/data/analysis_summary.json"
GENERATOR = "src/tiny_footprint_labs/figures/llm.py"
MIB = 1024 * 1024


def completed_runs(summary: dict[str, Any]) -> list[dict[str, Any]]:
    """Runs that passed. A `not_run` entry or a failed equivalence check contributes no marks."""
    return [run for run in summary["llm"] if run.get("status") == "pass" and run.get("residency")]


def largest_accelerator_run(summary: dict[str, Any]) -> dict[str, Any]:
    """The run with the largest key-value cache that also has allocator readings."""
    readable = [
        run for run in completed_runs(summary) if run["residency"]["duplicated"]["deviceAllocatedBytes"] is not None
    ]
    if not readable:
        raise ValueError("no real-model run read a device allocator; run scripts/run_llm_matrix.py on an accelerator")
    return max(readable, key=lambda run: run["residency"]["kvBytesPerTokenFormula"])


def _run_label(run: dict[str, Any]) -> str:
    return f"{run['model']['id'].split('/')[-1]} · {run['backend'].upper()}"


def llm_prefill(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Per-call prefill time with and without a shared prefix, on real forward passes."""
    runs = completed_runs(summary)
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 2.6))
    labels = []
    for y, run in enumerate(reversed(runs)):
        call = run["prefillCall"]
        without = call["withoutMs"]["estimate"]
        with_arm = call["withMs"]["estimate"]
        ax.plot([without, with_arm], [y, y], color=TEXT_SECONDARY, linewidth=1, alpha=0.5)
        ax.errorbar(
            without,
            y,
            xerr=[[without - call["withoutMs"]["low"]], [call["withoutMs"]["high"] - without]],
            marker="s",
            color=ORANGE,
            markersize=6,
            capsize=2,
            linestyle="none",
        )
        ax.errorbar(
            with_arm,
            y,
            xerr=[[with_arm - call["withMs"]["low"]], [call["withMs"]["high"] - with_arm]],
            marker="o",
            color=BLUE,
            markersize=6,
            capsize=2,
            linestyle="none",
        )
        ax.text(without * 1.14, y, f"{call['speedup']['estimate']:.1f}x", va="center", fontsize=8)
        labels.append(_run_label(run))
    ax.set_xscale("log")
    ax.xaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{value:g}"))
    ax.set_yticks(range(len(labels)), labels)
    ax.set_ylim(-0.6, len(labels) - 0.4)
    ax.set_xlabel("Prefill per turn (ms, log scale; median with 95% CI)")
    ax.grid(axis="y", visible=False)
    ax.legend(
        handles=[
            Line2D([0], [0], marker="s", color=ORANGE, linestyle="none", label="Re-prefill the full prompt"),
            Line2D([0], [0], marker="o", color=BLUE, linestyle="none", label="Reuse the shared prefix"),
        ],
        loc="lower left",
        bbox_to_anchor=(0.0, 1.0),
        ncol=2,
    )
    save_figure(fig, out_dir / "llm_prefill.png")
    speedups = sorted(run["prefillCall"]["speedup"]["estimate"] for run in runs)
    return FigureRecord(
        label="fig:llm_prefill",
        filename="llm_prefill.png",
        caption=(
            "Real forward passes: prefill time per turn when the whole prompt is processed again, and when a shared "
            "prefix's key-value tensors are reused so only the session's own tokens are processed. Labels give the "
            "speedup. Points are medians of per-trial medians, and their intervals describe repeatability within one "
            "process. Reusing a prefix is what a production prefix cache already does, so this compares against a "
            "baseline without one."
        ),
        alt_text=(
            f"Dumbbells of prefill time per turn for each model and backend, on a log scale. Speedups from reusing "
            f"the prefix range from {speedups[0]:.1f} to {speedups[-1]:.1f} times."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def kv_residency(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Key-value bytes held live, duplicated versus shared prefix, by three accountings."""
    run = largest_accelerator_run(summary)
    residency = run["residency"]
    measures = (
        ("Formula", "formulaBytes"),
        ("Tensor bytes", "logicalBytes"),
        ("Device allocator", "deviceAllocatedBytes"),
    )
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 2.8))
    width = 0.34
    for index, (_, key) in enumerate(measures):
        duplicated = residency["duplicated"][key] / MIB
        shared = residency["shared"][key] / MIB
        ax.bar(index - width / 2 - 0.01, duplicated, width=width, color=ORANGE)
        ax.bar(index + width / 2 + 0.01, shared, width=width, color=BLUE)
        ax.text(index - width / 2 - 0.01, duplicated, f"{duplicated:.1f}", ha="center", va="bottom", fontsize=8)
        ax.text(index + width / 2 + 0.01, shared, f"{shared:.1f}", ha="center", va="bottom", fontsize=8)
    ax.set_xticks(range(len(measures)), [label for label, _ in measures])
    ax.set_ylabel("Key-value bytes held live (MiB)")
    ax.grid(axis="x", visible=False)
    ax.legend(
        handles=[
            Line2D([0], [0], color=ORANGE, linewidth=6, label="Every session holds its full cache"),
            Line2D([0], [0], color=BLUE, linewidth=6, label="One shared prefix plus per-session suffixes"),
        ],
        loc="lower left",
        bbox_to_anchor=(0.0, 1.0),
        ncol=2,
    )
    ax.margins(y=0.12)
    save_figure(fig, out_dir / "kv_residency.png")
    return FigureRecord(
        label="fig:kv_residency",
        filename="kv_residency.png",
        caption=(
            f"Key-value cache held live for {residency['sessions']} sessions of {run['model']['id']} on "
            f"{run['backend'].upper()}: {residency['prefixTokens']} shared prefix tokens and {residency['suffixTokens']} tokens per "
            f"session, by three accountings. Sharing the prefix is predicted to save {percent(residency['reduction']['predicted'])}; "
            f"summed tensor sizes give {percent(residency['reduction']['logical'])} and the device allocator "
            f"{percent(residency['reduction']['device'])}."
        ),
        alt_text=(
            f"Grouped bars of bytes under three accountings. Duplicated holds about {residency['duplicated']['logicalBytes'] / MIB:.0f} MiB "
            f"and shared about {residency['shared']['logicalBytes'] / MIB:.0f} MiB in each."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )
