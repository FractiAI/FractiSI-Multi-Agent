# Extending

## Add an experiment

1. Add `src/experiments/<name>.mjs` with a `build…Workload(seed)` and an `experiment…()` that returns `id`, `title`, byte fields and `pass`.
2. Add `tests/experiments/<name>.test.mjs`.
3. Register it in `src/experiments/suite.mjs` and export it from `src/experiments/index.mjs`.
4. If it should count in the aggregate, add it in `src/benchmarks/deterministic/suite-bytes.mjs`, and add a round trip in `exactness.mjs` if it is lossless.

## Add a benchmark condition

1. Add the store to the workload in `src/benchmarks/measured/session-stores.mjs`, with `build`, `materialize` and `serializable`. The test there checks that it reproduces the wire text.
2. List it in `benchmarks/plan.json`.
3. Give it a label in `src/manuscript/tables.mjs` and a style in `src/tiny_footprint_labs/figures/style.py`.
4. Measure again: `node scripts/run_pipeline.mjs --from measured`.

## Add a result to the manuscript

1. Make sure the analysis summary holds the raw value (`src/analysis/`).
2. Bind a token in `src/manuscript/tokens.mjs`, with its source path and format.
3. Write `{{YOUR_TOKEN}}` in a section under `docs/manuscript/`.
4. Run `node scripts/run_pipeline.mjs --rebuild`.

Hydration fails on an unknown token and on a token no section uses. A typed number fails the contract gate.

## Add a figure

1. Add a function in `src/tiny_footprint_labs/figures/` returning a `FigureRecord`, with a caption built from the data and separately written alternative text.
2. Call it from `build.py`.
3. Reference it in a section as `![{{FIG_NAME_CAPTION}}](../../output/figures/name.png){#fig:name width=92%}`. The caption token is derived from the label.
4. Add its label to `expected_figures` in `experiment_plan.yaml`.

## Add a claim

Add an entry in `src/analysis/claims.mjs`. Compute the status from the summary, and add a test that changing the data changes it.

## Add a CLI command

Add `src/cli/commands/<name>.mjs` exporting a function that takes the context and returns an exit code, register it in `src/cli/main.mjs`, add a test, and document it in [the CLI reference](../reference/cli.md).
