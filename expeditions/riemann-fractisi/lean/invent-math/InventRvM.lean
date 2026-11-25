/-
FractiSI invent — Riemann–von Mangoldt *scaffolding* (Challenge-only Mathlib).
NO import of Anthropic Zeta23.

Closed here from Mathlib + ChallengeDeps seam (`zerosIn_finite`, `Ncount_add`):
  · multiplicity lower bound on nontrivial zeros
  · ncard / finsum comparisons among Ndist, Ncount, N0star, N0simple
  · window monotonicity and unit-window packing
  · uniform Nat bound for unit windows on any compact ordinate interval
  · pointwise (non-uniform) log-shape bound from local finiteness
  · ordinate growth: nontrivial zeros in any horizontal strip are finite
  · multiplicity majorants: Ncount ≤ (max mult) · Ndist on each window
  · absolute-strip ambient majorants for unit and dyadic windows
  · dyadic packing (ℕ exact; ℝ via floor/ceil unit sums)
  · local_count ⇒ dyadic O(T log T) majorant (reduction only)

Classical target (comments only — not claimed):
  ∃ A₀ ≥ 1, ∀ t, Ncount t (t+1) ≤ A₀ * log(|t|+3)
GAP: needs ζ growth / argument-principle density (Tit86 Thm 9.2). Mathlib supplies
discrete zeros ∩ compact ⇒ finite, not a uniform log-density constant.
Do **not** treat `InventRvMLike` as discharged: Tit86 uniform constant remains open.
-/
import ChallengeDeps
import InventEndgame
import InventMainEstimate
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

/-! ## Ordinate growth + strip ncard majorants (Mathlib discreteness) -/

/-- Nontrivial zeros with bounded imaginary part sit in a compact critical strip. -/
theorem nontrivialZeros_im_le_subset_compact (M : ℝ) :
    {ρ : ℂ | IsNontrivialZero ρ ∧ |ρ.im| ≤ M} ⊆
      ((Icc (0 : ℝ) 1) ×ℂ (Icc (-M) M)) ∩ riemannZetaZeros := by
  intro ρ ⟨hρ, him⟩
  refine ⟨⟨⟨hρ.2.1.le, hρ.2.2.le⟩, abs_le.mp him⟩, ?_⟩
  simpa [riemannZetaZeros] using hρ.1

/-- Any horizontal strip contains only finitely many nontrivial zeros. -/
theorem nontrivialZeros_im_le_finite (M : ℝ) :
    {ρ : ℂ | IsNontrivialZero ρ ∧ |ρ.im| ≤ M}.Finite := by
  have hK : IsCompact ((Icc (0 : ℝ) 1) ×ℂ (Icc (-M) M)) :=
    isCompact_Icc.reProdIm isCompact_Icc
  exact (hK.inter_riemannZetaZeros_finite).subset (nontrivialZeros_im_le_subset_compact M)

