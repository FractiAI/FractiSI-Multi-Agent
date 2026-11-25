# FractiSI Invent Clock On Anthropic’s Real ζ Challenge

**Short answer: Player 1 requires invent, not copy.** FractiSI must discover/prove the ζ critical-line proportion statements **on its own** — not assemble Anthropic’s sealed formalization. On this VM there are **no** Anthropic/OpenAI/HF API keys and **no** local LLM, so the strongest invent engine that still runs is FractiSI-coordinated **Lean/Mathlib tactic search** against a Challenge-only sandbox (no `Zeta23/` proof tree). First measured invent clock: **29.96 s** to an honest **plateau** — **0 of 17** Challenge theorems closed; aesop / simp_all / tactic barrage all failed; **17 sorries** remain. Anthropic’s published ~**1.5 days** · ~**60** agents **invents the analytic argument and formalizes it**. Sealed find-assemble (**11.66 s**) is demoted as invent. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · **ζ-23 invent clock** · **not** RH · **not** sealed-corpus find-assemble  
**Date:** 24 November 2026 (invent run 25 November 2026)  
**Invent harness:** `expeditions/riemann-fractisi/lean/timing/run-zeta23-invent.mjs`  
**Invent receipt:** `lean/receipts/riemann-fractisi-zeta23-invent-latest.json`  
**Upstream challenge surface:** [anthropics/formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) Challenge/ChallengeDeps only · [Anthropic post](https://www.anthropic.com/research/riemann-zeta) · [arXiv:2608.13637](https://arxiv.org/abs/2608.13637)

## What we invent against

Trusted Challenge statements about Mathlib `riemannZeta` (Theorems A–E, including Montgomery–Taylor ≈ 67.2%). At invent t=0: **no** Anthropic `Zeta23` library, **no** Anthropic `Solution`. FractiSI agents claim theorem partitions and invent a `Solution.lean` that must **not** `import Zeta23`.

## First measured invent receipt

| Metric | Value |
|---|---|
| Invent wall clock | **29.96 s** (plateau; cutoff budget 300 s) |
| Theorems closed | **0 / 17** |
| Sorries at end | **17** |
| FractiSI agents / tasks / contributions | **4 / 12 / 4** |
| Strategies tried | `aesop`, `simp_all`, `first \| aesop \| simp_all \| decide \| omega \| linarith \| ring_nf \| trivial` |
| Sealed Anthropic corpus used | **No** |
| LLM used | **No** (keys unset) |
| `import Zeta23` in invent Solution | **No** |

## Invented vs reused

| | Status |
|---|---|
| Analytic argument (Alpöge–Furman / Claude expedition) | **Not invented here** — needs LLM formalizer or human math; absent on this VM |
| Lean proof bodies for Challenge theorems | **Attempted** via tactic invent; **none closed** |
| Mathlib `riemannZeta` + lemmas | **Reused** (library, not Anthropic’s zeta23 proofs) |
| ChallengeDeps / Challenge statements | **Reused** trusted surface (Apache-2.0 challenge files) |

## Comparison to Anthropic

| | Anthropic | FractiSI invent (this VM) |
|---|---|---|
| Target | ζ critical-line bound ≈ 67.2% | Same Challenge theorems |
| Invent engine | ~60 LLM agents | FractiSI + Lean tactic search |
| Sealed prior formalization? | They wrote it | **Forbidden** |
| Wall clock | ~1.5 days | **29.96 s** to plateau (0 closed) |
| Green Solution? | Yes | **No** |
| RH | OPEN | OPEN |

**How to read this:** a fast plateau with 0 closures is **not** a win over 1.5 days. It shows local tactic invent cannot invent the analytic formalization. Closing the invent clock requires model API keys (or equivalent) for real invent+formalize.

## Demoted measurements (not invent)

| Clock | Time | Why demoted as invent |
|---|---|---|
| Sealed find-assemble | 11.66 s | Copies published proof modules |
| No-kit Challenge-only idle | 180 s cutoff | No invent engine |
| Warm verify of prebuilt tree | 14.66 s | Not discovery |

## Protocol

```text
t=0     = Challenge + ChallengeDeps + Mathlib only (no Zeta23 proofs)
FractiSI = 4 agents invent Solution tactic attempts → contribute → compose
forbid  = import Zeta23; sealed Anthropic proof corpus
stop    = green Solution OR plateau/cutoff with receipt
```

Schema: `fractisi.riemann-expedition.zeta23-invent.v1`

## Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
node timing/run-zeta23-invent.mjs --cutoff-seconds 300
```

To unlock LLM invent on this class of VM: bind `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as Cursor secrets and extend the invent harness to call models — do not fall back to sealed find-assemble.
