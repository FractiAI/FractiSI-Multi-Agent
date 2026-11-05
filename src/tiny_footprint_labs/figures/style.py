"""Shared figure style: one color and one marker per entity across every figure.

Colors come from a palette checked for color-vision separation; two of its hues are
below 3:1 contrast on the surface, so every series also carries a distinct marker and
a direct or legend label, and each figure's numbers appear in a manuscript table.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

SURFACE = "#fcfcfb"
TEXT_PRIMARY = "#0b0b0b"
TEXT_SECONDARY = "#52514e"
GRID = "#e4e3df"
REFERENCE_LINE = "#52514e"

BLUE = "#2a78d6"
ORANGE = "#eb6834"
AQUA = "#1baf7a"
YELLOW = "#eda100"
VIOLET = "#6250d6"

# Ordered single-hue ramp for ordered series, light to dark.
BLUE_RAMP = ("#86b6ef", "#5598e7", "#2a78d6", "#154e96")

CONDITION_STYLE: dict[str, dict[str, str]] = {
    "duplicated": {"color": ORANGE, "marker": "s", "label": "Duplicated"},
    "aliased": {"color": YELLOW, "marker": "^", "label": "Aliased (plain reference)"},
    "tiny": {"color": BLUE, "marker": "o", "label": "Tiny (engine as shipped)"},
    "tiny_compact": {"color": VIOLET, "marker": "D", "label": "Tiny compact (bare deltas)"},
    "tiny_noclone": {"color": VIOLET, "marker": "D", "label": "Tiny without clone"},
    "exact_cache": {"color": AQUA, "marker": "X", "label": "Exact-text cache"},
}

WORKLOAD_LABEL: dict[str, str] = {
    "ai_context": "Shared system prompt, different turns",
    "rhyme_differing": "Same shape, different words",
    "rhyme_identical": "Identical sessions",
}

FIGURE_DPI = 200
FULL_WIDTH_IN = 7.2


def apply_style() -> None:
    """Install the shared rcParams. Recessive axes, no chart junk, one bundled font."""
    plt.rcParams.update(
        {
            "figure.facecolor": SURFACE,
            "axes.facecolor": SURFACE,
            "savefig.facecolor": SURFACE,
            "font.family": "DejaVu Sans",
            "font.size": 9,
            "text.color": TEXT_PRIMARY,
            "axes.labelcolor": TEXT_SECONDARY,
            "axes.edgecolor": GRID,
            "axes.linewidth": 0.8,
            "axes.titlesize": 9.5,
            "axes.titleweight": "bold",
            "axes.titlelocation": "left",
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": True,
            "grid.color": GRID,
            "grid.linewidth": 0.6,
            "axes.axisbelow": True,
            "xtick.color": TEXT_SECONDARY,
            "ytick.color": TEXT_SECONDARY,
            "xtick.major.size": 0,
            "ytick.major.size": 0,
            "legend.frameon": False,
            "legend.fontsize": 8,
            "lines.linewidth": 1.6,
            "lines.markersize": 5.5,
        }
    )


def save_figure(fig: Any, path: Path) -> None:
    """Write a byte-stable PNG: no timestamp or software metadata."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=FIGURE_DPI, metadata={"Software": None}, bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


def value_label(ax: Any, x: float, y: float, text: str, **kwargs: Any) -> None:
    """A direct label with a surface halo, so a reference line never strikes through it."""
    style = {"va": "center", "fontsize": 8, "bbox": {"facecolor": SURFACE, "edgecolor": "none", "pad": 0.8}}
    ax.text(x, y, text, **{**style, **kwargs})


def percent(value: float, digits: int = 1) -> str:
    """Format a ratio as a percentage, with one fixed precision everywhere."""
    return f"{value * 100:.{digits}f}%"
