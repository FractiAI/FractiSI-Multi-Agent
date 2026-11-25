/-
FractiSI invent — Weil EF invent surface (Challenge-only Mathlib).
NO import of Anthropic Zeta23.
-/
import Mathlib.Analysis.Calculus.ContDiff.Basic
import Mathlib.Analysis.Complex.Basic

open Complex ContDiff Set

noncomputable section

/-- Compactly supported C² test functions on ℝ with support in [-L/2, L/2]. -/
def TestC2 (L : ℝ) (f : ℝ → ℂ) : Prop :=
  ContDiff ℝ 2 f ∧ tsupport f ⊆ Icc (-(L / 2)) (L / 2)

theorem contDiff_const_complex (c : ℂ) : ContDiff ℝ 2 fun _ : ℝ => c :=
  contDiff_const

theorem testC2_zero {L : ℝ} (_hL : 0 < L) : TestC2 L fun _ => (0 : ℂ) := by
  refine ⟨contDiff_const_complex 0, ?_⟩
  intro x hx
  have hempty : tsupport (fun _ : ℝ => (0 : ℂ)) = (∅ : Set ℝ) := by
    ext y
    simp [tsupport, Function.support]
  simp [hempty] at hx

end
