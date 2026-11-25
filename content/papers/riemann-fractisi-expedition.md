# FractiSI On Anthropic’s Real ζ Formalization

**Short answer: The science target is Anthropic’s Mathlib `riemannZeta` formalization (zeta-23), not toy Nat arithmetic.** FractiSI agents claim the real Challenge / Zeta23 / Solution partitions and run `lake build Solution` under a hard gate. Anthropic’s published Riemann-zeta expedition (~60 subagents · ~1.5 days · bound 41.6% → 67.2%) is the baseline — we do not re-run a no-kit arm for that comparison. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · **real Mathlib ζ verification under FractiSI** · **not** RH  
**Date:** 24 November 2026 (ζ-23 trial 25 November 2026)  
**Harness:** `expeditions/riemann-fractisi/lean/timing/run-zeta23.mjs`  
**Upstream:** [anthropics/formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) · [Anthropic post](https://www.anthropic.com/research/riemann-zeta) · [arXiv:2608.13637](https://arxiv.org/abs/2608.13637)

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Science target | Vendored Anthropic zeta-23: Mathlib `riemannZeta` Theorems A–E; Montgomery–Taylor window ≈ 0.6725 | Toy Nat millesimal ladder (demoted) |
| FractiSI role | Agents claim real module partitions → compose → `lake build Solution` + scan | LLM rediscovery of the analytic proof in this run |
| Baseline | Anthropic’s published ζ expedition (discovery + formalization) | A sequential no-kit retest of the same rebuild |
| RH | Stays OPEN | A proof of RH |
| Authorship | Upstream Anthropic formal-math / Alpöge–Furman | A FractiAI-authored analytic paper |

## Abstract

Player 1 rejected toy testing. This revision vendors Anthropic’s public Lean 4 / Mathlib formalization of the critical-line zero-proportion theorems and times a FractiSI-coordinated verification of that **real** project. Challenge.lean states the trusted theorems (with deliberate `sorry` on the challenge side). Solution.lean + Zeta23 prove them without incomplete proofs in the proof library. `#print axioms` on headline theorems is expected to report only `propext`, `Classical.choice`, `Quot.sound`.

The earlier matched Nat ablation remains in-tree as a kit-overhead microbench only. It is **not** the ζ science claim.

## 1. Research question

What does FractiSI record when coordinating verification of Anthropic’s real Mathlib ζ formalization, against Anthropic’s published expedition as baseline?

## 2. Protocol

```text
vendor     = anthropics/formal-math/zeta23 (Lean v4.33.0-rc2 + Mathlib pin)
FractiSI   = 4 agents claim ChallengeDeps / Challenge / Zeta23 / Solution
clock      = claim + compose + lake build Solution + hard scan (Challenge sorry excluded)
baseline   = Anthropic research post (~1.5 days, ~60 subagents, 41.6% → 67.2%)
```

Harness: `node timing/run-zeta23.mjs`  
Schema: `fractisi.riemann-expedition.zeta23.v1`

## 3. Measured results

Receipt: `lean/receipts/riemann-fractisi-zeta23-latest.json` · schema `fractisi.riemann-expedition.zeta23.v1`

| Metric | Value |
|---|---|
| FractiSI coordinated verify (warm `.lake`) | **14.66 s** |
| Tasks / contributions / compositions | **4 / 4 / 1** |
| `lake build Solution` | green |
| `#print axioms` (17 headline theorems) | only `propext`, `Classical.choice`, `Quot.sound` |
| First cold `lake exe cache get` + `lake build Solution` on this host | **≈ 612 s** (~10.2 min) |

Anthropic baseline (published): ~60 subagents · ~1.5 days · bound **41.6% → 67.2%**. That is discovery + formalization. Our 14.66 s is **FractiSI-coordinated verification of their published Mathlib artifact** (warm), not a claim to rediscover the analytic argument in fourteen seconds.

## 4. Demoted: toy Nat ablation

The FractiSI vs no-kit Nat ablation (~1.29 s vs ~10.8 s) measured kit overhead on frozen trivia. It is retained under `timing/run-ablation.mjs` for kit engineering only. **Do not lead with it as a ζ comparison.**

## 5. Withdrawn framing

We still withdraw 30 h FLT vs 5.3 s rebuild as a kit speedup. Anthropic’s **ζ** post (~1.5 days) is the relevant published baseline for this target.

## Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/zeta23
lake exe cache get
lake build Solution
cd ../lean
node timing/run-zeta23.mjs
```
