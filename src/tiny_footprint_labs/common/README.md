# Common

Helpers every lab uses.

## Contents

| Path | What it is |
|---|---|
| [`__init__.py`](__init__.py) | Helpers shared by every lab: statistics, receipts and NVIDIA device queries. |
| [`fingerprint.py`](fingerprint.py) | Source fingerprints, computed exactly as ``src/benchmarks/fingerprint.mjs`` computes them. |
| [`nvidia_smi.py`](nvidia_smi.py) | Device queries through ``nvidia-smi``; every call returns None or a stub when it is absent. |
| [`receipt.py`](receipt.py) | Lab outcomes and receipt writing. |
| [`stats.py`](stats.py) | Summaries of timing samples, in the field layout the receipts have always used. |
