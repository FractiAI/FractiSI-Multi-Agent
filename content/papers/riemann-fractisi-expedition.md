# FractiSI On Anthropic’s Real ζ Formalization

**Short answer: We tested FractiSI against Anthropic’s real Mathlib zeta formalization — not toy arithmetic.** Anthropic’s agents spent about a day and a half discovering and proving a stronger bound on how many zeta zeros sit on the critical line (about 41.6% → 67.2%). We took their published Lean/Mathlib proof, ran it under FractiSI coordination, and checked that it still builds clean. Warm FractiSI verify: **14.66 seconds**. Cold first build on this machine: **about 10 minutes**. The Riemann hypothesis remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · **real Mathlib ζ verification under FractiSI** · **not** RH  
**Date:** 24 November 2026 (ζ-23 trial 25 November 2026)  
**Harness:** `expeditions/riemann-fractisi/lean/timing/run-zeta23.mjs`  
**Upstream:** [anthropics/formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) · [Anthropic post](https://www.anthropic.com/research/riemann-zeta) · [arXiv:2608.13637](https://arxiv.org/abs/2608.13637)

## Plain language: what we tested, how long, vs Anthropic

### What we actually tested

We did **not** invent a new theorem about the Riemann zeta function in this run.

We took Anthropic’s public Lean 4 + Mathlib project that formalizes their published result: **more than two thirds of the nontrivial zeros of ζ lie on the critical line** (headline Montgomery–Taylor window ≈ **67.2%**). The statements use Mathlib’s real `riemannZeta`, not toy percentages.

FractiSI’s job in this trial:

1. Four agents claim the real library pieces (definitions, challenge statements, proof library, solution bridge).
2. Compose those claims in the shared world.
3. Run `lake build Solution` so Lean checks the real proofs.
4. Run `#print axioms` on the 17 headline theorems — they depend only on Lean’s three standard axioms.

### How long it took (this machine)

| Step | Wall clock |
|---|---|
| First cold Mathlib download + full `lake build Solution` | **≈ 612 seconds** (~10.2 minutes) |
| FractiSI coordinated verify with a warm build cache | **14.66 seconds** |
| FractiSI bookkeeping in that warm run | **4 tasks · 4 contributions · 1 composition** |

### Comparison: our run vs Anthropic

| | Anthropic (published) | FractiSI (this run) |
|---|---|---|
| **Job** | Discover + write the math argument, then formalize it in Lean/Mathlib | Coordinate and **re-check** that published formalization |
| **Math target** | Real ζ critical-line proportion bound (~67.2%) | **Same** published formalization |
| **Agents** | ~60 subagents | 4 FractiSI agents (claim / compose / build) |
| **Published clock** | ~**1.5 days** | Warm verify **14.66 s**; cold first build ~**10 min** |
| **Who wrote the proofs** | Anthropic / Alpöge–Furman (upstream) | Upstream — we did not re-author the analytic proof |
| **RH solved?** | No | No |

**How to read the clocks:** Anthropic’s ~1.5 days paid for **finding** the result. Our 14.66 seconds paid for **checking** their finished Lean project under FractiSI. Those are related but different jobs. We do **not** claim FractiSI rediscovered the analytic argument 10,000× faster. We claim: on the **same real ζ formalization**, FractiSI can coordinate a clean machine check in seconds once the Mathlib cache is warm, and about ten minutes from a cold start on this host.

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Science target | Vendored Anthropic zeta-23: Mathlib `riemannZeta` Theorems A–E; ≈ 0.6725 | Toy Nat millesimal ladder (demoted) |
| FractiSI role | Agents claim real partitions → compose → `lake build Solution` + axiom audit | LLM rediscovery of the analytic proof in this run |
| Baseline | Anthropic’s published ζ expedition (discovery + formalization) | A sequential no-kit retest of the same rebuild |
| RH | Stays OPEN | A proof of RH |
| Authorship | Upstream Anthropic formal-math / Alpöge–Furman | A FractiAI-authored analytic paper |

## Abstract

This expedition vendors Anthropic’s public Lean 4 / Mathlib formalization of the critical-line zero-proportion theorems and times a FractiSI-coordinated verification of that real project. Warm verify took 14.66 seconds with tasks 4 / contributions 4 / compositions 1; a cold Mathlib cache plus build took about 612 seconds. Anthropic’s published ~1.5 day · ~60-agent expedition remains the discovery baseline. RH stays OPEN. Toy Nat ablation is demoted and is not the ζ science claim.

## 1. Research question

What does FractiSI record when coordinating verification of Anthropic’s real Mathlib ζ formalization, against Anthropic’s published expedition as baseline?

## 2. Protocol

```text
vendor     = anthropics/formal-math/zeta23 (Lean v4.33.0-rc2 + Mathlib pin)
FractiSI   = 4 agents claim ChallengeDeps / Challenge / Zeta23 / Solution
clock      = claim + compose + lake build Solution + axiom audit
baseline   = Anthropic research post (~1.5 days, ~60 subagents, 41.6% → 67.2%)
```

Harness: `node timing/run-zeta23.mjs`  
Schema: `fractisi.riemann-expedition.zeta23.v1`  
Receipt: `lean/receipts/riemann-fractisi-zeta23-latest.json`

## 3. Measured results

| Metric | Value |
|---|---|
| FractiSI coordinated verify (warm `.lake`) | **14.66 s** |
| Tasks / contributions / compositions | **4 / 4 / 1** |
| `lake build Solution` | green |
| `#print axioms` (17 headline theorems) | only `propext`, `Classical.choice`, `Quot.sound` |
| First cold `lake exe cache get` + `lake build Solution` | **≈ 612 s** (~10.2 min) |

## 4. Demoted: toy Nat ablation

The earlier FractiSI vs no-kit Nat ablation (~1.29 s vs ~10.8 s) measured kit overhead on frozen trivia. It is retained under `timing/run-ablation.mjs` for kit engineering only. **Do not lead with it as a ζ comparison.**

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
