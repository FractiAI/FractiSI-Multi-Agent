/-
FractiSI invent — Riemann–von Mangoldt *scaffolding* (Challenge-only Mathlib).
NO import of Anthropic Zeta23.

Closed here from Mathlib + ChallengeDeps seam (`zerosIn_finite`, `Ncount_add`):
  · multiplicity lower bound on nontrivial zeros
  · ncard / finsum comparisons among Ndist, Ncount, N0star, N0simple
  · window monotonicity and unit-window packing
  · uniform Nat bound for unit windows on any compact ordinate interval
  · pointwise (non-uniform) log-shape bound from local finiteness

Classical target (comments only — not claimed):
  ∃ A₀ ≥ 1, ∀ t, Ncount t (t+1) ≤ A₀ * log(|t|+3)
GAP: needs ζ growth / argument-principle density (Tit86 Thm 9.2). Mathlib supplies
discrete zeros ∩ compact ⇒ finite, not a uniform log-density constant.
-/
import ChallengeDeps
import InventEndgame
import Mathlib.NumberTheory.LSeries.ZetaZeros
import Mathlib.NumberTheory.LSeries.RiemannZeta
import Mathlib.NumberTheory.LSeries.Nonvanishing
import Mathlib.Analysis.Analytic.Order
import Mathlib.Analysis.Normed.Module.Connected

open Complex Set Filter
open scoped BigOperators

noncomputable section

/-! ## Multiplicity ≥ 1 on nontrivial zeros (Mathlib analytic order) -/

/-- Zeta is analytic on `{1}ᶜ` with a non-vanishing point, so the order is never `⊤` off the pole. -/
theorem analyticOrderAt_riemannZeta_ne_top {s : ℂ} (hs : s ≠ 1) :
    analyticOrderAt riemannZeta s ≠ ⊤ := by
  have hconn : IsPreconnected ({1}ᶜ : Set ℂ) :=
    (isConnected_compl_singleton_of_one_lt_rank (by simp) (1 : ℂ)).isPreconnected
  have h2 : (2 : ℂ) ∈ ({1}ᶜ : Set ℂ) := by norm_num
  refine analyticOn_riemannZeta.analyticOrderAt_ne_top_of_isPreconnected hconn h2 hs ?_
  rw [(analyticOn_riemannZeta 2 h2).analyticOrderAt_eq_zero.mpr
      (riemannZeta_ne_zero_of_one_lt_re (by norm_num))]
  exact ENat.zero_ne_top

/-- Nontrivial zeros have multiplicity at least 1. -/
theorem one_le_zeroMult {ρ : ℂ} (h : IsNontrivialZero ρ) : 1 ≤ zeroMult ρ := by
  have hρ1 : ρ ≠ 1 := by
    intro heq
    have : (0 : ℝ) < ρ.re ∧ ρ.re < 1 := ⟨h.2.1, h.2.2⟩
    simp [heq] at this
  have han : AnalyticAt ℂ riemannZeta ρ := analyticOn_riemannZeta ρ hρ1
  have hne0 : analyticOrderAt riemannZeta ρ ≠ 0 := han.analyticOrderAt_ne_zero.mpr h.1
  have hnetop := analyticOrderAt_riemannZeta_ne_top hρ1
  unfold zeroMult
  exact Nat.succ_le_iff.mpr (ENat.toNat_pos hne0 hnetop)

/-! ## Counting comparisons (ncard vs finsum) -/

/-- Distinct count ≤ multiplicity count. -/
theorem Ndist_le_Ncount (T₁ T₂ : ℝ) : Ndist T₁ T₂ ≤ Ncount T₁ T₂ := by
  classical
  unfold Ndist Ncount
  set s := zerosIn T₁ T₂
  have hs : s.Finite := zerosIn_finite T₁ T₂
  rw [ncard_eq_toFinset_card s hs, finsum_mem_eq_finite_toFinset_sum _ hs,
    Finset.card_eq_sum_ones]
  refine Finset.sum_le_sum fun ρ hρ => ?_
  have hmem : ρ ∈ s := (hs.mem_toFinset).1 hρ
  exact one_le_zeroMult hmem.1

/-- On-line distinct ≤ all distinct. -/
theorem N0star_le_Ndist (T₁ T₂ : ℝ) : N0star T₁ T₂ ≤ Ndist T₁ T₂ := by
  unfold N0star Ndist
  exact ncard_le_ncard inter_subset_left (zerosIn_finite T₁ T₂)

/-- Simple on-line ≤ on-line distinct. -/
theorem N0simple_le_N0star (T₁ T₂ : ℝ) : N0simple T₁ T₂ ≤ N0star T₁ T₂ := by
  unfold N0simple N0star
  exact ncard_le_ncard inter_subset_left ((zerosIn_finite T₁ T₂).inter_of_left _)

