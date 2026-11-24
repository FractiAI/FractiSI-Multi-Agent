# Riemann FractiSI expedition

## Time to proof

| Anthropic | FractiSI (this run) |
|---|---|
| **~30 hours** | **~5.3 seconds** |

Wall-clock time to a machine-checked Lean proof under multi-agent coordination.

RH remains **OPEN** (not proved here). Anthropic’s 30 h baseline is their FLT Lean formalization; ours is a smaller RH-adjacent proportion ladder.

- **Results:** [`riemann-fractisi-results-report.md`](./riemann-fractisi-results-report.md)
- **Plan:** [`riemann-fractisi-expedition-plan.md`](./riemann-fractisi-expedition-plan.md)
- **Lean + harness + receipts:** [`lean/`](./lean/)
- **Blog:** [`/blog/riemann-fractisi-expedition/`](/blog/riemann-fractisi-expedition/)

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean
lake build
node timing/run-expedition.mjs --phase N --tiny ../../../scripts/tiny.mjs
```

Anthropic grounding: [Riemann zeta bound](https://www.anthropic.com/research/riemann-zeta) · [~30h FLT formalization](https://www.anthropic.com/claude-fable-and-mythos-5-2).
