/-!
# Critical-line model (abstract, Nat-only)

We model the real part of a nontrivial zero as a pair of naturals `(num, den)`
representing `num/den`, avoiding Mathlib so the scaffold stays minutes-scale.

This is a **scaffolding** model for harness tests, not a substitute for complex
analysis of `ζ`, and not the Riemann hypothesis.
-/

namespace RiemannExpedition.CriticalLine

/-- Real part modeled as a rational `num/den` (caller ensures den > 0). -/
structure RealPart where
  num : Nat
  den : Nat
  deriving BEq, DecidableEq, Repr

/-- The critical line Re(s) = 1/2 ⇔ 2*num = den (and den > 0). -/
def OnCriticalLine (σ : RealPart) : Prop := σ.den > 0 ∧ 2 * σ.num = σ.den

/-- Boolean checker used by the scaffold (computable). -/
def onCriticalLineB (σ : RealPart) : Bool :=
  decide (σ.den > 0) && decide (2 * σ.num = σ.den)

/-- Half = 1/2. -/
def half : RealPart := ⟨1, 2⟩

theorem half_on_critical_line : OnCriticalLine half := ⟨Nat.succ_pos 1, rfl⟩

theorem half_onCriticalLineB : onCriticalLineB half = true := rfl

/-- Off-line point 3/4 for negative tests. -/
def offLine : RealPart := ⟨3, 4⟩

theorem offLine_onCriticalLineB : onCriticalLineB offLine = false := rfl

theorem offLine_not_on_critical_line : ¬ OnCriticalLine offLine := by
  rintro ⟨_, h⟩
  exact (by decide : ¬ 2 * (3 : Nat) = 4) h

/-- Computable critical-line check for a finite sample of modeled points.
    Proving the analogous statement for true ζ zeros is exactly RH — we do not. -/
def checkAllOnCriticalLine (zeros : List RealPart) : Bool :=
  zeros.all onCriticalLineB

/-- Prop wrapper: every entry in a finite sample passes the critical-line check.
    Renamed away from `RiemannHypothesis` — this is not RH. -/
def FiniteSampleOnCriticalLine (zeros : List RealPart) : Prop :=
  checkAllOnCriticalLine zeros = true

/-- Example zeros used only for scaffold tests (not claimed zeta zeros). -/
def scaffoldZeros : List RealPart := [half, half, half]

theorem scaffoldZeros_checkAllOnCriticalLine : checkAllOnCriticalLine scaffoldZeros = true := rfl

theorem scaffoldZeros_all_on_critical_line : FiniteSampleOnCriticalLine scaffoldZeros :=
  scaffoldZeros_checkAllOnCriticalLine

end RiemannExpedition.CriticalLine
