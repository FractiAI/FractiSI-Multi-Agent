# InventMath — paper lemma ladder + analytic/endgame

Challenge-only Lean invent toward Theorems A–E. **No** Anthropic `Zeta23` import. **No** RH claim.

| Module | Role |
|---|---|
| `InventMath.lean` | Paper ladder (rank–trace → H/F → Challenge bridges) |
| `InventAnalytic.lean` | Chebyshev–Mertens [eq:cheb1] from Mathlib |
| `InventMainEstimate.lean` | `InventClassicalMainInputs` → `MainEstimateHfunN0star` |
| `InventRvM.lean` | Ncount comparisons + strip/packing + local→dyadic reduction |
| `InventRvMGrowth.lean` | reflection + Re≥2 + Jensen scaffolding toward `local_count` |
| `InventWeil.lean` | TestC2 / paperFT / WeilResidueRates → InventErrorLittleO |
| `InventWeilEF.lean` | Weil EF contour scaffold (FE · digamma · poles · Ncount→∞) |
| `InventTraces.lean` | Residual / moment / spectral scaffolding → InventTracesLike |
| `InventPrimeTraces.lean` | Chebyshev prime-side envelopes → InventTracesAt / residualFamily |
| `InventEndgame.lean` | Seam + glue → invent_<edge> seeds |

**Path to Solution 17/17:** discharge `InventClassicalMainInputs` (Weil · RvM · traces) → `MainEstimateHfunN0star` → `invent_<edge>` → Solution `exact invent_<edge>`.
