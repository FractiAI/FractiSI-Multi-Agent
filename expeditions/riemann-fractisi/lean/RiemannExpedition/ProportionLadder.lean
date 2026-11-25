/-!
# Finite-sample millesimal ladder (scaffold arithmetic)

Anthropic (2026-08-10) reported improving a published lower bound on the
fraction of zeta zeros on the critical line from **41.6% → 67.2%**
(https://www.anthropic.com/research/riemann-zeta). That result is **not** RH.

This module stores those percentages as millesimals and proves elementary
ordering / inequality facts on **author-chosen finite samples**. It does **not**
formalize analytic number theory.

Attribution notes (audit correction):
- ~33.3% (333‰) is Levinson-scale (>1/3) context only.
- ~41.6% (416‰ = 5/12) matches Pratt–Robles–Zaharescu–Zeindler “more than
  five-twelfths”; Conrey (1989) proved **more than 2/5**, not 41.6%.
- 1000‰ on a finite sample is **not** equivalent to RH.
-/

namespace RiemannExpedition.ProportionLadder

/-- Parts per thousand (millesimals). -/
abbrev Millesimal := Nat

/-- Scaffold millesimal constants (literature context in comments only). -/
def levinsonBound : Millesimal := 333      -- Levinson-scale ~1/3 context
def fiveTwelfthsBound : Millesimal := 416 -- Pratt–Robles–Zaharescu–Zeindler >5/12
/-- Deprecated alias kept for older comments; prefer `fiveTwelfthsBound`. -/
abbrev conreyBound : Millesimal := fiveTwelfthsBound
def anthropic2026Bound : Millesimal := 672 -- Anthropic write-up reported millesimal
def fullThousand : Millesimal := 1000     -- 100% of a finite sample — not RH

theorem levinson_lt_fiveTwelfths : levinsonBound < fiveTwelfthsBound := by decide
theorem fiveTwelfths_lt_anthropic2026 : fiveTwelfthsBound < anthropic2026Bound := by decide
theorem anthropic2026_lt_fullThousand : anthropic2026Bound < fullThousand := by decide

/-- Ladder ordering among scaffold constants. -/
theorem ladder_below_fullThousand :
    levinsonBound < fiveTwelfthsBound ∧
    fiveTwelfthsBound < anthropic2026Bound ∧
    anthropic2026Bound < fullThousand :=
  ⟨levinson_lt_fiveTwelfths, fiveTwelfths_lt_anthropic2026, anthropic2026_lt_fullThousand⟩

/-- Compatibility aliases for older theorem names. -/
theorem levinson_lt_conrey : levinsonBound < conreyBound := levinson_lt_fiveTwelfths
theorem conrey_lt_anthropic2026 : conreyBound < anthropic2026Bound := fiveTwelfths_lt_anthropic2026
theorem anthropic2026_lt_full : anthropic2026Bound < fullThousand := anthropic2026_lt_fullThousand

def anthropicImprovement : Millesimal := anthropic2026Bound - fiveTwelfthsBound

theorem anthropicImprovement_eq_256 : anthropicImprovement = 256 := by decide

/-- A finite set of zeros with `onLine` on the critical line and `total` zeros. -/
structure FiniteZeroSample where
  total : Nat
  onLine : Nat
  onLine_le_total : onLine ≤ total

/-- Sample meets a millesimal lower bound (floor form), with non-vacuity:
    `total > 0` and `bound/1000 ≤ onLine/total`
    ⇔ `total > 0 ∧ bound * total ≤ onLine * 1000`. -/
def MeetsLowerBound (s : FiniteZeroSample) (bound : Millesimal) : Prop :=
  s.total > 0 ∧ bound * s.total ≤ s.onLine * 1000

instance (s : FiniteZeroSample) (bound : Millesimal) :
    Decidable (MeetsLowerBound s bound) := by
  unfold MeetsLowerBound
  infer_instance

/-- Toy sample: 672 of 1000 meets the 67.2% millesimal with equality. -/
def toyAnthropicSample : FiniteZeroSample where
  total := 1000
  onLine := 672
  onLine_le_total := by decide

theorem toy_meets_anthropic_bound :
    MeetsLowerBound toyAnthropicSample anthropic2026Bound := by
  unfold MeetsLowerBound toyAnthropicSample anthropic2026Bound
  decide

theorem toy_misses_fullThousand :
    ¬ MeetsLowerBound toyAnthropicSample fullThousand := by
  unfold MeetsLowerBound toyAnthropicSample fullThousand
  decide

/-- Compatibility alias. -/
theorem toy_misses_full_RH : ¬ MeetsLowerBound toyAnthropicSample fullThousand :=
  toy_misses_fullThousand

end RiemannExpedition.ProportionLadder
