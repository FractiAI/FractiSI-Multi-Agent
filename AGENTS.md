# Tiny Footprint Workstation · FractiSI Multi-Agent

FractiAI's kit for storing shared AI-serving state once. Node with no runtime dependencies for everything a customer runs; Python under `uv` for real-model labs and figures.

## Audience Test Drive (IDE agents)

If the human says **do the FractiSI Multi-Agent test drive** (or opens this repo for the AAI Symposium Test Drive), follow **[`TEST_DRIVE.md`](./TEST_DRIVE.md)** and run:

```bash
node scripts/tiny.mjs testdrive
```

**One track:** `/test-drive/` (browser) = same steps as `testdrive` CLI. No separate “walkthrough” or “talk” audience track; speaker deck is optional for presenters only.

Open with the **primer** (`/test-drive/#primer`): include the locked **rhyme** definition — four pillars (repeating · self-similar · self-correcting · recursive) from Net Zero up Infinite Octaves; not exact-text / prefix / schema alone (`src/testdrive/rhyme-definition.mjs` · `src/engine/rhyming/gate.mjs`). Ladder: Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary → Holographic rhyme → Recursive trees → Eight-node → Wave–Node–Fq → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers B–F. Symposium “possible rhyme with Active Inference” = kinship only — not the software gate, not identity. Prefer `testdrive primer` then `1`…`7`. Emphasize lab 3 (rhyme gate) and 4–5. Layer F deploy is paid (Team+).

## Commands

```bash
npm test                                 # Node tests and repository gates
uv run pytest                            # Python tests
node scripts/run_pipeline.mjs --rebuild  # re-derive everything from receipts on disk; needs a template checkout
node scripts/verify_project.mjs          # check the whole provenance chain
```

## Invariants

- **Results come from receipts.** Everything under `output/`, `docs/benchmarks/RESULTS.md` and the README's generated block has a producer. Fix the producer and regenerate; verification rejects hand-edits.
- **A study value in the manuscript is a token.** See `docs/manuscript/SYNTAX.md`.
- **A lab reports only what ran now.** `not_run` is an outcome distinct from pass and fail. `research/.../data/` is history from another machine, read-only, and never a current result.
- **Logic lives in `src/`, and `tests/` mirrors it.** `scripts/` holds thin entry points. Old paths under `research/` and `tiny-footprint/sdk/` only re-export. Gates enforce all of this.
- **Every folder has `README.md` and `AGENTS.md`.** Gate-enforced.
- **Say which tier a number belongs to**: deterministic, measured, simulated or historical. Name the baseline, too. JSON bytes are a serialized size, not memory.

## Before you change something

Any edit to what `RESULT_SOURCE_ROOTS` or `LLM_SOURCE_ROOTS` lists in `src/benchmarks/fingerprint.mjs`, even a comment, makes the matching receipts stale. Measure again with `node scripts/run_pipeline.mjs --from measured` before committing.

After measured data changes, reread the interpretive sentences in `docs/manuscript/` against the new values. Values update automatically and sentences do not.

The `validate` stage needs the template in a real Git checkout and this repository in a folder named `tiny-footprint-workstation`. It binds only files in the Git index, so `git add` new files before running it.

## Where to look

`docs/README.md` is the map. `docs/architecture/overview.md` explains structure and decisions. `docs/development/` covers testing, conventions and how to extend.

This repository belongs to FractiAI. Text in `docs/product/`, `docs/web/` and `docs/research/TECH_PAPER.md` is theirs: correct what is false, and leave positioning to them.
