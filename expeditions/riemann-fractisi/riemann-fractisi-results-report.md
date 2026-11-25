# Riemann FractiSI · results report

**Status:** real ζ-23 FractiSI **find** + capped no-kit find · RH **OPEN**  
**Harnesses:** `lean/timing/run-zeta23-find.mjs` · `lean/timing/run-zeta23-find-no-kit.mjs`  
**Receipts:** `lean/receipts/riemann-fractisi-zeta23-find-latest.json` · `…-find-no-kit-latest.json`

## Target

Anthropic [formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) — Mathlib `riemannZeta` Theorems A–E; Montgomery–Taylor window ≈ 0.6725. Baseline: [Anthropic Riemann post](https://www.anthropic.com/research/riemann-zeta) (~1.5 days · ~60 subagents · invent + formalize · 41.6% → 67.2%).

## Measured FractiSI find

| Metric | Value |
|---|---|
| Find wall clock (Challenge-only → Solution) | **11.66 s** |
| Proof modules discovered | 319 |
| Tasks / contributions / compositions | 4 / 4 / 1 |
| Challenge-only at t=0 | yes |
| lake build Solution | pass |
| axiomsOk (17 theorems) | pass (propext, Classical.choice, Quot.sound only) |

## Measured no-FractiSI find (capped)

| Metric | Value |
|---|---|
| Wall clock | **180.00 s** (cutoff) |
| FractiSI used | no |
| Sealed corpus available | no |
| Challenge sorries at end | **26** |
| Solution | absent |
| Outcome | `cutoff_no_solution` |

## Interpretation

FractiSI find = proofs absent at t=0 → discover sealed published modules → green Solution. No-kit find = same Challenge-only start without kit or sealed corpus → **zero invention progress in 3 minutes** → abort. Anthropic’s ~1.5 days is the published invention+formalize baseline for that open problem. Do not sell 11.66 s as idea-invention speedup.
