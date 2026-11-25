# invent-math

Paper-guided FractiSI invent of Alpöge–Furman ladder lemmas (arXiv:2608.13637 outline).

- `InventMath.lean` — paper ladder (Mathlib only; **no** `Zeta23` import)
- `InventAnalytic.lean` — Chebyshev–Mertens [eq:cheb1] bricks (ψ≪x, cheb1b/c/d)
- `InventMainEstimate.lean` — classical Prop packaging → `MainEstimateHfunN0star`
- `InventRvM.lean` — Ncount comparisons, strip/packing majorants, local→dyadic reduction
- `InventWeil.lean` — TestC2 / paperFT / Hfn / WeilResidueRates → InventErrorLittleO
- `InventTraces.lean` — residual / moment / spectral scaffolding toward InventTracesLike
- `InventEndgame.lean` — ChallengeDeps seam + glue → invent_<edge>
- Measured by `../timing/run-zeta23-invent-math.mjs` (InventMath) and invent arm lake-build
- Challenge headlines: invent unconditional `main_estimate_*` then Solution `exact invent_<edge>`; RH stays OPEN
