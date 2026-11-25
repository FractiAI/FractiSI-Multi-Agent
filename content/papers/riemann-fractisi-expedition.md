# FractiSI Awareness-Injected LLM Invent (ζ Challenge)

**Short answer: Groq invent prompts now carry FractiSI shared World Awareness.** Challenge-only FractiSI+Groq invent with board / peers / contributions / lake feedback in every LLM call: **29.94 s** · **17** awareness injections · **17** Groq calls (**13** ok) · **0 / 17** closed. Prior no-awareness Groq invent: **46.53 s** · **0 / 17**. Awareness did not close theorems in this 2-round run. No sealed Anthropic corpus. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Harness:** `lean/timing/run-zeta23-invent.mjs --llm`  
**Receipt:** `lean/receipts/riemann-fractisi-zeta23-invent-latest.json`

## Matched invent comparison

| Arm | Awareness in Groq prompts | Result |
|---|---|---|
| **FractiSI + Groq + awareness** (this run) | **Yes** (17 injections) | **29.94 s** · 0/17 closed · 13/17 LLM ok |
| FractiSI + Groq (prior #59) | No | **46.53 s** · 0/17 closed · 15/17 LLM ok |
| FractiSI Lean-tactics only | n/a | 30.20 s plateau · 0/17 |
| Anthropic published | LLM invent+formalize | ~1.5 days · ~60 agents · green |

## Honesty

| Claim | Status |
|---|---|
| FractiSI awareness injected into Groq prompts | **Yes** |
| Sealed Anthropic Zeta23 corpus | **No** |
| Theorems closed this run | **0 / 17** |
| Beats prior no-awareness 0/17 | **No** (still 0 closed) |
| Beats Anthropic ~1.5 d | **No** |
| RH | **OPEN** |

## Reproduce

```bash
export GROQ_API_KEY=…   # do not commit
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
