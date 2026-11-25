# Riemann FractiSI expedition

## Core finding

FractiSI coordinated four agents to Lean-verified finite RH-adjacent propositions in **~5.3 seconds**.

Anthropic’s published FLT Lean formalization took **~30 hours**. That is a reference scale, not a same-theorem race. RH remains **OPEN**.

| Anthropic reference | FractiSI Phase N |
|---|---|
| **~30 hours** (FLT formalization) | **~5.3 seconds** (finite Props) |

- **Paper:** [`/library/papers/riemann-fractisi-expedition/`](/library/papers/riemann-fractisi-expedition/)
- **Blog:** [`/blog/riemann-fractisi-expedition/`](/blog/riemann-fractisi-expedition/)
- **Results:** [`riemann-fractisi-results-report.md`](./riemann-fractisi-results-report.md)
- **Plan:** [`riemann-fractisi-expedition-plan.md`](./riemann-fractisi-expedition-plan.md)
- **Lean + harness + receipts:** [`lean/`](./lean/)

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean
lake build
node timing/run-expedition.mjs --phase N --tiny ../../../scripts/tiny.mjs
```

Anthropic grounding: [Riemann zeta bound](https://www.anthropic.com/research/riemann-zeta) · [~30h FLT formalization](https://www.anthropic.com/claude-fable-and-mythos-5-2).
