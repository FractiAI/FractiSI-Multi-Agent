# Testing

```bash
npm test                                           # Node tests and repository gates
npm run coverage                                   # the same, with coverage (Node 22+)
uv run pytest                                      # Python tests
uv run pytest --cov                                # with the 90% floor
uv run ruff check src/tiny_footprint_labs tests/tiny_footprint_labs tests/integration scripts
uv run mypy                                        # CI runs these two as well
```

## Tests mirror the source

`src/core/stats.mjs` is tested by `tests/core/stats.test.mjs`. `src/tiny_footprint_labs/llm/kv.py` is tested by `tests/tiny_footprint_labs/llm/test_kv.py`. A gate enforces both directions: a module needs a test, and a test needs a module. Barrels that only re-export are exempt, and two folders have no source counterpart:

- [`tests/fixtures/`](../../tests/fixtures/README.md) holds captured data.
- [`tests/integration/`](../../tests/integration/README.md) holds tests that cross modules or run the real entry points.

## Real data, no mocks

Tests run the real code on real inputs. They use temporary directories, real child processes, and for the LLM lab a small randomly initialized GPT-2 saved locally, with real forward passes and no network. When a test seems to need a mock, extract a pure function and test that.

`src/tiny_footprint_labs/gpu_live/` is the exception that proves the rule. `cuda.py`, `latency.py` and `lab.py` need NVIDIA hardware, so tests cover what can run without it (the accounting, and the `not_run` path), and coverage omits those three files. This is stated in `pyproject.toml`. Their device behaviour has not been re-run since the code was split.

## Verifiers need negative controls

A gate that cannot fail proves nothing. Every verifier has a test that feeds it a known-bad input and asserts that it fails: `tests/verification/project.test.mjs` tampers with each artifact, `tests/manuscript/contract.test.mjs` plants typed numbers, and the gate tests build broken trees.

## Golden results

`tests/fixtures/golden-experiments-0dcf9d2.json` holds the deterministic experiments' output from the commit before the code was split. Each experiment test compares against it byte for byte, so moving code cannot change a result unnoticed. Changing a result on purpose means regenerating that file and explaining why in the commit.

## Tests that read committed evidence

Several tests compare against `output/`, so they fail when evidence is stale. That is intended: run `node scripts/run_pipeline.mjs --rebuild`, or the full pipeline if measured receipts are stale, then commit the result.
