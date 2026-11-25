# Riemann FractiSI expedition

## Core finding (Player 1: invent, not copy)

**Invent clock:** FractiSI discovers/proves Challenge ζ critical-line proportion statements **without** Anthropic’s sealed `Zeta23` formalization.

| Metric | Value |
|---|---|
| FractiSI **invent** (Lean tactic search, no sealed corpus) | **29.96 s** → plateau |
| Theorems closed | **0 / 17** |
| Sorries at end | **17** |
| LLM keys on VM | none |
| Anthropic published baseline | ~1.5 days · ~60 agents · invent + formalize |
| Demoted sealed find-assemble | 11.66 s (not invent) |

RH remains **OPEN**.

- **Paper:** [`/library/papers/riemann-fractisi-expedition/`](/library/papers/riemann-fractisi-expedition/)
- **Invent harness:** `lean/timing/run-zeta23-invent.mjs`
- **Invent receipt:** `lean/receipts/riemann-fractisi-zeta23-invent-latest.json`

## Quick check (invent)

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean && node timing/run-zeta23-invent.mjs --cutoff-seconds 300
```
