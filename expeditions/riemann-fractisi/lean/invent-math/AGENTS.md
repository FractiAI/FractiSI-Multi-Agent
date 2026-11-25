# invent-math

Paper-guided FractiSI invent of Alpöge–Furman ladder lemmas (arXiv:2608.13637 outline).

- `InventMath.lean` — paper ladder (Mathlib only; **no** `Zeta23` import)
- `InventAnalytic.lean` — analytic bricks (Chebyshev ψ ≪ x first; Weil remaining)
- `InventMainEstimate.lean` — zero-side little-o → main-estimate packaging
- `InventEndgame.lean` — ChallengeDeps seam + glue + main-estimate types → invent_<edge>
- `InventRvM.lean` — RvM counting scaffolding (compact/discrete/ncard; classical uniform A₀ log gap named)
- Measured by `../timing/run-zeta23-invent-math.mjs` (InventMath) and invent arm lake-build (Analytic/Endgame/RvM)
- Challenge headlines: invent unconditional `main_estimate_*` then Solution `exact invent_<edge>`; RH stays OPEN
