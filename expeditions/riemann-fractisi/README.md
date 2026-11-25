# Riemann FractiSI expedition

## Core finding

**Matched ablation (real trial):** same frozen Lean payload bytes, two arms, work inside the clock, hard Lean gate.

| Arm | Mean wall clock (5 runs) | Tasks | Contributions | Compositions | Hard gate |
|---|---|---|---|---|---|
| no-kit sequential write | **~1.29 s** | 0 | 0 | 0 | pass ×5 |
| FractiSI compose + git | **~10.8 s** | 4 | 4 | 1 | pass ×5 |

FractiSI’s coordination path is slower than a sequential write on this frozen-payload rebuild. The trial measures kit overhead and coordination evidence — not LLM proof search, and not a 30 h FLT comparison. RH remains **OPEN**.

- **Paper:** [`/library/papers/riemann-fractisi-expedition/`](/library/papers/riemann-fractisi-expedition/)
- **Blog:** [`/blog/riemann-fractisi-expedition/`](/blog/riemann-fractisi-expedition/)
- **Results:** [`riemann-fractisi-results-report.md`](./riemann-fractisi-results-report.md)
- **Plan:** [`riemann-fractisi-expedition-plan.md`](./riemann-fractisi-expedition-plan.md)
- **Lean + ablation harness + receipts:** [`lean/`](./lean/)

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean
lake build
node timing/run-ablation.mjs
```

Legacy rebuild-only harness (not the matched trial): `node timing/run-expedition.mjs --phase N --tiny ../../../scripts/tiny.mjs`

Anthropic grounding (context only): [Riemann zeta bound](https://www.anthropic.com/research/riemann-zeta) · [~30h FLT formalization](https://www.anthropic.com/claude-fable-and-mythos-5-2).
