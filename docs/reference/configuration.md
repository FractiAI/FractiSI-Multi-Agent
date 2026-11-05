# Configuration

## `tiny-footprint/configuration/default.json`

Documented in [its folder guide](../../tiny-footprint/configuration/README.md).

## Environment variables

### Customer kit

| Variable | Effect | Default |
|---|---|---|
| `TINY_FOOTPRINT_SESSIONS` | Sessions in the demo workload | `12` |
| `TINY_FOOTPRINT_REPORTS_DIR` | Where receipts and reports are written | `benchmarks/reports` |
| `TINY_FOOTPRINT_PYTHON` | Python for the GPU lab | `py -3` on Windows, otherwise `python3` |
| `TINY_FOOTPRINT_FORCE_LLM_LAB` | `1` runs the real-model lab during `benchmark` | Off |
| `TINY_FOOTPRINT_LLM_PYTHON` | Python for the real-model lab | `.venv`, then `.venv-cuda` |

### Share path

| Variable | Effect |
|---|---|
| `TINY_FOOTPRINT_SHARE_EMAIL` | Results recipient. Default `valetpru@gmail.com` |
| `TINY_FOOTPRINT_PARTICIPANT_NAME`, `_EMAIL`, `_ORG` | Prefill participant details |
| `TINY_FOOTPRINT_SMTP_HOST`, `_USER`, `_PASS` | Enable silent SMTP. Windows only |
| `TINY_FOOTPRINT_SMTP_FROM` | Sender. Defaults to the user |
| `TINY_FOOTPRINT_SMTP_PORT` | Port. Default `587`, digits only |

### Rendering

| Variable | Effect |
|---|---|
| `TINY_TEMPLATE_ROOT` | A [docxology/template](https://github.com/docxology/template) checkout. Required to render |
| `TINY_TEMPLATE_PYTHON` | The template's Python. Default `<root>/.venv/bin/python` |
| `SOURCE_DATE_EPOCH` | The PDF's stamp, in seconds. Defaults to the start of the measured run, so rendering does not depend on the clock |

`.env.example` predates these tables and nothing loads it automatically, so where it differs from a default above, the default is what the code uses.

## `benchmarks/plan.json`

The benchmark protocol: seeds, grids, trial counts and pinned model revisions. A malformed plan stops the run. There are no fallback defaults, so what ran is always what the plan says.

## `pyproject.toml`

Python tooling only: dependency groups (`dev`, `figures`, `llm`), pytest, coverage, ruff and mypy. The Windows DirectML environment for the original lab is pinned separately in `research/synthobs-tiny-gateway-rhyming-templates/requirements-directml.txt`.
