/-
FractiSI invent — Challenge-typed endgame layer (seed↔edge exact partners).
NO import of Anthropic Zeta23. Imports ChallengeDeps + InventMath + InventAnalytic + Mathlib only.

Nested tunnel to 17/17:
  seam (this file) → InventAnalytic bricks → main estimates → glue ∘ estimate = invent_<edge>
  → Solution exact invent_<edge>
-/
import ChallengeDeps
import InventMath
import InventAnalytic
import InventMainEstimate
import Mathlib.NumberTheory.LSeries.ZetaZeros

open Filter Topology Set
open scoped BigOperators

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

/-- Nontrivial zeros in an ordinate window sit in a compact strip rectangle. -/
theorem zerosIn_subset_compact (T₁ T₂ : ℝ) :
    zerosIn T₁ T₂ ⊆ ((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) ∩ riemannZetaZeros := by
  intro ρ hρ
  refine ⟨⟨⟨hρ.1.2.1.le, hρ.1.2.2.le⟩, ⟨hρ.2.1.le, hρ.2.2⟩⟩, ?_⟩
  simpa [riemannZetaZeros] using hρ.1.1

/-- Local finiteness of ChallengeDeps zerosIn — Mathlib discrete zeros ∩ compact strip. -/
theorem zerosIn_finite (T₁ T₂ : ℝ) : (zerosIn T₁ T₂).Finite := by
  have hK : IsCompact ((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) :=
    isCompact_Icc.reProdIm isCompact_Icc
  exact (hK.inter_riemannZetaZeros_finite).subset (zerosIn_subset_compact T₁ T₂)

/-- Window split for ChallengeDeps zerosIn. -/
theorem zerosIn_union {a b c : ℝ} (h1 : a ≤ b) (h2 : b ≤ c) :
    zerosIn a c = zerosIn a b ∪ zerosIn b c := by
  ext ρ
  simp only [zerosIn, mem_setOf_eq, mem_union]
  constructor
  · rintro ⟨hρ, ha, hb⟩
    rcases le_or_gt ρ.im b with hle | hgt
    · exact Or.inl ⟨hρ, ha, hle⟩
    · exact Or.inr ⟨hρ, hgt, hb⟩
  · rintro (⟨hρ, ha, hb⟩ | ⟨hρ, ha, hb⟩)
    · exact ⟨hρ, ha, le_trans hb h2⟩
    · exact ⟨hρ, lt_of_le_of_lt h1 ha, hb⟩

/-- Window additivity: N(a,c] = N(a,b] + N(b,c]. -/
theorem Ncount_add {a b c : ℝ} (h1 : a ≤ b) (h2 : b ≤ c) :
    Ncount a c = Ncount a b + Ncount b c := by
  unfold Ncount
  rw [zerosIn_union h1 h2]
  refine finsum_mem_union ?_ (zerosIn_finite a b) (zerosIn_finite b c)
  rw [disjoint_left]
  rintro ρ ⟨_, _, hb⟩ ⟨_, ha, _⟩
  exact absurd hb (not_le.2 ha)

/-- On-line distinct count additivity on split windows. -/
theorem N0star_add {a b c : ℝ} (h1 : a ≤ b) (h2 : b ≤ c) :
    N0star a c = N0star a b + N0star b c := by
  unfold N0star
  have hU :
      zerosIn a c ∩ {ρ | ρ.re = 1 / 2} =
        (zerosIn a b ∩ {ρ | ρ.re = 1 / 2}) ∪ (zerosIn b c ∩ {ρ | ρ.re = 1 / 2}) := by
    ext ρ
    simp only [zerosIn_union h1 h2, mem_inter_iff, mem_union, mem_setOf_eq]
    tauto
  have hfin1 : (zerosIn a b ∩ {ρ : ℂ | ρ.re = 1 / 2}).Finite :=
    (zerosIn_finite a b).inter_of_left _
  have hfin2 : (zerosIn b c ∩ {ρ : ℂ | ρ.re = 1 / 2}).Finite :=
    (zerosIn_finite b c).inter_of_left _
  have hdisj :
      Disjoint (zerosIn a b ∩ {ρ : ℂ | ρ.re = 1 / 2})
        (zerosIn b c ∩ {ρ : ℂ | ρ.re = 1 / 2}) := by
    rw [disjoint_left]
    rintro ρ ⟨⟨_, _, hb⟩, _⟩ ⟨⟨_, ha, _⟩, _⟩
    exact absurd hb (not_le.2 ha)
  rw [hU]
  exact ncard_union_eq hdisj hfin1 hfin2

/-! ## Glue specialization: InventMath bridges on ChallengeDeps windows -/

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

/-- Thm C dyadic under F(λ) family estimate (3/4 shape). -/
theorem glueC_dyadic_of_Ffun
    (hLam : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
        (Ffun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (3 / 4 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T) := by
  exact challengeC_dyadic_of_Ffun (fun T => Ncount_nonneg T (2 * T)) hLam

/-- ε-form from little-o main estimate at constant H₀. -/
theorem glue_eps_of_littleO {H₀ : ℝ} {err : ℝ → ℝ}
    (hmain : ∀ᶠ T in atTop, H₀ * (Ncount T (2 * T) : ℝ) - err T ≤ N0star T (2 * T))
    (herr : err =o[atTop] fun T => (Ncount T (2 * T) : ℝ)) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (H₀ - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T) := by
  exact challenge_eps_of_littleO hmain
    (Eventually.of_forall fun T => Ncount_nonneg T (2 * T)) herr

/-- Simple on-line count additivity on split windows. -/
theorem N0simple_add {a b c : ℝ} (h1 : a ≤ b) (h2 : b ≤ c) :
    N0simple a c = N0simple a b + N0simple b c := by
  unfold N0simple
  have hU :
      zerosIn a c ∩ {ρ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1} =
        (zerosIn a b ∩ {ρ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1}) ∪
          (zerosIn b c ∩ {ρ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1}) := by
    ext ρ
    simp only [zerosIn_union h1 h2, mem_inter_iff, mem_union, mem_setOf_eq]
    tauto
  have hfin1 :
      (zerosIn a b ∩ {ρ : ℂ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1}).Finite :=
    ((zerosIn_finite a b).inter_of_left _).inter_of_left _
  have hfin2 :
      (zerosIn b c ∩ {ρ : ℂ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1}).Finite :=
    ((zerosIn_finite b c).inter_of_left _).inter_of_left _
  have hdisj :
      Disjoint (zerosIn a b ∩ {ρ : ℂ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1})
        (zerosIn b c ∩ {ρ : ℂ | ρ.re = 1 / 2} ∩ {ρ | zeroMult ρ = 1}) := by
    rw [disjoint_left]
    rintro ρ ⟨⟨⟨_, _, hb⟩, _⟩, _⟩ ⟨⟨⟨_, ha, _⟩, _⟩, _⟩
    exact absurd hb (not_le.2 ha)
  rw [hU]
  exact ncard_union_eq hdisj hfin1 hfin2

/-- Distinct-count additivity on split windows. -/
theorem Ndist_add {a b c : ℝ} (h1 : a ≤ b) (h2 : b ≤ c) :
    Ndist a c = Ndist a b + Ndist b c := by
  unfold Ndist
  rw [zerosIn_union h1 h2]
  refine ncard_union_eq ?_ (zerosIn_finite a b) (zerosIn_finite b c)
  rw [disjoint_left]
  rintro ρ ⟨_, _, hb⟩ ⟨_, ha, _⟩
  exact absurd hb (not_le.2 ha)

/-! ## Main-estimate types (invent targets) + glue composition

These are the analytic inputs the Challenge bridges need. Invent them from
Weil EF · RvM · traces (remaining stack). Once a main estimate is closed,
`invent_<edge>` is `exact glue… main_estimate…` and Solution is `exact invent_<edge>`. -/

/-- Re-export: classical Prop inputs ⇒ Challenge A main estimate. -/
theorem invent_MainEstimateHfunN0star_of_classical
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 → InventClassicalMainInputs lam) :
    MainEstimateHfunN0star :=
  MainEstimateHfunN0star_of_classical h

/-- λ-family 2F−1 estimate — invent target feeding Theorem B shape. -/
def MainEstimateFfunN0simple : Prop :=
  ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
      (2 * Ffun lam - 1 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)

/-- λ-family F-estimate — invent target feeding Theorem C shape (3/4). -/
def MainEstimateFfunNdist : Prop :=
  ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
      (Ffun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)

/-- Composition: main H-estimate ⇒ Challenge A dyadic 2/3. -/
theorem invent_two_thirds_on_critical_line_of_main (h : MainEstimateHfunN0star) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T) :=
  glueA_dyadic_of_Hfun h

/-- Composition: main 2F−1 estimate ⇒ Challenge B dyadic 1/2 shape (feeds 2/3 after multiplicity). -/
theorem invent_half_simple_of_main (h : MainEstimateFfunN0simple) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (1 / 2 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T) :=
  glueB_dyadic_of_Ffun h

/-- Composition: main F-estimate ⇒ Challenge C dyadic 3/4 shape. -/
theorem invent_three_quarters_distinct_of_main (h : MainEstimateFfunNdist) :
    ∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀,
      (3 / 4 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T) :=
  glueC_dyadic_of_Ffun h

/-- Re-export Chebyshev brick into the endgame namespace for invent awareness. -/
theorem endgame_cheb1a_psi_bound :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x →
      ∑ n ∈ Finset.Ioc 0 ⌊x⌋₊, ArithmeticFunction.vonMangoldt n ≤ C * x :=
  cheb1a_psi_bound

end
