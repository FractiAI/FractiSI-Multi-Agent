# FractiAI decisions on PR #3 (Daniel’s study)

Reply context for [PR #3](https://github.com/FractiAI/tiny-footprint-workstation/pull/3).

## What we accept from the study

- Prefix sharing is the performing mechanism; production exact-prefix caches already do it.
- Live-heap rhyme does not beat a plain object reference on the measured Mac host.
- Rebuild latency with `structuredClone` on every materialize was **1.69×–11.81×** a duplicated store — claim of “faster rebuild” is **not reproduced**.
- Aggregate **84.5%** JSON-byte figure reproduces; it is not an 80% DRAM/HBM product proof.
- GPU nvidia-smi / HtoD need NVIDIA; marked not testable on Daniel’s host.

## Expanded cache role (product tune)

Tiny’s product story is retuned to: **widen what the cache bank can hold** (exact + organizational near-dupe), not “rhyme beats prefix cache on RAM.” Public traffic mixes are mostly exact; near-dupe is the incremental wedge.

## Rebuild fix in this follow-up branch

`reconstructExpression` / `mergeDelta` accept `{ clone: false }`. Serialize-only materialize paths (shipped `tiny` store → `JSON.stringify`) use `clone: false` so they no longer pay the clone tax Daniel measured. Callers that retain mutable objects keep default `clone: true`.

## Calls Daniel listed

| Call | Decision |
|------|----------|
| Canonical paper copy | **`docs/research/TECH_PAPER.md`** is the frozen whitepaper path in the restructured kit. Suite `research/.../docs` and `paper/` must stay byte-synced to it (CI paper-copy gate). Fix `main` by syncing `TECH_PAPER` after #2 drift. |
| “80% DRAM” in paper title | Retitle research target to **representation / duplicated-resident-state** (not DRAM/HBM product claim). Leave full manuscript retitle to the paper edit pass when #3 lands; do not feature 80% DRAM on product pages. |
| Licence | Keep **`UNLICENSED` / NOASSERTION** for now (Community kit on GitHub remains the practical access path). Licence choice is a separate Player 1 call. |

## Merge posture

Do **not** merge #3 until product pages match the ledger (this branch). After merge, re-run `node scripts/tiny.mjs benchmark` on the GeForce laptop for nvidia-smi / HtoD.

→ ∞^∞
