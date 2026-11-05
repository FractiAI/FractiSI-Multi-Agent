# Figures

Each figure is one function: it reads the analysis summary, writes a PNG, and returns a record with a caption and alternative text built from the same data.

## Contents

| Path | What it is |
|---|---|
| [`__init__.py`](__init__.py) | Manuscript figures, rendered from the canonical analysis summary. |
| [`build.py`](build.py) | Build every figure and the registry from the canonical analysis summary. |
| [`llm.py`](llm.py) | Figures over the real-model lab: forward passes and key-value residency. |
| [`measured.py`](measured.py) | Figures over measurements taken on one host: real heap and real wall clock. |
| [`registry.py`](registry.py) | The figure registry the template reads: label, file, caption, generator and alt text. |
| [`representation.py`](representation.py) | Figures over representation bytes: deterministic, identical on every machine. |
| [`style.py`](style.py) | Shared figure style: one color and one marker per entity across every figure. |
| [`vendor.py`](vendor.py) | The vendor's own schematic, copied with its provenance. |
