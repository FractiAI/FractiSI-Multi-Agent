# Riemann FractiSI Expedition · Results Report

**Product:** FractiSI Multi-Agent · Tiny Footprint (Tiny Gateway™)  
**Date:** 2026-11-24 (America/Los_Angeles)  
**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`

---

## Core finding

FractiSI Multi-Agent coordinated four specialized agents to construct and obtain Lean verification of a collection of finite mathematical propositions related to the Riemann hypothesis in approximately **5.3 seconds**.

That demonstrates a functioning rapid multi-agent mathematical workflow with machine-verified output. It does **not** establish a controlled 20,000× speed advantage, and it does **not** prove RH.

| | Anthropic reference | FractiSI Phase N |
|---|---|---|
| Task | FLT Lean formalization | Finite RH-adjacent Props |
| Agents | ~1000 | 4 |
| Wall clock | **~30 hours** | **5.326586 seconds** |
| Verification | Lean | Lean (no `sorry`) |
| RH solved? | No | No |

Nominal ratio ~20,300× (30 h ÷ 5.326586 s) is orientation only — tasks differ.

Paper: `/library/papers/riemann-fractisi-expedition/` · Blog: `/blog/riemann-fractisi-expedition/`

---

## Honesty (do not skip)

- We did **not** prove the Riemann hypothesis. RH stays **OPEN**.
- Anthropic’s 30 h clock is their **Fermat’s Last Theorem** Lean formalization, not “30 h proving RH.”
- Ours is a smaller **RH-adjacent** proportion ladder (finite Lean Props), not Mathlib-scale FLT.
- Same *kind* of comparison: wall-clock time to a machine-checked Lean proof under multi-agent coordination — not a same-theorem bake-off.

Primary sources:

- Anthropic 30 h baseline: https://www.anthropic.com/claude-fable-and-mythos-5-2  
- Anthropic Riemann (bound improved; RH not solved): https://www.anthropic.com/research/riemann-zeta  

---

## Front matter

| Field | Value |
|---|---|
| Run id | `riemann-fractisi-expedition-2026-11-24` |
| Phase N receipt | `lean/receipts/riemann-fractisi-expedition-phaseN-2026-11-24T23-31-57-372Z.json` |
| Phase 0 receipt (paired) | `lean/receipts/riemann-fractisi-expedition-phase0-2026-11-24T23-31-51-912Z.json` |
| Agents | `lead`, `lemma-worker`, `referee`, `lean-builder` via `tiny.mjs` |
| Lean status | `rhClaimStatus` = OPEN |

---

## Timing

| Metric | Phase 0 | Phase N |
|---|---|---|
| Started (PT) | 2026-11-24 3:31:51 PM PT | 2026-11-24 3:31:57 PM PT |
| `durationSeconds` | 4.992013 | **5.326586** |
| `leanGate.ok` | true | true |
| Kit hook | true | true |
| Baseline | 30 h (108000 s) | 30 h (108000 s) |

---

## What Lean proved (and what it did not)

**Proved (Phase N, no `sorry`):** finite proportion-ladder Props, monotonicity, finite Hardy-style witness on scaffold zeros.

**Not proved:** the Riemann hypothesis; analytic ζ / Mathlib formalization of literature proportion theorems (deferred).

---

## Why this may matter

1. Reduced coordination overhead — shared world once, deltas per agent.  
2. Faster convergence — less redundant reconstruction.  
3. Verification in the loop — Lean-accepted results, not claims.

## Next experiment

Same Lean theorem, same libraries, both architectures. Measure verified progress per unit time and compute — not only seconds.

---

## Paths

- Plan: `riemann-fractisi-expedition-plan.md`  
- Lean: `lean/`  
- Blog: `/blog/riemann-fractisi-expedition/`  
- Paper: `/library/papers/riemann-fractisi-expedition/`  
