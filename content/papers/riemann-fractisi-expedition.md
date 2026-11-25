# FractiSI LLM Invent Clock (ζ Challenge)

**Short answer: apples-to-apples invent now uses an LLM on the FractiSI arm.** FractiSI agents invent Lean proofs via **Groq** against Challenge-only statements (**no** sealed Anthropic corpus). First measured LLM invent: **46.53 s** · **2 invent rounds** · **17 Groq calls** (**15** returned tactic bodies) · **0 / 17** theorems closed · lake build still red · **2** sorries left where extraction failed. FractiSI **did** coordinate (4 agents). Invent engine = Groq models (`qwen/qwen3.8-27b`, fallbacks), not Lean-tactics-only. This is **not** a win vs Anthropic ~**1.5 days** / ~**60** agents. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Invent harness:** `lean/timing/run-zeta23-invent.mjs --llm`  
**Receipt:** `lean/receipts/riemann-fractisi-zeta23-invent-latest.json`

## Matched context

| Arm | Invent engine | Result |
|---|---|---|
| **FractiSI + Groq LLM** (this run) | FractiSI + Groq | **46.53 s** · 0/17 closed · 15/17 LLM tactic proposals |
| FractiSI Lean-tactics only (prior) | FractiSI + aesop/simp | 30.20 s plateau · 0/17 |
| No-FractiSI Lean-tactics (prior) | no kit + aesop/simp · 180 s | 34.12 s plateau · 0/17 |
| Anthropic published | ~60 LLM agents | ~1.5 days · green formalization |

## Honesty

| Claim | Status |
|---|---|
| Used LLM invent (Groq) under FractiSI | **Yes** |
| Sealed Anthropic Zeta23 corpus | **No** |
| Theorems closed this run | **0 / 17** |
| Beats Anthropic ~1.5 d | **No** |
| RH | **OPEN** |

## Reproduce

```bash
export GROQ_API_KEY=…   # do not commit
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
