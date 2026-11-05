"""Figures over measurements taken on one host: real heap and real wall clock."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

from tiny_footprint_labs.figures.registry import FigureRecord
from tiny_footprint_labs.figures.style import (
    CONDITION_STYLE,
    FULL_WIDTH_IN,
    REFERENCE_LINE,
    TEXT_SECONDARY,
    WORKLOAD_LABEL,
    percent,
    save_figure,
)

SOURCE = "output/data/analysis_summary.json"
GENERATOR = "src/tiny_footprint_labs/figures/measured.py"


def _rows(summary: dict[str, Any], workload: str, sessions: int) -> dict[str, dict[str, Any]]:
    return {
        row["condition"]: row
        for row in summary["heap"]["rows"]
        if row["workload"] == workload and row["sessions"] == sessions
    }


def largest_sessions(summary: dict[str, Any]) -> int:
    """The largest session count in the heap design."""
    return max(row["sessions"] for row in summary["heap"]["rows"])


def heap_vs_json(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """What JSON bytes predict against what the heap actually does."""
    sessions = largest_sessions(summary)
    workloads = ("ai_context", "rhyme_differing")
    fig, axes = plt.subplots(1, 2, figsize=(FULL_WIDTH_IN, 2.9), sharex=False)
    for ax, workload in zip(axes, workloads, strict=True):
        rows = _rows(summary, workload, sessions)
        conditions = [c for c in CONDITION_STYLE if c in rows and c != "duplicated"]
        for y, condition in enumerate(reversed(conditions)):
            style = CONDITION_STYLE[condition]
            row = rows[condition]
            heap = row["heapReduction"]
            json_value = row["jsonReduction"] * 100
            estimate = heap["estimate"] * 100
            ax.plot([json_value, estimate], [y, y], color=style["color"], linewidth=1, alpha=0.5)
            ax.plot(
                json_value,
                y,
                marker=style["marker"],
                color=style["color"],
                markerfacecolor="white",
                markeredgewidth=1.4,
                markersize=7,
                linestyle="none",
            )
            ax.errorbar(
                estimate,
                y,
                xerr=[[max(estimate - heap["low"] * 100, 0)], [max(heap["high"] * 100 - estimate, 0)]],
                marker=style["marker"],
                color=style["color"],
                markersize=7,
                capsize=2,
                linestyle="none",
            )
        ax.axvline(0, color=REFERENCE_LINE, linewidth=1)
        ax.set_yticks(range(len(conditions)), [CONDITION_STYLE[c]["label"] for c in reversed(conditions)])
        ax.set_ylim(-0.6, len(conditions) - 0.4)
        ax.set_title(WORKLOAD_LABEL[workload])
        ax.set_xlabel("Reduction versus duplicated (%)")
        ax.grid(axis="y", visible=False)
    fig.legend(
        handles=[
            Line2D(
                [0],
                [0],
                marker="o",
                color=TEXT_SECONDARY,
                markerfacecolor="white",
                markeredgewidth=1.4,
                linestyle="none",
                label="JSON bytes predict",
            ),
            Line2D(
                [0], [0], marker="o", color=TEXT_SECONDARY, linestyle="none", label="V8 heap measured (median, 95% CI)"
            ),
        ],
        loc="lower center",
        ncol=2,
        bbox_to_anchor=(0.5, -0.12),
    )
    fig.subplots_adjust(wspace=0.75)
    save_figure(fig, out_dir / "heap_vs_json.png")
    ai = _rows(summary, "ai_context", sessions)
    rhyme = _rows(summary, "rhyme_differing", sessions)
    return FigureRecord(
        label="fig:heap_vs_json",
        filename="heap_vs_json.png",
        caption=(
            f"Reduction relative to the duplicated store at {sessions:,} sessions: what serialized JSON predicts (open) and "
            "what a forced-collection read of the V8 heap shows (filled, median with percentile-bootstrap 95% interval "
            "over independent processes). Negative values mean a larger heap than the duplicated store."
        ),
        alt_text=(
            f"Two panels of paired markers. With a shared prompt, Tiny's JSON reduction of {percent(ai['tiny']['jsonReduction'])} "
            f"compares with a heap reduction of {percent(ai['tiny']['heapReduction']['estimate'])}; plain aliasing reaches "
            f"{percent(ai['aliased']['heapReduction']['estimate'])}. With same-shape sessions, Tiny's JSON reduction of "
            f"{percent(rhyme['tiny']['jsonReduction'])} compares with a heap reduction of "
            f"{percent(rhyme['tiny']['heapReduction']['estimate'])}."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def heap_scaling(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Heap per session as the store grows, for every condition."""
    workloads = ("ai_context", "rhyme_differing", "rhyme_identical")
    fig, axes = plt.subplots(1, 3, figsize=(FULL_WIDTH_IN, 2.7))
    for ax, workload in zip(axes, workloads, strict=True):
        rows = [row for row in summary["heap"]["rows"] if row["workload"] == workload]
        for condition, style in CONDITION_STYLE.items():
            series = sorted((r for r in rows if r["condition"] == condition), key=lambda r: r["sessions"])
            if not series:
                continue
            ax.plot(
                [r["sessions"] for r in series],
                [r["heapPerSessionBytes"] for r in series],
                color=style["color"],
                marker=style["marker"],
                markersize=4.5,
                linewidth=1.3,
                label=style["label"],
            )
        ax.set_xscale("log", base=2)
        ax.set_xticks([16, 64, 256, 1024], ["16", "64", "256", "1024"])
        ax.set_ylim(bottom=0)
        ax.set_title(WORKLOAD_LABEL[workload].replace(", ", ",\n"), fontsize=8)
        ax.set_xlabel("Sessions")
    axes[0].set_ylabel("Heap per session (bytes)")
    handles, labels = axes[1].get_legend_handles_labels()
    fig.legend(handles, labels, loc="lower center", ncol=3, bbox_to_anchor=(0.5, -0.2))
    fig.subplots_adjust(wspace=0.32)
    save_figure(fig, out_dir / "heap_scaling.png")
    return FigureRecord(
        label="fig:heap_scaling",
        filename="heap_scaling.png",
        caption=(
            "Median V8 heap per session against the number of sessions, for each store design and workload. Panels "
            "use independent vertical scales, because the workloads differ in record size by more than an order of "
            "magnitude. The measuring host is reported in the Methods section."
        ),
        alt_text=(
            "Three panels of per-session heap against sessions, one line per store design. At the largest session "
            "count, with a shared prompt, the duplicated store holds "
            f"{_rows(summary, 'ai_context', largest_sessions(summary))['duplicated']['heapPerSessionBytes']:.0f} bytes per "
            f"session and Tiny {_rows(summary, 'ai_context', largest_sessions(summary))['tiny']['heapPerSessionBytes']:.0f}."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def materialization_latency(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Time to turn one stored session back into request text."""
    workloads = ("ai_context", "rhyme_differing")
    fig, axes = plt.subplots(1, 2, figsize=(FULL_WIDTH_IN, 2.5))
    for ax, workload in zip(axes, workloads, strict=True):
        rows = {r["condition"]: r for r in summary["latency"]["rows"] if r["workload"] == workload}
        conditions = [c for c in CONDITION_STYLE if c in rows]
        ceiling = max(rows[c]["p50Ns"]["high"] for c in conditions) / 1000
        for y, condition in enumerate(reversed(conditions)):
            style = CONDITION_STYLE[condition]
            row = rows[condition]
            estimate = row["p50Ns"]["estimate"] / 1000
            low = estimate - row["p50Ns"]["low"] / 1000
            high = row["p50Ns"]["high"] / 1000 - estimate
            ax.errorbar(
                estimate,
                y,
                xerr=[[max(low, 0)], [max(high, 0)]],
                marker=style["marker"],
                color=style["color"],
                markersize=7,
                capsize=2,
                linestyle="none",
            )
            ax.text(
                estimate + ceiling * 0.06, y, f"{row['ratioToDuplicated']['estimate']:.2f}x", va="center", fontsize=8
            )
        ax.set_yticks(range(len(conditions)), [CONDITION_STYLE[c]["label"] for c in reversed(conditions)])
        ax.set_ylim(-0.6, len(conditions) - 0.4)
        ax.set_xlim(0, ceiling * 1.5)
        ax.set_title(WORKLOAD_LABEL[workload])
        ax.set_xlabel("Materialize one session (µs, median)")
        ax.grid(axis="y", visible=False)
    fig.subplots_adjust(wspace=0.8)
    save_figure(fig, out_dir / "materialization_latency.png")
    rows = {(r["workload"], r["condition"]): r for r in summary["latency"]["rows"]}
    shipped = rows[("ai_context", "tiny")]["ratioToDuplicated"]["estimate"]
    no_clone = rows[("ai_context", "tiny_noclone")]["ratioToDuplicated"]["estimate"]
    return FigureRecord(
        label="fig:materialization_latency",
        filename="materialization_latency.png",
        caption=(
            "Time to turn one stored session back into its full request text, with each store's ratio to the duplicated "
            "store. Points are medians over independent processes, with percentile-bootstrap 95% intervals. Every "
            "condition reproduced the original text exactly. With a shared prompt, removing `structuredClone` from "
            f"reconstruction moves the ratio from {shipped:.2f} to {no_clone:.2f}."
        ),
        alt_text=(
            f"Two panels of medians. With a shared prompt, the shipped engine is "
            f"{rows[('ai_context', 'tiny')]['ratioToDuplicated']['estimate']:.2f} times the duplicated store and "
            f"{rows[('ai_context', 'tiny_noclone')]['ratioToDuplicated']['estimate']:.2f} times without cloning. With same-shape "
            f"sessions the ratios are {rows[('rhyme_differing', 'tiny')]['ratioToDuplicated']['estimate']:.2f} and "
            f"{rows[('rhyme_differing', 'tiny_noclone')]['ratioToDuplicated']['estimate']:.2f}."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )
