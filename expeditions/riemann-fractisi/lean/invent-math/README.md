# InventMath — paper lemma ladder + endgame

Challenge-only Lean invent of the public-paper linear-algebra / assembly lemmas that feed Theorems A–E, plus analytic / endgame modules.

| Module | Role |
|---|---|
| `InventMath.lean` | Paper ladder (rank–trace → H/F → Challenge bridges) |
| `InventAnalytic.lean` | Analytic bricks (Chebyshev ψ ≪ x landed; Weil remaining) |
| `InventMainEstimate.lean` | Zero-side little-o → `MainEstimateHfunN0star` packaging |
| `InventEndgame.lean` | Seam + glue + `MainEstimate*` types → invent_<edge> seeds |
| `InventRvM.lean` | RvM counting scaffolding (Mathlib-only; classical uniform A₀ log gap named) |

Does **not** import Anthropic’s sealed `Zeta23` corpus. Does **not** claim RH.

**Blocker path to Solution 17/17:** invent unconditional `main_estimate_Hfun_N0star` (and B/C/MT/Dirichlet variants) → `invent_<edge> := glue ∘ estimate` → Solution `exact invent_<edge>`.
