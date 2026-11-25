/-
FractiSI invent — Challenge-typed endgame seeds (seed↔edge exact partners).
NO import of Anthropic Zeta23. Imports ChallengeDeps + InventMath only.

Anthropic Solution closes via `exact Zeta23.thmA₀`. FractiSI invent closes via
`exact invent_<edge>` once these seeds are proved. Near-instant Solution exact
is then the GPS last hop.
-/
import ChallengeDeps
import InventMath

open Filter Topology

noncomputable section

/-! ## Seam facts against ChallengeDeps counting (Mathlib only) -/

theorem Ncount_nonneg (T₁ T₂ : ℝ) : 0 ≤ (Ncount T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem N0star_nonneg (T₁ T₂ : ℝ) : 0 ≤ (N0star T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem N0simple_nonneg (T₁ T₂ : ℝ) : 0 ≤ (N0simple T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem Ndist_nonneg (T₁ T₂ : ℝ) : 0 ≤ (Ndist T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem NcountL_nonneg {q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (T₁ T₂ : ℝ) :
    0 ≤ (NcountL χ T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem N0starL_nonneg {q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (T₁ T₂ : ℝ) :
    0 ≤ (N0starL χ T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem N0simpleL_nonneg {q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (T₁ T₂ : ℝ) :
    0 ≤ (N0simpleL χ T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

theorem NdistL_nonneg {q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (T₁ T₂ : ℝ) :
    0 ≤ (NdistL χ T₁ T₂ : ℝ) :=
  Nat.cast_nonneg _

/-! ## Glue specialization: InventMath bridges on ChallengeDeps windows

These are the meet-in-middle exact partners once the λ-family / o(N) main
estimates are invented. They are Challenge-shaped under those hypotheses —
not yet the unconditional endgame seeds. -/

/-- Thm A dyadic under H(λ) family estimate. -/
theorem glueA_dyadic_of_Hfun
    (hLam : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
        (Hfun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T) := by
  exact challengeA_dyadic_of_Hfun (fun T => Ncount_nonneg T (2 * T)) hLam

/-- Thm B dyadic under 2F−1 family estimate. -/
theorem glueB_dyadic_of_Ffun
    (hLam : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
        (2 * Ffun lam - 1 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (1 / 2 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T) := by
  exact challengeB_dyadic_of_Ffun (fun T => Ncount_nonneg T (2 * T)) hLam

/-- Thm C dyadic under F(λ) family estimate (3/4 shape; Challenge uses 5/6 via multiplicity). -/
theorem glueC_dyadic_of_Ffun
    (hLam : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
        (Ffun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (3 / 4 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T) := by
  exact challengeC_dyadic_of_Ffun (fun T => Ncount_nonneg T (2 * T)) hLam

/-- ε-form from little-o main estimate at constant H₀ (Montgomery–Taylor shape). -/
theorem glue_eps_of_littleO {H₀ : ℝ} {err : ℝ → ℝ}
    (hmain : ∀ᶠ T in atTop, H₀ * (Ncount T (2 * T) : ℝ) - err T ≤ N0star T (2 * T))
    (herr : err =o[atTop] fun T => (Ncount T (2 * T) : ℝ)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (H₀ - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T) := by
  exact challenge_eps_of_littleO hmain
    (Eventually.of_forall fun T => Ncount_nonneg T (2 * T)) herr

end
