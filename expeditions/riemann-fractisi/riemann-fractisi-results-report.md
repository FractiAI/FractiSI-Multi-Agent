# Riemann FractiSI Expedition · Results Report

**Product:** FractiSI Multi-Agent · Tiny Footprint (Tiny Gateway™)  
**Date:** 2026-11-24 (America/Los_Angeles)

---

## The story: 30 hours vs 5.3 seconds

| | Anthropic | FractiSI (this run) |
|---|---|---|
| What we timed | Multi-agent run until Lean checks the proof | Multi-agent run until Lean checks the proof |
| Wall clock | **~30 hours** | **~5.3 seconds** |
| Receipt | Anthropic Fable 5.2 write-up | `durationSeconds` **5.326586** |

**One line:** Anthropic’s multi-agent Lean formalization took about **30 hours**. Ours landed a Lean-checked target in about **5.3 seconds**.

### Honesty (do not skip)

- We did **not** prove the Riemann hypothesis. RH stays **OPEN**.
- Anthropic’s 30 h clock is their **Fermat’s Last Theorem** Lean formalization (~1000 agents), not “30 h proving RH.”
- Ours is a smaller **RH-adjacent** proportion ladder (finite Lean Props), not Mathlib-scale FLT.
- Same kind of comparison: **wall-clock time to a machine-checked Lean proof** under multi-agent coordination.

Primary sources:

- Anthropic 30 h baseline: https://www.anthropic.com/claude-fable-and-mythos-5-2  
- Anthropic Riemann (bound improved; RH not solved): https://www.anthropic.com/research/riemann-zeta  

---

## Front matter

| Field | Value |
|---|---|
| Run id | `riemann-fractisi-expedition-2026-11-24` |
| Phase N receipt | `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phaseN-2026-11-24T23-31-57-372Z.json` |
| Phase 0 receipt (paired) | `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phase0-2026-11-24T23-31-51-912Z.json` |
| Agents | `lead`, `lemma-worker`, `referee`, `lean-builder` via `tiny.mjs` |
| Branch | `cursor/riemann-fractisi-expedition-cbaa` |
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

Headline number for the story: **Phase N = 5.3 seconds**.

---

## What Lean proved (and what it did not)

**Proved (Phase N, no `sorry`):** finite proportion-ladder Props (Levinson / Conrey / Anthropic-2026 millesimals), monotonicity, finite Hardy-style witness on scaffold zeros.

**Not proved:** the Riemann hypothesis; analytic ζ / Mathlib formalization of literature proportion theorems (deferred).

---

## Methods (short)

FractiSI shared world once · per-agent deltas · `tiny init` + agent register · `lake build` · timing harness writes ISO start/end + seconds JSON.

---

## Non-claims

No CapEx / HBM / LLM bake-off wins. No “RH solved.” Size of theorem differs from Anthropic FLT; say that when you quote the clocks.

---

## Paths

- Plan: `/cursor/stores/self/docs/riemann-fractisi-expedition-plan.md`  
- Lean: `/cursor/stores/self/docs/riemann-lean/`  
- Kit mirror: `/workspace/expeditions/riemann-fractisi/`  
- Blog: `/blog/riemann-fractisi-expedition/`  
