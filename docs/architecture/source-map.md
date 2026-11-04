# Source map

Where each module went when the code was split into submodules, for reconciling branches and old references. Every old module path still works: it re-exports the new location.

## Research suite

| Old path, under `research/synthobs-tiny-gateway-rhyming-templates/` | Canonical location |
|---|---|
| `src/constants.mjs` | `src/experiments/constants.mjs` |
| `src/rng.mjs` | `src/core/rng.mjs` |
| `src/memory.mjs` | `src/core/bytes.mjs`, and `src/experiments/a-illustrative-model.mjs` for the illustrative model |
| `src/rhyming-template.mjs` | `src/engine/rhyming/` (`catalog.mjs`, `shape.mjs`, `codec.mjs`) |
| `src/holographic-rhyme-gate.mjs` | `src/engine/rhyming/gate.mjs` |
| `src/geometric-rhyme-route.mjs` | `src/engine/rhyming/route.mjs` |
| `src/context-buffer.mjs`, `src/context-compress-hooks.mjs` | `src/engine/context/` |
| `src/energy-proxy.mjs` | `src/engine/energy/proxy.mjs` |
| `src/h100-rhyme-sim.mjs` | `src/labs/h100-sim-lab.mjs` and `src/experiments/s-h100-rhyme-sim.mjs` |
| `src/nested-vector.mjs` | `src/engine/vectors/store.mjs` |
| `src/eight-node.mjs` | `src/engine/broadcast/eight-node.mjs` |
| `src/gateway.mjs` | `src/engine/gateway.mjs` |
| `src/experiments.mjs` | `src/experiments/`, one module per experiment, with `suite.mjs` running them together |
| `src/rhyme-vs-cache.mjs` | `src/experiments/rhyme-vs-cache.mjs` |
| `src/gpu-live-lab.mjs` | `src/labs/gpu-live-lab.mjs` and `src/labs/python-runner.mjs` |
| `src/gpu-llm-real-lab.mjs` | `src/labs/gpu-llm-real-lab.mjs` |
| `scripts/gpu_live_chat_hbm_lab.py` | `scripts/gpu_live_chat_hbm_lab.py` and `src/tiny_footprint_labs/gpu_live/` |
| `scripts/gpu_llm_real_lab.py` | `scripts/gpu_llm_real_lab.py` and `src/tiny_footprint_labs/llm/` |
| `scripts/h100_prefix_cache_sim.py` | `scripts/h100_prefix_cache_sim.py` and `src/tiny_footprint_labs/h100/` |
| `scripts/run_empirical_pipeline.mjs` | `src/pipeline/suite.mjs` and `src/reporting/suite-report.mjs` |
| `scripts/rhyme_vs_cache_sim.mjs` | A thin script over `src/experiments/rhyme-vs-cache.mjs` |

## Workstation

| Old path | Canonical location |
|---|---|
| `tiny-footprint/sdk/index.mjs` | `src/sdk/index.mjs` |
| `workloads/multi-session/run.mjs` | `src/workloads/multi-session.mjs` |
| `scripts/tiny.mjs` | `src/cli/main.mjs` and `src/cli/commands/` |
| `scripts/share-results.mjs` | `src/share/` |
| `scripts/localize-web-docs.mjs` | `src/docs_tools/localize-web.mjs` |
| `tests/correctness/sdk.test.mjs` | `tests/sdk/index.test.mjs` |
| `tests/correctness/engine-gate.test.mjs` | `tests/experiments/h-engine-pin-gate.test.mjs` |
| `tests/correctness/rhyme-vs-cache.test.mjs` | `tests/experiments/rhyme-vs-cache.test.mjs` |
| `tests/correctness/share-results.test.mjs` | `tests/share/index.test.mjs` |

## Documents

| Old path | New path |
|---|---|
| `docs/PRODUCT.md` | `docs/product/PRODUCT.md` |
| `docs/SIMPLE.md` | `docs/product/SIMPLE.md` |
| `docs/VALIDATION.md` | `docs/product/VALIDATION.md` |
| `docs/TECH.md` | `docs/research/TECH.md` |
| `docs/TECH_PAPER.md` | `docs/research/TECH_PAPER.md` |
| `benchmarks/reports/customer-benchmark.html` | Generated per machine and gitignored; a sample is at `docs/benchmarks/sample-customer-benchmark.html` |

## Behaviour that changed on purpose

Moving code preserved results: the deterministic experiments are byte-identical to the commit before the split, pinned by `tests/fixtures/golden-experiments-733b48e.json`. These behaviours changed deliberately.

| Before | Now | Why |
|---|---|---|
| A lab that failed to start returned the receipt already on disk | The lab reports `not_run` | A host with no GPU reported another machine's results as its own |
| `tiny benchmark` copied stored receipts into the report folder | Only this run's results are written | Same defect |
| The suite overwrote tracked receipts in `research/.../data/` | It writes under `output/data/suite/` | Historical evidence should not change when someone runs a benchmark |
| The verdict was pass or fail | `all_pass`, `incomplete` or `fail` | `not_run` is neither |
| The real-model lab ran one arm entirely before the other | Arms interleave in seeded order, from identical token ids | Order and tokenization could differ between arms |
| `generate` included prefill in its time | Prefill and decode are timed separately | They respond differently to prefix reuse |

## Merging upstream

FractiAI's v1.3 commit `733b48e` was ported here rather than copied, and experiment results match upstream's own code byte for byte (`tests/fixtures/`). One part was left out on purpose: upstream's `gpu-live-lab.mjs` reuses a stored GPU receipt by default and its suite counts that as a pass. That is the defect `src/labs/python-runner.mjs` exists to prevent, so a lab here still reports only what ran now.
