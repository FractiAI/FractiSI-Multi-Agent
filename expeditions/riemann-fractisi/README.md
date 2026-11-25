# Riemann FractiSI expedition

## Core finding

**Real ζ target:** Anthropic’s Mathlib `riemannZeta` formalization ([formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23)).

| Metric | Value |
|---|---|
| FractiSI coordinated verify (warm) | **14.66 s** |
| Tasks / contributions / compositions | **4 / 4 / 1** |
| `lake build Solution` | green |
| `#print axioms` (17 headlines) | Lean trio only |
| Cold cache + build (this host) | **≈ 612 s** |
| Anthropic published baseline | ~1.5 days · ~60 subagents · 41.6% → 67.2% |

RH remains **OPEN**. Toy Nat ablation is demoted (kit microbench only).

- **Paper:** [`/library/papers/riemann-fractisi-expedition/`](/library/papers/riemann-fractisi-expedition/)
- **Blog:** [`/blog/riemann-fractisi-expedition/`](/blog/riemann-fractisi-expedition/)
- **ζ-23 tree:** [`zeta23/`](./zeta23/)
- **Harness:** `lean/timing/run-zeta23.mjs`

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean && node timing/run-zeta23.mjs
```