/-- Expanding critical-strip ∩ zeros is finite (ncard majorant carrier). -/
theorem compact_strip_riemannZetaZeros_finite (T₁ T₂ : ℝ) :
    (((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) ∩ riemannZetaZeros).Finite := by
  have hK : IsCompact ((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) :=
    isCompact_Icc.reProdIm isCompact_Icc
  exact hK.inter_riemannZetaZeros_finite

/-- Absolute-height strip majorizes the ChallengeDeps window count carrier. -/
theorem zerosIn_subset_abs_strip (T₁ T₂ : ℝ) :
    zerosIn T₁ T₂ ⊆ {ρ : ℂ | IsNontrivialZero ρ ∧ |ρ.im| ≤ max |T₁| |T₂| + 1} := by
  intro ρ ⟨hρ, him1, him2⟩
  refine ⟨hρ, abs_le.mpr ⟨?_, ?_⟩⟩
  · have hT : -(max |T₁| |T₂|) ≤ T₁ := by
      have : -|T₁| ≤ T₁ := neg_abs_le T₁
      exact (neg_le_neg (le_max_left |T₁| |T₂|)).trans this
    linarith [him1.le]
  · have hT : T₂ ≤ max |T₁| |T₂| := (le_abs_self T₂).trans (le_max_right _ _)
    linarith [him2]

/-! ## Multiplicity packing: Ncount ≤ (max mult) · Ndist -/

/-- On each finite window the analytic order (multiplicity) is bounded. -/
theorem exists_mulBound_zerosIn (T₁ T₂ : ℝ) :
    ∃ M : ℕ, ∀ ρ ∈ zerosIn T₁ T₂, zeroMult ρ ≤ M := by
  classical
  set s := zerosIn T₁ T₂
  have hs : s.Finite := zerosIn_finite T₁ T₂
  refine ⟨hs.toFinset.sup zeroMult, fun ρ hρ => ?_⟩
  exact Finset.le_sup (f := zeroMult) (hs.mem_toFinset.2 hρ)

/-- Multiplicity count ≤ (max multiplicity) × distinct count. -/
theorem Ncount_le_mul_Ndist (T₁ T₂ : ℝ) :
    ∃ M : ℕ, Ncount T₁ T₂ ≤ M * Ndist T₁ T₂ := by
  classical
  obtain ⟨M, hM⟩ := exists_mulBound_zerosIn T₁ T₂
  refine ⟨M, ?_⟩
  unfold Ncount Ndist
  set s := zerosIn T₁ T₂
  have hs : s.Finite := zerosIn_finite T₁ T₂
  rw [finsum_mem_eq_finite_toFinset_sum _ hs, ncard_eq_toFinset_card s hs]
  have hsum :
      ∑ ρ ∈ hs.toFinset, zeroMult ρ ≤ ∑ ρ ∈ hs.toFinset, M :=
    Finset.sum_le_sum fun ρ hρ => hM ρ (hs.mem_toFinset.1 hρ)
  have hMsum : ∑ ρ ∈ hs.toFinset, M = M * hs.toFinset.card := by
    simp [mul_comm]
  exact hsum.trans_eq hMsum

/-- Distinct count on the compact strip majorizes `Ndist`. -/
theorem Ndist_le_strip_ncard (T₁ T₂ : ℝ) :
    Ndist T₁ T₂ ≤
      (((Icc (0 : ℝ) 1) ×ℂ (Icc T₁ T₂)) ∩ riemannZetaZeros).ncard :=
  Ndist_le_compact_strip_ncard T₁ T₂

/-! ## Absolute-strip ambient majorants -/

/-- Unit window sits inside the symmetric absolute strip of height `|t|+1`. -/
theorem zerosIn_unit_subset_abs_strip (t : ℝ) :
    zerosIn t (t + 1) ⊆ zerosIn (-(|t| + 1)) (|t| + 1) := by
  apply zerosIn_subset_of_window
  · have : -(|t| + 1) ≤ t := by
      cases le_total 0 t with
      | inl h => nlinarith [abs_of_nonneg h]
      | inr h => nlinarith [abs_of_nonpos h]
    exact this
  · have : t + 1 ≤ |t| + 1 := by
      cases le_total 0 t with
      | inl h => nlinarith [abs_of_nonneg h]
      | inr h => nlinarith [abs_of_nonpos h]
    exact this

theorem Ncount_unit_le_abs_strip (t : ℝ) :
    Ncount t (t + 1) ≤ Ncount (-(|t| + 1)) (|t| + 1) :=
  Ncount_mono (by
    cases le_total 0 t with
    | inl h => nlinarith [abs_of_nonneg h]
    | inr h => nlinarith [abs_of_nonpos h]) (by
    cases le_total 0 t with
    | inl h => nlinarith [abs_of_nonneg h]
    | inr h => nlinarith [abs_of_nonpos h])

/-- Dyadic window `[T, 2T]` sits in the absolute strip of height `2|T|` (T ≥ 0). -/
theorem zerosIn_dyadic_subset_abs_strip {T : ℝ} (hT : 0 ≤ T) :
    zerosIn T (2 * T) ⊆ zerosIn (-(2 * T)) (2 * T) :=
  zerosIn_subset_of_window (by nlinarith) (by nlinarith)

theorem Ncount_dyadic_le_abs_strip {T : ℝ} (hT : 0 ≤ T) :
    Ncount T (2 * T) ≤ Ncount (-(2 * T)) (2 * T) :=
  Ncount_mono (by nlinarith) (by nlinarith)

/-! ## Dyadic packing (exact on ℕ; Nat.floor/Nat.ceil on ℝ) -/

/-- Exact dyadic packing on natural endpoints: `[n, 2n] = n` unit windows. -/
theorem Ncount_dyadic_nat (n : ℕ) :
    Ncount (n : ℝ) (n + n : ℝ) =
      ∑ i ∈ Finset.range n, Ncount ((n : ℝ) + i) ((n : ℝ) + i + 1) :=
  Ncount_sum_unit_windows (n : ℝ) n

theorem Ncount_dyadic_nat' (n : ℕ) :
    Ncount (n : ℝ) ((2 * n : ℕ) : ℝ) =
      ∑ i ∈ Finset.range n, Ncount ((n : ℝ) + i) ((n : ℝ) + i + 1) := by
  have hEq : ((2 * n : ℕ) : ℝ) = (n : ℝ) + n := by push_cast; ring
  simpa [hEq] using Ncount_dyadic_nat n

/-- Floor/ceil ambient window majorizes the real dyadic window. -/
theorem Ncount_dyadic_le_floor_ceil {T : ℝ} (hT : 0 ≤ T) :
    Ncount T (2 * T) ≤ Ncount (⌊T⌋₊ : ℝ) (⌈(2 * T)⌉₊ : ℝ) :=
  Ncount_mono (Nat.floor_le hT) (Nat.le_ceil (2 * T))

/-- Nat.floor ≤ Nat.ceil on nonnegative dyadic packing. -/
theorem floor_le_ceil_dyadic {T : ℝ} (hT : 0 ≤ T) : ⌊T⌋₊ ≤ ⌈(2 * T)⌉₊ := by
  have h1 : (⌊T⌋₊ : ℝ) ≤ T := Nat.floor_le hT
  have h2 : (2 * T : ℝ) ≤ ⌈(2 * T)⌉₊ := Nat.le_ceil _
  have h3 : (T : ℝ) ≤ 2 * T := by nlinarith
  exact_mod_cast (h1.trans (h3.trans h2))

/-- Packed unit-sum expression for the floor/ceil ambient dyadic window. -/
theorem Ncount_floor_ceil_eq_sum {T : ℝ} (hT : 0 ≤ T) :
    Ncount (⌊T⌋₊ : ℝ) (⌈(2 * T)⌉₊ : ℝ) =
      ∑ i ∈ Finset.range (⌈(2 * T)⌉₊ - ⌊T⌋₊),
        Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) := by
  have hle := floor_le_ceil_dyadic hT
  have hn : (⌊T⌋₊ : ℝ) + (⌈(2 * T)⌉₊ - ⌊T⌋₊ : ℕ) = (⌈(2 * T)⌉₊ : ℝ) := by
    have := Nat.cast_sub hle (R := ℝ)
    linarith
  simpa [hn] using Ncount_sum_unit_windows (⌊T⌋₊ : ℝ) (⌈(2 * T)⌉₊ - ⌊T⌋₊)

/-- Pack length (number of unit windows) ≤ `T + 2`. -/
theorem floor_ceil_pack_length_le {T : ℝ} (hT : 0 ≤ T) :
    ((⌈(2 * T)⌉₊ - ⌊T⌋₊ : ℕ) : ℝ) ≤ T + 2 := by
  have hle := floor_le_ceil_dyadic hT
  have hceil : (⌈(2 * T)⌉₊ : ℝ) ≤ 2 * T + 1 :=
    (Nat.ceil_lt_add_one (by nlinarith : (0 : ℝ) ≤ 2 * T)).le
  have hfloor : (T : ℝ) - 1 ≤ (⌊T⌋₊ : ℝ) := (Nat.sub_one_lt_floor T).le
  have : ((⌈(2 * T)⌉₊ - ⌊T⌋₊ : ℕ) : ℝ) = (⌈(2 * T)⌉₊ : ℝ) - (⌊T⌋₊ : ℝ) :=
    Nat.cast_sub hle
  rw [this]
  nlinarith

/-- Left endpoint of the `i`-th packed unit window is ≤ `2T + 1`. -/
theorem floor_add_lt_ceil_bound {T : ℝ} (hT : 0 ≤ T) {i : ℕ}
    (hi : i < ⌈(2 * T)⌉₊ - ⌊T⌋₊) :
    (⌊T⌋₊ : ℝ) + i ≤ 2 * T + 1 := by
  have hle := floor_le_ceil_dyadic hT
  have hceil_i : ⌊T⌋₊ + i ≤ ⌈(2 * T)⌉₊ := by omega
  have : ((⌊T⌋₊ + i : ℕ) : ℝ) ≤ (⌈(2 * T)⌉₊ : ℝ) := Nat.cast_le.mpr hceil_i
  have hceil : (⌈(2 * T)⌉₊ : ℝ) ≤ 2 * T + 1 :=
    (Nat.ceil_lt_add_one (by nlinarith : (0 : ℝ) ≤ 2 * T)).le
  have hcast : (⌊T⌋₊ : ℝ) + (i : ℝ) = ((⌊T⌋₊ + i : ℕ) : ℝ) := by push_cast; rfl
  linarith

/-! ## Local-count ⇒ dyadic O(T log T) majorant (reduction; not Tit86) -/

/-- Growth envelope implied by a uniform unit-window log bound.
Still conditional on `RiemannVonMangoldtLocalCount` — does not discharge Tit86. -/
def DyadicNcountMajorant : Prop :=
  ∃ C T₀ : ℝ, ∀ T : ℝ, T₀ ≤ T →
    (Ncount T (2 * T) : ℝ) ≤ C * T * Real.log (T + 3)

private theorem log_twoT_add_four_le {T : ℝ} (hT : 2 ≤ T) :
    Real.log (2 * T + 4) ≤ 2 * Real.log (T + 3) := by
  have hpos3 : (0 : ℝ) < T + 3 := by linarith
  have hle : Real.log (2 * T + 4) ≤ Real.log (2 * (T + 3)) := by
    apply Real.log_le_log (by nlinarith)
    nlinarith
  have hmul : Real.log (2 * (T + 3)) = Real.log 2 + Real.log (T + 3) :=
    Real.log_mul (by norm_num) hpos3.ne'
  have h2 : Real.log 2 ≤ Real.log (T + 3) :=
    Real.log_le_log (by norm_num) (by linarith)
  linarith [hle.trans_eq hmul]

/-- Under classical local_count, dyadic windows are O(T log T).
Uses `T₀ = 2` so that `T + 2 ≤ 2T`. -/
theorem dyadic_majorant_of_local_count (h : RiemannVonMangoldtLocalCount) :
    DyadicNcountMajorant := by
  obtain ⟨A₀, hA₀, hloc⟩ := h
  refine ⟨A₀ * 4, 2, fun T hT => ?_⟩
  have hT1 : (1 : ℝ) ≤ T := le_trans (by norm_num) hT
  have hT0 : (0 : ℝ) ≤ T := le_trans (by norm_num) hT1
  have hA0n : 0 ≤ A₀ := le_trans (by norm_num : (0 : ℝ) ≤ 1) hA₀
  set n : ℕ := ⌈(2 * T)⌉₊ - ⌊T⌋₊
  have hpack : (Ncount T (2 * T) : ℝ) ≤ (Ncount (⌊T⌋₊ : ℝ) (⌈(2 * T)⌉₊ : ℝ) : ℝ) := by
    exact_mod_cast Ncount_dyadic_le_floor_ceil hT0
  have hsumEq := Ncount_floor_ceil_eq_sum hT0
  have hNt :
      (Ncount T (2 * T) : ℝ) ≤
        ∑ i ∈ Finset.range n, (Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) : ℝ) := by
    calc
      (Ncount T (2 * T) : ℝ) ≤ (Ncount (⌊T⌋₊ : ℝ) (⌈(2 * T)⌉₊ : ℝ) : ℝ) := hpack
      _ = ∑ i ∈ Finset.range n,
            (Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) : ℝ) := by
          simp [hsumEq, n, Nat.cast_sum]
  have hterm :
      ∀ i ∈ Finset.range n,
        (Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) : ℝ) ≤
          A₀ * Real.log (2 * T + 4) := by
    intro i hi
    have hi' : i < n := Finset.mem_range.mp hi
    have ht := hloc ((⌊T⌋₊ : ℝ) + i)
    have hnn : 0 ≤ (⌊T⌋₊ : ℝ) + i :=
      add_nonneg (Nat.cast_nonneg _) (Nat.cast_nonneg _)
    have hbound := floor_add_lt_ceil_bound hT0 (by simpa [n] using hi')
    have hlog :
        Real.log (|((⌊T⌋₊ : ℝ) + i)| + 3) ≤ Real.log (2 * T + 4) := by
      apply Real.log_le_log
      · linarith [abs_nonneg ((⌊T⌋₊ : ℝ) + i)]
      · rw [abs_of_nonneg hnn]; linarith
    exact ht.trans (mul_le_mul_of_nonneg_left hlog hA0n)
  have hsum_le :
      ∑ i ∈ Finset.range n,
          (Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) : ℝ) ≤
        (n : ℝ) * (A₀ * Real.log (2 * T + 4)) := by
    refine (Finset.sum_le_card_nsmul _ _ (A₀ * Real.log (2 * T + 4)) hterm).trans_eq ?_
    simp [nsmul_eq_mul, Finset.card_range]
  have hnT : (n : ℝ) ≤ T + 2 := by simpa [n] using floor_ceil_pack_length_le hT0
  have hlogpos : 0 < Real.log (T + 3) := Real.log_pos (by linarith)
  have hlog4 := log_twoT_add_four_le hT
  have hnsmul :
      (n : ℝ) * (A₀ * Real.log (2 * T + 4)) ≤
        (T + 2) * (A₀ * (2 * Real.log (T + 3))) := by
    refine mul_le_mul hnT ?_ ?_ (by linarith)
    · exact mul_le_mul_of_nonneg_left hlog4 hA0n
    · exact mul_nonneg hA0n (Real.log_nonneg (by nlinarith : (1 : ℝ) ≤ 2 * T + 4))
  have hfinal :
      (T + 2) * (A₀ * (2 * Real.log (T + 3))) ≤ (A₀ * 4) * T * Real.log (T + 3) := by
    have hT2 : T + 2 ≤ 2 * T := by nlinarith
    have h1 :
        (T + 2) * (A₀ * (2 * Real.log (T + 3))) ≤
          (2 * T) * (A₀ * (2 * Real.log (T + 3))) :=
      mul_le_mul_of_nonneg_right hT2 (mul_nonneg hA0n (mul_nonneg (by norm_num) hlogpos.le))
    have h2 :
        (2 * T) * (A₀ * (2 * Real.log (T + 3))) = (A₀ * 4) * T * Real.log (T + 3) := by
      ring
    exact h1.trans_eq h2
  calc
    (Ncount T (2 * T) : ℝ) ≤
        ∑ i ∈ Finset.range n,
          (Ncount ((⌊T⌋₊ : ℝ) + i) ((⌊T⌋₊ : ℝ) + i + 1) : ℝ) := hNt
    _ ≤ (n : ℝ) * (A₀ * Real.log (2 * T + 4)) := hsum_le
    _ ≤ (T + 2) * (A₀ * (2 * Real.log (T + 3))) := hnsmul
    _ ≤ (A₀ * 4) * T * Real.log (T + 3) := hfinal

/-- Same local_count Prop as `InventRvMLike.local_count` (awareness bridge; not a discharge). -/
theorem inventRvMLike_local_count_of (h : RiemannVonMangoldtLocalCount) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t : ℝ,
      (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) :=
  h

/-- Package note: `InventRvMLike.main` omits the classical linear secondary term
`T/(2π)·(2 log 2 − 1)`. Classical `RiemannVonMangoldtMainCount` is therefore **not**
a drop-in witness for `InventRvMLike.main` (difference is Θ(T), not O(log T)).
Use `DyadicNcountMajorant` / packing lemmas above toward a corrected main-term invent.
GAP remains: Tit86 growth / argument principle. -/
theorem inventRvMLike_of_local_and_main
    (hloc : RiemannVonMangoldtLocalCount)
    (hmain : ∃ C T₀ : ℝ, ∀ T ≥ T₀,
      |(Ncount T (2 * T) : ℝ) -
          T / (2 * Real.pi) * Real.log (T / (2 * Real.pi))| ≤ C * Real.log T) :
    InventRvMLike :=
  ⟨hmain, hloc⟩

end
