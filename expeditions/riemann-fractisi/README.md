# Riemann FractiSI expedition

## Core finding

**Real ζ find clock:** Challenge-only start → FractiSI discovers/assembles Anthropic’s Mathlib `riemannZeta` formalization ([formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23)).

| Metric | Value |
|---|---|
| FractiSI **find** (Challenge-only → green Solution) | **11.66 s** |
| Proof modules discovered | **319** |
| Tasks / contributions / compositions | **4 / 4 / 1** |
| No-FractiSI find (Challenge-only, no sealed corpus) | **180 s cutoff** · 26 sorries · no Solution |
| `lake build Solution` (FractiSI find) | green |
| `#print axioms` (17 headlines) | Lean trio only |
| Anthropic published baseline | ~1.5 days · ~60 subagents · invent + formalize · 41.6% → 67.2% |
| Earlier verify-only (prebuilt tree, demoted as find) | 14.66 s warm |

RH remains **OPEN**. FractiSI find ≠ independent idea invention (sealed corpus = published proofs). No-kit cutoff shows invention-scale gap. Toy Nat ablation is demoted.

- **Paper:** [`/library/papers/riemann-fractisi-expedition/`](/library/papers/riemann-fractisi-expedition/)
- **Blog:** [`/blog/riemann-fractisi-expedition/`](/blog/riemann-fractisi-expedition/)
- **ζ-23 tree:** [`zeta23/`](./zeta23/)
- **Find harness:** `lean/timing/run-zeta23-find.mjs`
- **No-kit find harness:** `lean/timing/run-zeta23-find-no-kit.mjs`
- **Find receipt:** `lean/receipts/riemann-fractisi-zeta23-find-latest.json`
- **No-kit receipt:** `lean/receipts/riemann-fractisi-zeta23-find-no-kit-latest.json`

## Quick check

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean
node timing/run-zeta23-find.mjs
node timing/run-zeta23-find-no-kit.mjs --cutoff-seconds 180
```
