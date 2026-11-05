# Reproducibility {#sec:reproducibility}

## Rebuilding {#sec:rebuild}

Every value in this document traces to a receipt. From a checkout, with a template checkout available for rendering:

```bash
uv sync --group dev --group figures --group llm
npm test                            # Node suite and repository gates
uv run pytest                       # Python suite
node scripts/run_pipeline.mjs       # all stages, in dependency order
node scripts/verify_project.mjs     # the provenance chain, end to end
```

The pipeline's order is the provenance order: plan and source, then receipts, then the analysis summary, then figures and their registry, then manuscript variables and the hydrated manuscript, then the rendered PDF and its receipt, then the template's own validator, which binds the output to the source and its stage code.

## What repeats and what does not {#sec:what_repeats}

The deterministic receipts are byte-identical across runs with the same plan and source. Verification re-executes that tier and compares the bytes. Figures regenerate byte-identically from the summary on the same library versions. The PDF is stamped with the measured run's start and not the clock, so rebuilding from the same receipts with the same template and toolchain reproduces it byte for byte. Measured receipts are not expected to repeat: they describe a host, and a rerun on another machine should produce different values while passing the same structural checks. The real-model lab downloads pinned model revisions; network access is needed only for that.

## Bindings for this build {#sec:bindings}

The plan hash is `{{PLAN_SHA256}}`. Measured receipts are bound to source fingerprint `{{SOURCE_FINGERPRINT}}`, covering {{SOURCE_FILES}} files, and verification rejects a receipt whose producer has changed. This build's token catalog holds {{TOKEN_COUNT}} values, each recording its source path in the analysis summary. Historical receipts are bound by hash, with the suite receipt at `{{HIST_SUITE_SHA256}}`. The renderer's commit and the PDF's hash are recorded in `output/data/render_receipt.json`.

## Gates {#sec:gates}

Automated gates enforce the structure this document relies on. Hydration fails on an unknown or empty token. The contract gate fails on a study value typed into an authored section, with negative controls. Other gates require a test mirroring every source module, keep dependencies pointing downward and scripts thin, require a guide in every folder, and check internal documentation links. Regression tests pin the corrected behaviour: a planted stale receipt must yield `not_run`.

## Declarations {#sec:declarations}

The source code, benchmarks and this draft were produced with an AI coding assistant (Claude, Anthropic) under the author's direction, and the author has reviewed the draft. Competing-interest and funding statements have not yet been provided. No participant data were used.
