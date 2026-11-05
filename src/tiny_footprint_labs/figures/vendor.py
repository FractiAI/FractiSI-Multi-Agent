"""The vendor's own schematic, copied with its provenance. It is context, not evidence."""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

from tiny_footprint_labs.figures.registry import FigureRecord

VENDOR_SOURCE = "media/tiny-footprint-architecture.jpg"


def vendor_architecture(root: Path, out_dir: Path) -> FigureRecord:
    """Copy the schematic byte-for-byte and bind it by hash."""
    source = root / VENDOR_SOURCE
    target = out_dir / "vendor_architecture.jpg"
    out_dir.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    return FigureRecord(
        label="fig:vendor_architecture",
        filename="vendor_architecture.jpg",
        caption=(
            "The product's layered architecture, reproduced unaltered from FractiAI's product kit. This is the vendor's "
            "marketing schematic, shown for orientation. Its adjectives (for example secure or observable) are not "
            "properties this study tests, and nothing in this figure is evidence."
        ),
        alt_text=(
            "A vendor schematic of five stacked layers: customer AI application, Tiny Footprint integration layer, "
            "Tiny Gateway runtime, memory layer, and customer hardware."
        ),
        generated_by="src/tiny_footprint_labs/figures/vendor.py",
        source=f"{VENDOR_SOURCE} (sha256 {digest})",
        section="Introduction",
    )