/-- Chain: N0simple ≤ N0star ≤ Ndist ≤ Ncount. -/
theorem N0simple_le_Ncount (T₁ T₂ : ℝ) : N0simple T₁ T₂ ≤ Ncount T₁ T₂ :=
  (N0simple_le_N0star T₁ T₂).trans <|
    (N0star_le_Ndist T₁ T₂).trans (Ndist_le_Ncount T₁ T₂)

/-- Distinct zeros in a window sit in the compact strip rectangle of zeros. -/
theorem Ndist_le_compact_strip_ncard (T₁ T₂ : ℝ) :
    Ndist T₁ T₂ ≤
      (((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) ∩ riemannZetaZeros).ncard := by
  unfold Ndist
  have hK : IsCompact ((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) :=
    isCompact_Icc.reProdIm isCompact_Icc
  exact ncard_le_ncard (zerosIn_subset_compact T₁ T₂) (hK.inter_riemannZetaZeros_finite)

/-! ## Window monotonicity + unit packing -/

/-- Nested ordinate windows: tighter window ⊆ wider window. -/
theorem zerosIn_subset_of_window {a a' b' b : ℝ} (ha : a ≤ a') (hb : b' ≤ b) :
    zerosIn a' b' ⊆ zerosIn a b := by
  intro ρ ⟨hρ, him1, him2⟩
  exact ⟨hρ, lt_of_le_of_lt ha him1, him2.trans hb⟩

/-- Multiplicity count is monotone in the ordinate window. -/
theorem Ncount_mono {a a' b' b : ℝ} (ha : a ≤ a') (hb : b' ≤ b) :
    Ncount a' b' ≤ Ncount a b := by
  classical
  unfold Ncount
  set s := zerosIn a' b'
  set t := zerosIn a b
  have hs : s.Finite := zerosIn_finite a' b'
  have ht : t.Finite := zerosIn_finite a b
  have hsub : s ⊆ t := zerosIn_subset_of_window ha hb
  rw [finsum_mem_eq_finite_toFinset_sum _ hs, finsum_mem_eq_finite_toFinset_sum _ ht]
  refine Finset.sum_le_sum_of_subset_of_nonneg ?_ fun _ _ _ => Nat.zero_le _
  intro ρ hρ
  have : ρ ∈ s := (hs.mem_toFinset).1 hρ
  exact (ht.mem_toFinset).2 (hsub this)

/-- Distinct count is monotone in the ordinate window. -/
theorem Ndist_mono {a a' b' b : ℝ} (ha : a ≤ a') (hb : b' ≤ b) :
    Ndist a' b' ≤ Ndist a b := by
  unfold Ndist
  exact ncard_le_ncard (zerosIn_subset_of_window ha hb) (zerosIn_finite a b)

/-- Unit window at `t ∈ [T₀, T₁]` sits inside the big window `(T₀, T₁+1]`. -/
theorem zerosIn_unit_subset_on_Icc {T₀ T₁ t : ℝ} (ht : t ∈ Icc T₀ T₁) :
    zerosIn t (t + 1) ⊆ zerosIn T₀ (T₁ + 1) :=
  zerosIn_subset_of_window ht.1 (by linarith [ht.2])

/-- Unit-window multiplicity bound by the ambient window. -/
theorem Ncount_unit_le_ambient {T₀ T₁ t : ℝ} (ht : t ∈ Icc T₀ T₁) :
    Ncount t (t + 1) ≤ Ncount T₀ (T₁ + 1) :=
  Ncount_mono ht.1 (by linarith [ht.2])

/-- Uniform Nat bound for all unit windows whose left endpoint lies in a compact interval. -/
theorem exists_uniform_Ncount_unit_on_Icc (T₀ T₁ : ℝ) (_h : T₀ ≤ T₁) :
    ∃ M : ℕ, ∀ t ∈ Icc T₀ T₁, Ncount t (t + 1) ≤ M :=
  ⟨Ncount T₀ (T₁ + 1), fun _t ht => Ncount_unit_le_ambient ht⟩

/-- Pack `n` successive unit windows by `Ncount_add`. -/
theorem Ncount_sum_unit_windows (a : ℝ) (n : ℕ) :
    Ncount a (a + n) = ∑ i ∈ Finset.range n, Ncount (a + i) (a + i + 1) := by
  induction n with
  | zero =>
    have h0 : Ncount a a = 0 := by
      have := Ncount_add (a := a) (b := a) (c := a) le_rfl le_rfl
      linarith
    simp [h0]
  | succ n ih =>
    have hab : (a : ℝ) ≤ a + n := by
      have : (0 : ℝ) ≤ (n : ℝ) := Nat.cast_nonneg _
      linarith
    have hbc : (a + (n : ℝ) : ℝ) ≤ a + n + 1 := by linarith
    have hEq : (a + ((n + 1 : ℕ) : ℝ) : ℝ) = a + n + 1 := by
      push_cast
      ring
    rw [hEq, Ncount_add hab hbc, ih, Finset.sum_range_succ]

/-! ## Log-shape scaffolding (pointwise closed; uniform classical form is the gap) -/

theorem log_abs_add_three_pos (t : ℝ) : 0 < Real.log (|t| + 3) := by
  have : (1 : ℝ) < |t| + 3 := by
    have := abs_nonneg t
    linarith
  exact Real.log_pos this

/-- Pointwise log-shape bound from local finiteness (A₀ may depend on `t`). -/
theorem exists_A0_Ncount_unit_log (t : ℝ) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) := by
  set N : ℝ := (Ncount t (t + 1) : ℝ)
  set L : ℝ := Real.log (|t| + 3)
  have hL : 0 < L := log_abs_add_three_pos t
  refine ⟨max (1 : ℝ) (N / L), le_max_left _ _, ?_⟩
  have hdiv : N = (N / L) * L := (div_mul_cancel₀ N hL.ne').symm
  calc
    N = (N / L) * L := hdiv
    _ ≤ max (1 : ℝ) (N / L) * L :=
      mul_le_mul_of_nonneg_right (le_max_right _ _) hL.le

/-- On any compact ordinate interval, a single A works for all unit windows there
(still not the classical global Tit86 constant — that needs growth). -/
theorem exists_A0_Ncount_unit_log_on_Icc (T₀ T₁ : ℝ) (h : T₀ ≤ T₁) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t ∈ Icc T₀ T₁,
      (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) := by
  obtain ⟨M, hM⟩ := exists_uniform_Ncount_unit_on_Icc T₀ T₁ h
  have hlog3 : 0 < Real.log 3 := Real.log_pos (by norm_num)
  refine ⟨max (1 : ℝ) (M / Real.log 3), le_max_left _ _, fun t ht => ?_⟩
  have hML : (M : ℝ) ≤ max (1 : ℝ) (M / Real.log 3) * Real.log 3 := by
    have : (M : ℝ) = (M / Real.log 3) * Real.log 3 :=
      (div_mul_cancel₀ (M : ℝ) hlog3.ne').symm
    calc
      (M : ℝ) = (M / Real.log 3) * Real.log 3 := this
      _ ≤ max (1 : ℝ) (M / Real.log 3) * Real.log 3 :=
        mul_le_mul_of_nonneg_right (le_max_right _ _) hlog3.le
  have hNt : (Ncount t (t + 1) : ℝ) ≤ M := by exact_mod_cast hM t ht
  have hlog : Real.log 3 ≤ Real.log (|t| + 3) := by
    apply Real.log_le_log (by norm_num) (by
      have := abs_nonneg t
      linarith)
  have hA0 : 0 ≤ max (1 : ℝ) (M / Real.log 3) :=
    le_trans (by norm_num : (0 : ℝ) ≤ 1) (le_max_left _ _)
  calc
    (Ncount t (t + 1) : ℝ) ≤ M := hNt
    _ ≤ max (1 : ℝ) (M / Real.log 3) * Real.log 3 := hML
    _ ≤ max (1 : ℝ) (M / Real.log 3) * Real.log (|t| + 3) :=
      mul_le_mul_of_nonneg_left hlog hA0

/-! ## Classical target shape (awareness only — gap named, not sorry'd) -/

/-- Classical local Riemann–von Mangoldt count (Tit86 Thm 9.2 shape), ChallengeDeps `Ncount`.

GAP (not closed here): a *uniform* A₀ for all real t requires ζ growth / Jensen–Landau
zero-density input beyond Mathlib's discrete-zeros ∩ compact finiteness. Closed scaffolding
above feeds this once that analytic step invents. -/
def RiemannVonMangoldtLocalCount : Prop :=
  ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t : ℝ, (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3)

/-- Dyadic main term shape companion (awareness). Same analytic gap as local_count. -/
def RiemannVonMangoldtMainCount : Prop :=
  ∃ C T₀ : ℝ, ∀ T : ℝ, T₀ ≤ T →
    |(Ncount T (2 * T) : ℝ) - T / (2 * Real.pi) * (Real.log (T / (2 * Real.pi)) + 2 * Real.log 2 - 1)| ≤
      C * Real.log T

/-- Bundle matching the classical H-RvM pair (local + main). -/
structure RiemannVonMangoldtScaffold : Prop where
  local_count : RiemannVonMangoldtLocalCount
  main : RiemannVonMangoldtMainCount

/-- Compact-interval weakening: the local_count shape holds on every `Icc T₀ T₁`. -/
theorem RiemannVonMangoldtLocalCount_on_Icc (T₀ T₁ : ℝ) (h : T₀ ≤ T₁) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t ∈ Icc T₀ T₁,
      (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) :=
  exists_A0_Ncount_unit_log_on_Icc T₀ T₁ h

end
