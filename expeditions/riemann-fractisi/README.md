# Riemann FractiSI expedition

FractiSI multi-agent Riemann-*adjacent* Lean formalization campaign.

- **Honesty:** Riemann hypothesis remains **OPEN** — not proved here.
- **Plan:** [`riemann-fractisi-expedition-plan.md`](./riemann-fractisi-expedition-plan.md)
- **Results:** [`riemann-fractisi-results-report.md`](./riemann-fractisi-results-report.md)
- **Lean + harness + receipts:** [`lean/`](./lean/)

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean
lake build
node timing/run-expedition.mjs --phase N --tiny ../../../scripts/tiny.mjs
```

Anthropic grounding: [Riemann zeta bound](https://www.anthropic.com/research/riemann-zeta) · [~30h FLT formalization](https://www.anthropic.com/claude-fable-and-mythos-5-2).
