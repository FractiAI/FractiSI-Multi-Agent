# FractiSI · real ζ-23 trial

This directory is the **Anthropic / Alpöge–Furman** Lean 4 + Mathlib formalization of
“more than two thirds of the zeros of the Riemann zeta function are simple and on the
critical line” (arXiv:2608.13637; Anthropic research post 2026-08-10). Headline Montgomery–Taylor
window constant ≈ **0.6725** (67.2%). Definitions use Mathlib `riemannZeta`.

## What FractiSI times here

`../lean/timing/run-zeta23.mjs` — FractiSI agents claim the real library partitions
(ChallengeDeps, Challenge, Zeta23 proof tree, Solution), then `lake build Solution` under a
hard gate. **Anthropic’s published expedition is the non-FractiSI baseline** — we do not
re-run a no-kit arm for that comparison.

## Honesty

- RH remains **OPEN**. This formalizes a proportion lower bound, not RH.
- Proof authorship is upstream (Anthropic formal-math / paper authors). FractiSI measures
  **coordinated verification of the real Mathlib project**, not LLM rediscovery in this run.
- Toy Nat millesimal ablation under `../lean/` is demoted; it is not this science claim.
