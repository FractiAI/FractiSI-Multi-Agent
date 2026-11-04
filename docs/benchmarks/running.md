# Running the benchmarks

## As a customer

Node 18 or newer, and nothing else.

```bash
node scripts/tiny.mjs benchmark     # this machine, a few seconds
node scripts/tiny.mjs report        # writes the HTML report
```

Results land in `benchmarks/reports/`, which is gitignored. Every value describes this run on this machine. A lab that cannot run here says `not_run`, and the suite's verdict reads `incomplete` rather than passing. Add `--full` to `benchmark` for the full heap design.

## Reproducing the study

```bash
uv sync --group dev --group figures --group llm
npm test && uv run pytest
node scripts/run_pipeline.mjs
```

| Stage | Writes | Needs | Typical time |
|---|---|---|---|
| `deterministic` | `output/data/deterministic/` | Node | Under a second |
| `simulation` | `output/data/simulation/` | `uv sync` | Under a second |
| `suite` | `output/data/suite/` | Node | Under a second |
| `measured` | `output/data/measured/` | Node | A few minutes |
| `llm` | `output/data/measured/llm/` | `uv sync --group llm`, network for the first download | A few minutes |
| `analysis` | `output/data/analysis_summary.json` | Node | Under a second |
| `figures` | `output/figures/` | `uv sync --group figures` | Seconds |
| `hydrate` | `output/manuscript/`, variables | Node | Under a second |
| `docs` | `docs/benchmarks/RESULTS.md`, the README block | Node | Under a second |
| `render` | `output/pdf/`, the render receipt | A template checkout | Under a minute |
| `validate` | `output/reports/` | A template checkout | Seconds |
| `verify` | Nothing | Node | Seconds |

The pipeline checks what its selected stages need before it runs any of them, so a missing tool cannot stop it after earlier stages replaced their receipts.

Useful selections:

```bash
node scripts/run_pipeline.mjs --rebuild           # everything downstream of existing receipts; needs a template
node scripts/run_pipeline.mjs --only analysis,figures,hydrate,docs   # the same, stopping before the PDF
node scripts/run_pipeline.mjs --from analysis     # from one stage onward
node scripts/run_pipeline.mjs --only deterministic,analysis
```

Protocol parameters (trials, grids, seeds, model revisions) live in [`benchmarks/plan.json`](../../benchmarks/plan.json). Changing it, or any source under `src/core`, `src/engine`, `src/experiments` or `src/benchmarks`, makes the measured receipts stale. Verification reports that until they are measured again.

For timing work, run on a quiet machine. Receipts record the load average so a reader can judge.

## Rendering the manuscript

[docxology/template](https://github.com/docxology/template) renders the PDF. Point at a checkout and expose this repository inside it:

```bash
export TINY_TEMPLATE_ROOT=/path/to/template
ln -sfn "$PWD" "$TINY_TEMPLATE_ROOT/projects/working/tiny-footprint-workstation"
node scripts/render_manuscript.mjs
node scripts/validate_render.mjs
```

The script checks the view and prints that command if it is missing. It does not change the template itself. Rendering also needs `pandoc`, `pandoc-crossref` and a LaTeX distribution with `xelatex`. If the template's Python is not at `.venv/bin/python`, set `TINY_TEMPLATE_PYTHON`.

`validate_render.mjs` runs the template's own output validator: PDF, web edition, figure and evidence registries, and the design plan in `experiment_plan.yaml`. On success it writes `output/reports/rendered_provenance.json`, which binds the output to the source and to the template's stage code. Two of its requirements are easy to miss:

- The template must be a real Git checkout, and this repository must be in a folder named `tiny-footprint-workstation`, because the validator derives the expected PDF name from that folder.
- It binds only files Git knows about, so `git add` new files before validating.

## Checking a build

```bash
node scripts/verify_project.mjs
```

This re-runs the deterministic tier and compares it byte for byte, rejects measured receipts whose producer has changed, re-reduces the receipts, re-hydrates the manuscript, and checks the PDF against its receipt. Each line reads `PASS` or `FAIL`, and any failure exits non-zero. Use `--before-render` before a PDF exists.

## On another machine

The deterministic receipts stay identical and the measured values change, as they should. If you regenerate the measured tier, also read the interpretive sentences in `docs/manuscript/`: values update automatically, and sentences that characterize them may need rewriting if the picture changes.

The manuscript describes this study, so some sentences assume its setup. `benchmarks/plan.json` names `mps` for two real-model runs, and a host without that backend records `not_run` for them. The residency section needs an allocator reading, so on such a host hydration stops and says so. On another accelerator, change `backend` in the plan to one your host has and measure again. Hydration also stops, rather than print an empty value, when a token has nothing to report: for example, if the wrong-prefix control catches every model, there is no model for `LLM_CONTROL_MISSED` to name, and that sentence needs rewriting.

Figures are byte-stable on macOS arm64 with the locked Matplotlib. Other platforms can draw glyphs differently. The PDF's stamp is pinned to the measured run, so a rebuild with the same template and toolchain reproduces it byte for byte.
