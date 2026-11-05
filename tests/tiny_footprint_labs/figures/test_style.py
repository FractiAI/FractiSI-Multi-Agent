from pathlib import Path

import matplotlib.pyplot as plt

from tiny_footprint_labs.figures.style import CONDITION_STYLE, apply_style, percent, save_figure, value_label


def test_each_entity_keeps_a_distinct_marker_and_label() -> None:
    labels = [style["label"] for style in CONDITION_STYLE.values()]
    assert len(set(labels)) == len(labels)
    colors_and_markers = {(style["color"], style["marker"]) for style in CONDITION_STYLE.values()}
    # The two ablations never share a figure, so they may share a style.
    assert len(colors_and_markers) == len(CONDITION_STYLE) - 1


def test_saved_figures_are_byte_stable(tmp_path: Path) -> None:
    def draw(path: Path) -> bytes:
        apply_style()
        fig, ax = plt.subplots(figsize=(2, 2))
        ax.plot([0, 1], [0, 1])
        value_label(ax, 0.5, 0.5, "label")
        save_figure(fig, path)
        return path.read_bytes()

    first = draw(tmp_path / "a.png")
    assert first == draw(tmp_path / "b.png")
    assert b"Software" not in first[:200]


def test_percent_format() -> None:
    assert percent(0.8451) == "84.5%"
    assert percent(0.8, 0) == "80%"
