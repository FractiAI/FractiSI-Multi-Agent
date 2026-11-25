/-
FractiSI invent — analytic stack bricks (Challenge-only Mathlib).
NO import of Anthropic Zeta23.

Bricks:
  · Chebyshev–Mertens paper [eq:cheb1] upper bound from Mathlib ψ ≪ x
  · Zero-side §6 arithmetic (N0star_lower_explicit / N0star_lower_H) from paper outline
Remaining invent: Weil EF · RvM · Stirling Γ′/Γ · MV · traces → feed these into MainEstimate*.
-/
import InventMath
import Mathlib.NumberTheory.Chebyshev
import Mathlib.NumberTheory.ArithmeticFunction.VonMangoldt

open Finset Real
open ArithmeticFunction hiding log id
open Chebyshev

noncomputable section

/-! ## Chebyshev–Mertens (paper [eq:cheb1] / [lem:cheb]) from Mathlib -/

/-- Paper [eq:cheb1] first line: Σ_{n≤x} Λ(n) ≪ x, via Mathlib `psi_le_const_mul_self`. -/
theorem cheb1a_psi_bound :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x → ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ≤ C * x := by
  refine ⟨Real.log 4 + 4, fun x hx => ?_⟩
  have hx0 : (0 : ℝ) ≤ x := by linarith
  -- ψ x = ∑ Λ over Ioc 0 ⌊x⌋₊ by definition
  simpa [psi] using psi_le_const_mul_self hx0

/-- Same bound written with Mathlib ψ notation. -/
theorem cheb1a_psi_le :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x → ψ x ≤ C * x := by
  obtain ⟨C, hC⟩ := cheb1a_psi_bound
  exact ⟨C, fun x hx => by simpa [psi] using hC x hx⟩

/-- Explicit constant form (log 4 + 4) for the ψ ≪ x bound. -/
theorem cheb1a_explicit {x : ℝ} (hx : 0 ≤ x) :
    ψ x ≤ (Real.log 4 + 4) * x :=
  psi_le_const_mul_self hx

/-- Paper-shaped lower Chebyshev growth: ψ x ≥ (x−1) log 2 − log(x+2). -/
theorem cheb_psi_ge_lower {x : ℝ} (hx : 0 ≤ x) :
    (x - 1) * Real.log 2 - Real.log (x + 2) ≤ ψ x :=
  psi_ge' hx

/-! ## Zero-side §6 arithmetic (paper outline → InventMath Hfun)

These rearrange rank–trace / perturbation inequalities into the H(λ)·N − error form
that `eps_form_of_isLittleO` consumes. Analytic inputs (traces, NII, B) remain to invent. -/

/-- Explicit zero-side lower bound on N₀* from rank–trace core + perturbation. -/
theorem N0star_lower_explicit
    {N0star s12 : ℕ} {N NII trGh frGh trAh frAh B : ℝ}
    (hcount : (s12 : ℝ) ≤ N0star + NII)
    (hcore : 4 * trAh - 2 * (N + NII) - frAh ≤ s12)
    (hpert : 4 * trGh - frGh - B * (4 + 2 * Real.sqrt frGh + B) ≤ 4 * trAh - frAh) :
    4 * trGh - frGh - 2 * N - 3 * NII - B * (4 + 2 * Real.sqrt frGh + B) ≤ N0star := by
  linarith

/-- §6 H(λ₁)·N − error packaging: feeds little-o → ε-form → MainEstimateHfunN0star. -/
theorem N0star_lower_H
    {N0star N NII trGh frGh B lam₁ R₁ R₂ : ℝ} (hB : 0 ≤ B)
    (h0 : 4 * trGh - frGh - 2 * N - 3 * NII - B * (4 + 2 * Real.sqrt frGh + B) ≤ N0star)
    (htr : |trGh - N| ≤ R₁) (hfr : frGh ≤ (1 / lam₁ + lam₁ / 3) * N + R₂) :
    Hfun lam₁ * N -
        (4 * R₁ + R₂ + 3 * NII +
          B * (4 + 2 * Real.sqrt ((1 / lam₁ + lam₁ / 3) * N + R₂) + B)) ≤
      N0star := by
  have h1 : N - R₁ ≤ trGh := by
    have := (abs_le.mp htr).1
    linarith
  have h2 : Real.sqrt frGh ≤ Real.sqrt ((1 / lam₁ + lam₁ / 3) * N + R₂) :=
    Real.sqrt_le_sqrt hfr
  have h3 : Hfun lam₁ * N = 4 * N - (1 / lam₁ + lam₁ / 3) * N - 2 * N := by
    simp only [Hfun]
    ring
  nlinarith [h0, h1, h2, h3, hB, mul_le_mul_of_nonneg_left h2 hB]

end
