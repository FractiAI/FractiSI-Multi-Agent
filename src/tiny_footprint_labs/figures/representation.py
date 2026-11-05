"""Figures over representation bytes: deterministic, identical on every machine."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

from tiny_footprint_labs.figures.registry import FigureRecord
from tiny_footprint_labs.figures.style import (
    AQUA,
    BLUE,
    BLUE_RAMP,
    FULL_WIDTH_IN,
    ORANGE,
    REFERENCE_LINE,
    TEXT_SECONDARY,
    percent,
    save_figure,
    value_label,
)

SOURCE = "output/data/analysis_summary.json"
GENERATOR = "src/tiny_footprint_labs/figures/representation.py"


def workload_reductions(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Per-workload reduction, the gzip yardstick, and the target line."""
    workloads = summary["deterministic"]["suite"]["workloads"]
    gzip_by_key = {w["key"]: w["gzipReduction"] for w in summary["compression"]["workloads"]}
    target = summary["target"]
    rows = list(reversed(workloads))
    positions = range(len(rows))

    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 3.0))
    for y, workload in zip(positions, rows, strict=True):
        selective = workload["key"] == "E"
        ax.barh(
            y,
            workload["ratio"] * 100,
            height=0.46,
            color=BLUE,
            alpha=0.45 if selective else 1.0,
            hatch="////" if selective else None,
            edgecolor="white" if selective else BLUE,
            linewidth=0,
        )
        ax.text(workload["ratio"] * 100 + 1, y + 0.30, percent(workload["ratio"]), va="center", fontsize=8)
        if workload["key"] in gzip_by_key:
            ax.plot(gzip_by_key[workload["key"]] * 100, y, marker="D", color=ORANGE, linestyle="none", markersize=6)
    ax.axvline(target * 100, color=REFERENCE_LINE, linestyle="--", linewidth=1)
    ax.text(
        target * 100, len(rows) - 0.42, f" {percent(target, 0)} target", color=TEXT_SECONDARY, fontsize=8, va="bottom"
    )
    ax.set_yticks(list(positions), [f"{w['key']}  {w['label']}" for w in rows])
    ax.set_xlim(0, 108)
    ax.set_xlabel("Reduction in UTF-8 JSON bytes versus the workload's conventional arm (%)")
    ax.grid(axis="y", visible=False)
    ax.legend(
        handles=[
            Line2D([0], [0], color=BLUE, linewidth=6, label="Tiny Footprint form"),
            Line2D([0], [0], color=ORANGE, marker="D", linestyle="none", label="gzip of the conventional JSON"),
        ],
        loc="lower left",
        bbox_to_anchor=(0.0, 1.06),
        ncol=2,
    )
    save_figure(fig, out_dir / "workload_reductions.png")
    by_key = {w["key"]: w for w in workloads}
    beats = sorted(key for key, value in gzip_by_key.items() if value > by_key[key]["ratio"])
    trails = sorted(key for key, value in gzip_by_key.items() if value <= by_key[key]["ratio"])
    return FigureRecord(
        label="fig:workload_reductions",
        filename="workload_reductions.png",
        caption=(
            "Representation-byte reduction for each registered workload, computed as one minus the Tiny Footprint "
            "form's UTF-8 JSON bytes over the conventional arm's. Diamonds show gzip applied to the same conventional "
            f"JSON (zlib {summary['compression']['zlib']}). Workload E is hatched because its working set covers "
            "one request and is not a lossless representation. These are serialized sizes, not resident memory."
        ),
        alt_text=(
            f"Horizontal bars of reduction by workload: B {percent(by_key['B']['ratio'])}, "
            f"C {percent(by_key['C']['ratio'])}, D {percent(by_key['D']['ratio'])}, E {percent(by_key['E']['ratio'])}, "
            f"F {percent(by_key['F']['ratio'])}. gzip reaches further than the bar for {', '.join(beats)} and "
            f"less far for {', '.join(trails)}."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def aggregate_sensitivity(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """The aggregate under alternative workload selections and weightings."""
    sensitivity = summary["deterministic"]["sensitivity"]
    target = sensitivity["target"]
    rows = [
        (sensitivity["published"]["label"], sensitivity["published"]["ratio"]),
        (sensitivity["unweightedMean"]["label"], sensitivity["unweightedMean"]["ratio"]),
        (sensitivity["lossless"]["label"], sensitivity["lossless"]["ratio"]),
        (sensitivity["nonStrawman"]["label"], sensitivity["nonStrawman"]["ratio"]),
        *[(item["label"], item["ratio"]) for item in sensitivity["leaveOneOut"]],
    ]
    rows = list(reversed(rows))
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 3.4))
    for y, (_, ratio) in enumerate(rows):
        clears = ratio >= target
        ax.plot([0, ratio * 100], [y, y], color=BLUE, linewidth=1.2, alpha=0.5)
        ax.plot(
            ratio * 100,
            y,
            marker="o",
            markersize=7,
            color=BLUE,
            markerfacecolor=BLUE if clears else "white",
            markeredgewidth=1.6,
            linestyle="none",
        )
        value_label(ax, ratio * 100 + 1.4, y, percent(ratio))
    ax.axvline(target * 100, color=REFERENCE_LINE, linestyle="--", linewidth=1)
    ax.set_yticks(range(len(rows)), [label for label, _ in rows])
    ax.set_xlim(0, 100)
    ax.set_xlabel("Aggregate reduction in representation bytes (%)")
    ax.grid(axis="y", visible=False)
    ax.legend(
        handles=[
            Line2D([0], [0], marker="o", color=BLUE, linestyle="none", label="Clears the target"),
            Line2D(
                [0],
                [0],
                marker="o",
                color=BLUE,
                markerfacecolor="white",
                markeredgewidth=1.6,
                linestyle="none",
                label="Below the target",
            ),
            Line2D([0], [0], color=REFERENCE_LINE, linestyle="--", linewidth=1, label=f"{percent(target, 0)} target"),
        ],
        loc="lower left",
        bbox_to_anchor=(0.0, 1.0),
        ncol=3,
    )
    save_figure(fig, out_dir / "aggregate_sensitivity.png")
    return FigureRecord(
        label="fig:aggregate_sensitivity",
        filename="aggregate_sensitivity.png",
        caption=(
            "The aggregate reduction under alternative selections and weightings of the same five workloads. The "
            "published aggregate sums bytes, so each workload counts in proportion to its baseline size. Hollow "
            "markers fall below the target. All values are deterministic."
        ),
        alt_text=(
            f"Lollipop chart of aggregate definitions. Published {percent(sensitivity['published']['ratio'])} clears the "
            f"{percent(target, 0)} line; equal weighting {percent(sensitivity['unweightedMean']['ratio'])}, lossless only "
            f"{percent(sensitivity['lossless']['ratio'])}, and without the anti-pattern baseline "
            f"{percent(sensitivity['nonStrawman']['ratio'])} do not."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def session_scaling(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Measured reduction against the closed form, as sessions and turns vary."""
    scaling = summary["deterministic"]["scaling"]
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 3.4))
    for color, series in zip(BLUE_RAMP, scaling["series"], strict=True):
        xs = [p["sessions"] for p in series["points"]]
        ax.plot(xs, [p["predicted"] * 100 for p in series["points"]], color=color, linestyle="--", linewidth=1)
        ax.plot(
            xs, [p["measured"] * 100 for p in series["points"]], color=color, marker="o", markersize=4, linewidth=1.4
        )
        last = series["points"][-1]
        ax.text(
            xs[-1] * 1.12,
            last["measured"] * 100,
            f"{series['turns']} turn{'' if series['turns'] == 1 else 's'}, f = {series['sharedFractionAtLargestN']:.2f}",
            va="center",
            fontsize=8,
        )
    ax.set_xscale("log", base=2)
    ax.set_xlim(1, 1024 * 6)
    ax.set_xticks([1, 4, 16, 64, 256, 1024], ["1", "4", "16", "64", "256", "1024"])
    ax.axhline(0, color=REFERENCE_LINE, linewidth=0.8)
    ax.set_xlabel("Sessions sharing one system prompt")
    ax.set_ylabel("Reduction in JSON bytes (%)")
    ax.legend(
        handles=[
            Line2D([0], [0], color=TEXT_SECONDARY, marker="o", markersize=4, linewidth=1.4, label="Measured"),
            Line2D([0], [0], color=TEXT_SECONDARY, linestyle="--", linewidth=1, label="Predicted, f(1 - 1/n)"),
        ],
        loc="upper left",
        bbox_to_anchor=(0.0, 1.14),
        ncol=2,
    )
    save_figure(fig, out_dir / "session_scaling.png")
    series = scaling["series"]
    return FigureRecord(
        label="fig:session_scaling",
        filename="session_scaling.png",
        caption=(
            "Reduction in JSON bytes as the number of sessions sharing one system prompt grows, for four conversation "
            "lengths. Markers are measured on the real encoding; dashed lines are the closed form $R(n) = f(1 - 1/n)$, "
            "where $f$ is the shared fraction. The reduction saturates at $f$, and $f$ falls as sessions accumulate turns."
        ),
        alt_text=(
            f"Four rising curves on a log scale of sessions, saturating near {percent(series[0]['measuredAtLargestN'])}, "
            f"{percent(series[1]['measuredAtLargestN'])}, {percent(series[2]['measuredAtLargestN'])} and "
            f"{percent(series[3]['measuredAtLargestN'])} for progressively longer conversations; predicted lines track the measurements."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def rhyme_crossover(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """Bytes under each design as sessions become exact duplicates."""
    crossover = summary["deterministic"]["crossover"]
    points = crossover["points"]
    xs = [p["duplicateFraction"] * 100 for p in points]
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 3.2))
    arms = (
        ("naiveBytes", "Keep every session", ORANGE, "s"),
        ("cacheBytes", "Exact-text cache", AQUA, "X"),
        ("rhymeBytes", "Rhyme", BLUE, "o"),
    )
    for key, label, color, marker in arms:
        ax.plot(xs, [p[key] / 1024 for p in points], color=color, marker=marker, label=label)
    first = crossover["cacheFirstSmallerAt"]
    ax.axvline(first * 100, color=REFERENCE_LINE, linestyle="--", linewidth=1)
    midway = (points[0]["naiveBytes"] + points[0]["rhymeBytes"]) / 2 / 1024
    value_label(ax, first * 100 + 1, midway, "First grid point where the cache is smaller", color=TEXT_SECONDARY)
    ax.set_ylim(bottom=0)
    ax.set_xlabel("Sessions that repeat one identical record (%)")
    ax.set_ylabel("Stored bytes (KiB of JSON)")
    ax.legend(loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=3)
    save_figure(fig, out_dir / "rhyme_crossover.png")
    return FigureRecord(
        label="fig:rhyme_crossover",
        filename="rhyme_crossover.png",
        caption=(
            f"JSON bytes for {crossover['sessions']} same-shaped sessions as a growing share of them repeat one identical "
            "record. The rhyme stays nearly flat because it records every session; the exact-text cache improves with "
            "every duplicate. Reconstruction matched the original at every point. In-process bytes, not device memory."
        ),
        alt_text=(
            f"Three lines of bytes against duplicate share. The rhyme is flat near {points[0]['rhymeBytes'] / 1024:.1f} KiB; "
            f"the cache falls from {points[0]['cacheBytes'] / 1024:.1f} KiB to {points[-1]['cacheBytes'] / 1024:.2f} KiB, "
            f"crossing below the rhyme by {percent(first, 0)} duplicates."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )


def gpu_proxy_sensitivity(summary: dict[str, Any], out_dir: Path) -> FigureRecord:
    """The allocation figure as a function of the lab's assumed delta fraction."""
    proxy = summary["deterministic"]["gpuProxy"]
    target = summary["target"]
    assumed = proxy["assumedDeltaFraction"]
    xs = [p["deltaFraction"] * 100 for p in proxy["sweep"]]
    fig, ax = plt.subplots(figsize=(FULL_WIDTH_IN, 3.0))
    ax.plot(xs, [p["reductionRatio"] * 100 for p in proxy["sweep"]], color=BLUE, marker="o", markersize=4)
    at = proxy["atAssumedFraction"]["reductionRatio"]
    ax.plot(assumed * 100, at * 100, marker="o", markersize=9, color=BLUE, markerfacecolor="white", markeredgewidth=1.8)
    ax.annotate(
        f"Lab's assumption: {percent(at)}",
        (assumed * 100, at * 100),
        xytext=(assumed * 100 + 8, at * 100 + 4),
        fontsize=8,
        arrowprops={"arrowstyle": "-", "color": TEXT_SECONDARY, "linewidth": 0.8},
    )
    ax.axhline(target * 100, color=REFERENCE_LINE, linestyle="--", linewidth=1)
    ax.text(100, target * 100 + 0.6, f"{percent(target, 0)} target", ha="right", color=TEXT_SECONDARY, fontsize=8)
    ax.set_ylim(50, 95)
    ax.set_xlabel("Per-session delta, as a share of the KV buffer (%)")
    ax.set_ylabel("Allocation reduction (%)")
    save_figure(fig, out_dir / "gpu_proxy_sensitivity.png")
    worst = proxy["sweep"][-1]
    below = next(p for p in proxy["sweep"] if p["reductionRatio"] < target)
    return FigureRecord(
        label="fig:gpu_proxy_sensitivity",
        filename="gpu_proxy_sensitivity.png",
        caption=(
            "The GPU lab's allocation reduction recomputed from its requested buffer sizes, as a function of the "
            "assumed per-session delta. The open marker is the value hard-coded in the lab, which reproduces the "
            "published figure exactly and needs no GPU. No experiment in this repository measures that fraction."
        ),
        alt_text=(
            f"A falling line from {percent(proxy['sweep'][0]['reductionRatio'])} at a small delta to "
            f"{percent(worst['reductionRatio'])} at a delta equal to the whole KV buffer; the lab's assumption sits at "
            f"{percent(at)}, and it is below the {percent(target, 0)} target by a delta of {percent(below['deltaFraction'], 0)}."
        ),
        generated_by=GENERATOR,
        source=SOURCE,
    )
