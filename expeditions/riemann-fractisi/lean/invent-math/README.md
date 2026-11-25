# InventMath — paper lemma ladder + analytic/endgame

Challenge-only Lean invent toward Theorems A–E. **No** Anthropic `Zeta23` import. **No** RH claim.

| Module | Role |
|---|---|
| `InventMath.lean` | Paper ladder (rank–trace → H/F → Challenge bridges) |
| `InventAnalytic.lean` | Chebyshev–Mertens [eq:cheb1] from Mathlib |
| `InventMainEstimate.lean` | `InventClassicalMainInputs` → `MainEstimateHfunN0star` |
| `InventRvM.lean` | Ncount comparisons + unit-window scaffolding |
| `InventWeil.lean` | TestC2 EF invent surface |
| `InventTraces.lean` | Residual packaging for InventTracesAt |` | TestC2 EF invent surface |
| `InventEndgame.lean` | Seam + glue → invent_<edge> seeds |

**Path to Solution 17/17:** discharge `InventClassicalMainInputs` (Weil · RvM · traces) → `MainEstimateHfunN0star` → `invent_<edge>` → Solution `exact invent_<edge>`.
