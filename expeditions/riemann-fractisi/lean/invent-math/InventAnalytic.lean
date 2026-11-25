/-
FractiSI invent — analytic stack bricks (Challenge-only Mathlib).
NO import of Anthropic Zeta23.

Bricks:
  · Chebyshev–Mertens paper [eq:cheb1] upper bounds from Mathlib ψ ≪ x
      cheb1a: Σ Λ(n) ≪ x
      cheb1b: Σ Λ(n)/√n ≤ 3√x for large x
      cheb1c: Σ Λ(n)/(√n log n) ≪ √x / log x
      cheb1d: Σ Λ(n)² ≪ x log x
  · ψ / θ asymptotic helpers (Mathlib Chebyshev)
  · Zero-side §6 arithmetic (N0star_lower_explicit / N0star_lower_H)
Remaining invent: Weil EF · RvM · Stirling Γ′/Γ · MV · traces → feed these into MainEstimate*.
-/
import InventMath
import Mathlib.NumberTheory.Chebyshev
import Mathlib.NumberTheory.AbelSummation
import Mathlib.NumberTheory.ArithmeticFunction.VonMangoldt
import Mathlib.Analysis.SpecialFunctions.Integrals.Basic
import Mathlib.Analysis.Complex.ExponentialBounds

open Finset Real MeasureTheory
open ArithmeticFunction hiding log id
open Chebyshev
open scoped Topology

noncomputable section

/-! ## Chebyshev–Mertens (paper [eq:cheb1] / [lem:cheb]) from Mathlib -/

/-- Paper [eq:cheb1] first line: Σ_{n≤x} Λ(n) ≪ x, via Mathlib `psi_le_const_mul_self`. -/
theorem cheb1a_psi_bound :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x → ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ≤ C * x := by
  refine ⟨Real.log 4 + 4, fun x hx => ?_⟩
  have hx0 : (0 : ℝ) ≤ x := by linarith
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

/-! ### ψ / θ asymptotic helpers (Mathlib) -/

/-- Sharper explicit upper bound: ψ x ≤ (log 4) x + 2 √x log x. -/
theorem cheb_psi_le_sharper {x : ℝ} (hx : 1 ≤ x) :
    ψ x ≤ Real.log 4 * x + 2 * Real.sqrt x * Real.log x :=
  psi_le hx

/-- θ x ≤ (log 4) x. -/
theorem cheb_theta_le {x : ℝ} (hx : 0 ≤ x) :
    θ x ≤ Real.log 4 * x :=
  theta_le_log4_mul_x hx

/-- ψ − θ = O(√x) with an explicit constant. -/
theorem cheb_psi_sub_theta_O_sqrt :
    ∃ C : ℝ, ∀ x : ℝ, ψ x - θ x ≤ C * Real.sqrt x :=
  psi_sub_theta_le_mul_sqrt

/-- Asymptotic form: ψ − θ = O[atTop] √·. -/
theorem cheb_isBigO_psi_sub_theta_sqrt :
    Asymptotics.IsBigO Filter.atTop (ψ - θ) Real.sqrt :=
  isBigO_psi_sub_theta_sqrt

/-- θ ≤ ψ always. -/
theorem cheb_theta_le_psi (x : ℝ) : θ x ≤ ψ x :=
  theta_le_psi x

/-! ### [eq:cheb1].4 — Σ Λ(n)² ≪ x log x -/

/-- Paper [eq:cheb1] fourth line: Σ_{n≤x} Λ(n)² ≤ (log 4 + 4) · x · log x (x ≥ 1). -/
theorem cheb1d_explicit {x : ℝ} (hx : 1 ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ^ 2 ≤ (Real.log 4 + 4) * x * Real.log x := by
  have hx0 : (0 : ℝ) ≤ x := zero_le_one.trans hx
  have hlog : (0 : ℝ) ≤ Real.log x := Real.log_nonneg hx
  have hpoint : ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ^ 2 ≤ (∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n) * Real.log x := by
    rw [Finset.sum_mul]
    refine Finset.sum_le_sum fun n hn => ?_
    obtain ⟨hn0, hnN⟩ := Finset.mem_Ioc.mp hn
    have hnx : (n : ℝ) ≤ x := (Nat.cast_le.mpr hnN).trans (Nat.floor_le hx0)
    have hΛlog : Λ n ≤ Real.log x :=
      (vonMangoldt_le_log).trans (Real.log_le_log (by exact_mod_cast hn0) hnx)
    calc Λ n ^ 2 = Λ n * Λ n := pow_two _
      _ ≤ Λ n * Real.log x := mul_le_mul_of_nonneg_left hΛlog vonMangoldt_nonneg
  have hψ : ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ≤ (Real.log 4 + 4) * x := by
    simpa [psi] using psi_le_const_mul_self hx0
  calc ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ^ 2
      ≤ (∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n) * Real.log x := hpoint
    _ ≤ ((Real.log 4 + 4) * x) * Real.log x := mul_le_mul_of_nonneg_right hψ hlog
    _ = (Real.log 4 + 4) * x * Real.log x := by ring

/-- Existential ≪ form of cheb1d (paper [eq:cheb1].4). -/
theorem cheb1d_psi_sq_bound :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x → ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ^ 2 ≤ C * x * Real.log x :=
  ⟨Real.log 4 + 4, fun x hx => cheb1d_explicit (by linarith)⟩

/-! ### [eq:cheb1].2 — Σ Λ(n)/√n ≤ 3√x for large x

Classical Abel summation against f(t) = t^{−1/2}, feeding Mathlib `psi_le`. -/

private lemma sum_Icc_eq_sum_Ioc_zero {c : ℕ → ℝ} (hc : c 0 = 0) (n : ℕ) :
    ∑ k ∈ Icc 0 n, c k = ∑ k ∈ Ioc 0 n, c k := by
  rw [Finset.Icc_eq_cons_Ioc (Nat.zero_le n), Finset.sum_cons, hc, zero_add]

private lemma psi_as_sum_Icc (t : ℝ) :
    ∑ k ∈ Icc 0 ⌊t⌋₊, Λ k = ψ t := by
  rw [sum_Icc_eq_sum_Ioc_zero (by simp) ⌊t⌋₊]; rfl

/-- Abel: Σ_{n≤x} Λ(n)/√n = x^{−1/2} ψ(x) + (1/2) ∫₁ˣ t^{−3/2} ψ(t) dt. -/
private lemma abel_vonMangoldt_div_sqrt {x : ℝ} (_hx : 1 ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n
      = x ^ (-(2⁻¹ : ℝ)) * ψ x
        + 2⁻¹ * ∫ t in Set.Ioc 1 x, t ^ (-(2⁻¹ : ℝ) - 1) * ψ t := by
  have hf_diff : ∀ t ∈ Set.Icc (1 : ℝ) x,
      DifferentiableAt ℝ (fun t : ℝ => t ^ (-(2⁻¹ : ℝ))) t := fun t ht =>
    Real.differentiableAt_rpow_const_of_ne _ (by nlinarith [ht.1] : t ≠ 0)
  have hderiv : deriv (fun t : ℝ => t ^ (-(2⁻¹ : ℝ)))
      = fun t : ℝ => -(2⁻¹ : ℝ) * t ^ (-(2⁻¹ : ℝ) - 1) := Real.deriv_rpow_const' _
  have hf_int : IntegrableOn (deriv fun t : ℝ => t ^ (-(2⁻¹ : ℝ))) (Set.Icc 1 x) := by
    rw [hderiv]
    refine (ContinuousOn.mul continuousOn_const ?_).integrableOn_Icc
    intro t ht
    exact (Real.continuousAt_rpow_const t _
      (Or.inl (by nlinarith [ht.1] : t ≠ 0))).continuousWithinAt
  have habel := sum_mul_eq_sub_integral_mul₀ (fun n => Λ n) (by simp) x hf_diff hf_int
  have hL : ∑ k ∈ Icc 0 ⌊x⌋₊, (k : ℝ) ^ (-(2⁻¹ : ℝ)) * Λ k
      = ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n := by
    rw [sum_Icc_eq_sum_Ioc_zero (by simp) ⌊x⌋₊]
    refine Finset.sum_congr rfl fun k hk => ?_
    have hrw : (k : ℝ) ^ (-(2⁻¹ : ℝ)) = (Real.sqrt k)⁻¹ := by
      rw [Real.sqrt_eq_rpow, ← Real.rpow_neg (Nat.cast_nonneg k)]
      norm_num
    rw [hrw, div_eq_mul_inv, mul_comm]
  rw [hL, psi_as_sum_Icc] at habel
  have hI : (∫ t in Set.Ioc 1 x, deriv (fun t : ℝ => t ^ (-(2⁻¹ : ℝ))) t
        * ∑ k ∈ Icc 0 ⌊t⌋₊, (fun n => Λ n) k)
      = -(2⁻¹ : ℝ) * ∫ t in Set.Ioc 1 x, t ^ (-(2⁻¹ : ℝ) - 1) * ψ t := by
    rw [← MeasureTheory.integral_const_mul]
    refine setIntegral_congr_fun measurableSet_Ioc fun t _ => ?_
    simp only [hderiv]
    rw [← psi_as_sum_Icc t]
    ring
  rw [habel, hI]
  ring

/-- Tail integral: ∫₁ˣ t^{−3/2} ψ(t) dt ≤ (log 4)(2√x − 2) + (log x)². -/
private lemma integral_psi_rpow_tail {x : ℝ} (hx : 1 ≤ x) :
    ∫ t in Set.Ioc 1 x, t ^ (-(2⁻¹ : ℝ) - 1) * ψ t
      ≤ Real.log 4 * (2 * Real.sqrt x - 2) + Real.log x ^ 2 := by
  have hx0 : (0 : ℝ) < x := lt_of_lt_of_le one_pos hx
  set g : ℝ → ℝ := fun t => Real.log 4 * t ^ (-(2⁻¹ : ℝ)) + 2 * (Real.log t * t⁻¹) with hg
  have hcont_g : ContinuousOn g (Set.Icc 1 x) := by
    apply ContinuousOn.add
    · exact continuousOn_const.mul fun t ht =>
        (Real.continuousAt_rpow_const t _
          (Or.inl (by nlinarith [ht.1] : t ≠ 0))).continuousWithinAt
    · refine continuousOn_const.mul (ContinuousOn.mul ?_ ?_)
      · exact fun t ht => (Real.continuousAt_log (by nlinarith [ht.1])).continuousWithinAt
      · exact continuousOn_inv₀.mono fun t ht => by
          simp only [Set.mem_compl_iff, Set.mem_singleton_iff]
          nlinarith [ht.1]
  have hpoint : ∀ t ∈ Set.Ioc (1 : ℝ) x,
      t ^ (-(2⁻¹ : ℝ) - 1) * ψ t ≤ g t := by
    intro t ht
    have ht1 : (1 : ℝ) ≤ t := ht.1.le
    have ht0 : (0 : ℝ) < t := lt_of_lt_of_le one_pos ht1
    have hψ : ψ t ≤ Real.log 4 * t + 2 * Real.sqrt t * Real.log t := psi_le ht1
    have hrnn : (0 : ℝ) ≤ t ^ (-(2⁻¹ : ℝ) - 1) := Real.rpow_nonneg ht0.le _
    calc t ^ (-(2⁻¹ : ℝ) - 1) * ψ t
        ≤ t ^ (-(2⁻¹ : ℝ) - 1) * (Real.log 4 * t + 2 * Real.sqrt t * Real.log t) :=
          mul_le_mul_of_nonneg_left hψ hrnn
      _ = g t := by
          rw [hg]
          have e1 : t ^ (-(2⁻¹ : ℝ) - 1) * t = t ^ (-(2⁻¹ : ℝ)) := by
            rw [← Real.rpow_add_one ht0.ne']
            ring_nf
          have e2 : t ^ (-(2⁻¹ : ℝ) - 1) * Real.sqrt t = t⁻¹ := by
            rw [Real.sqrt_eq_rpow, ← Real.rpow_add ht0, ← Real.rpow_neg_one t]
            norm_num
          calc t ^ (-(2⁻¹ : ℝ) - 1) * (Real.log 4 * t + 2 * Real.sqrt t * Real.log t)
              = Real.log 4 * (t ^ (-(2⁻¹ : ℝ) - 1) * t)
                + 2 * ((t ^ (-(2⁻¹ : ℝ) - 1) * Real.sqrt t) * Real.log t) := by ring
            _ = Real.log 4 * t ^ (-(2⁻¹ : ℝ)) + 2 * (Real.log t * t⁻¹) := by
                rw [e1, e2]; ring
  have hint_g : IntegrableOn g (Set.Ioc 1 x) :=
    (hcont_g.integrableOn_Icc).mono_set Set.Ioc_subset_Icc_self
  have hmeas_f : AEStronglyMeasurable (fun t : ℝ => t ^ (-(2⁻¹ : ℝ) - 1) * ψ t)
      (volume.restrict (Set.Ioc 1 x)) := by
    refine AEStronglyMeasurable.mul ?_ ?_
    · exact (ContinuousOn.aestronglyMeasurable (fun t ht =>
        (Real.continuousAt_rpow_const t _
          (Or.inl (by nlinarith [(Set.mem_Ioc.mp ht).1] : t ≠ 0))).continuousWithinAt)
        measurableSet_Ioc)
    · exact (psi_mono.measurable.aestronglyMeasurable).restrict
  have hint_f : IntegrableOn (fun t : ℝ => t ^ (-(2⁻¹ : ℝ) - 1) * ψ t) (Set.Ioc 1 x) := by
    refine Integrable.mono' (g := fun _ => (Real.log 4 + 4) * x)
      (integrableOn_const (by simp)) hmeas_f ?_
    filter_upwards [ae_restrict_mem measurableSet_Ioc] with t ht
    have ht1 : (1 : ℝ) ≤ t := ht.1.le
    have ht0 : (0 : ℝ) < t := lt_of_lt_of_le one_pos ht1
    have h1 : t ^ (-(2⁻¹ : ℝ) - 1) ≤ 1 :=
      Real.rpow_le_one_of_one_le_of_nonpos ht1 (by norm_num)
    have h2 : (0 : ℝ) ≤ ψ t := psi_nonneg t
    have h3 : ψ t ≤ (Real.log 4 + 4) * x :=
      le_trans (psi_mono ht.2) (psi_le_const_mul_self hx0.le)
    have hrnn : (0 : ℝ) ≤ t ^ (-(2⁻¹ : ℝ) - 1) := Real.rpow_nonneg ht0.le _
    rw [Real.norm_eq_abs, abs_of_nonneg (mul_nonneg hrnn h2)]
    calc t ^ (-(2⁻¹ : ℝ) - 1) * ψ t ≤ 1 * ψ t := mul_le_mul_of_nonneg_right h1 h2
      _ = ψ t := one_mul _
      _ ≤ (Real.log 4 + 4) * x := h3
  refine le_trans (setIntegral_mono_on hint_f hint_g measurableSet_Ioc hpoint) ?_
  rw [← intervalIntegral.integral_of_le hx]
  have hi1 : IntervalIntegrable (fun t : ℝ => Real.log 4 * t ^ (-(2⁻¹ : ℝ))) volume 1 x := by
    apply ContinuousOn.intervalIntegrable
    rw [Set.uIcc_of_le hx]
    exact continuousOn_const.mul fun t ht =>
      (Real.continuousAt_rpow_const t _
        (Or.inl (by nlinarith [ht.1] : t ≠ 0))).continuousWithinAt
  have hi2 : IntervalIntegrable (fun t : ℝ => 2 * (Real.log t * t⁻¹)) volume 1 x := by
    apply ContinuousOn.intervalIntegrable
    rw [Set.uIcc_of_le hx]
    refine continuousOn_const.mul (ContinuousOn.mul ?_ ?_)
    · exact fun t ht => (Real.continuousAt_log (by nlinarith [ht.1])).continuousWithinAt
    · exact continuousOn_inv₀.mono fun t ht => by
        simp only [Set.mem_compl_iff, Set.mem_singleton_iff]
        nlinarith [ht.1]
  rw [hg, intervalIntegral.integral_add hi1 hi2, intervalIntegral.integral_const_mul,
    intervalIntegral.integral_const_mul]
  have hv1 : ∫ t in (1 : ℝ)..x, t ^ (-(2⁻¹ : ℝ)) = 2 * Real.sqrt x - 2 := by
    rw [integral_rpow (Or.inl (by norm_num : (-1 : ℝ) < -(2⁻¹)))]
    rw [Real.one_rpow, Real.sqrt_eq_rpow]
    norm_num
    ring
  have hv2 : ∫ t in (1 : ℝ)..x, Real.log t * t⁻¹ = Real.log x ^ 2 / 2 := by
    have hftc : ∀ t ∈ Set.uIcc (1 : ℝ) x,
        HasDerivAt (fun t : ℝ => Real.log t ^ 2 / 2) (Real.log t * t⁻¹) t := by
      intro t ht
      rw [Set.uIcc_of_le hx] at ht
      have ht0 : t ≠ 0 := by nlinarith [ht.1]
      have h := ((Real.hasDerivAt_log ht0).pow 2).div_const 2
      have heq : Real.log t * t⁻¹ = ((2 : ℕ) : ℝ) * Real.log t ^ (2 - 1) * t⁻¹ / 2 := by
        push_cast
        ring
      rw [heq]
      exact h
    have hint : IntervalIntegrable (fun t : ℝ => Real.log t * t⁻¹) volume 1 x := by
      apply ContinuousOn.intervalIntegrable
      rw [Set.uIcc_of_le hx]
      refine ContinuousOn.mul ?_ ?_
      · exact fun t ht => (Real.continuousAt_log (by nlinarith [ht.1])).continuousWithinAt
      · exact continuousOn_inv₀.mono fun t ht => by
          simp only [Set.mem_compl_iff, Set.mem_singleton_iff]
          nlinarith [ht.1]
    rw [intervalIntegral.integral_eq_sub_of_hasDerivAt hftc hint]
    simp [Real.log_one]
  rw [hv1, hv2]
  ring_nf
  nlinarith [Real.sqrt_nonneg x, Real.log_nonneg hx]

/-- Precise Abel bound feeding `psi_le`. -/
theorem cheb1b_precise {x : ℝ} (hx : 1 ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n
      ≤ 2 * Real.log 4 * Real.sqrt x + 2 * Real.log x + Real.log x ^ 2 / 2 := by
  have hx0 : (0 : ℝ) < x := lt_of_lt_of_le one_pos hx
  rw [abel_vonMangoldt_div_sqrt hx]
  have h1 : x ^ (-(2⁻¹ : ℝ)) * ψ x ≤ Real.log 4 * Real.sqrt x + 2 * Real.log x := by
    have hψ := psi_le hx
    have hnn : (0 : ℝ) ≤ x ^ (-(2⁻¹ : ℝ)) := Real.rpow_nonneg hx0.le _
    have e1 : x ^ (-(2⁻¹ : ℝ)) * x = Real.sqrt x := by
      rw [← Real.rpow_add_one hx0.ne', Real.sqrt_eq_rpow]; norm_num
    have e2 : x ^ (-(2⁻¹ : ℝ)) * Real.sqrt x = 1 := by
      rw [Real.sqrt_eq_rpow, ← Real.rpow_add hx0]; norm_num
    calc x ^ (-(2⁻¹ : ℝ)) * ψ x
        ≤ x ^ (-(2⁻¹ : ℝ)) * (Real.log 4 * x + 2 * Real.sqrt x * Real.log x) :=
          mul_le_mul_of_nonneg_left hψ hnn
      _ = Real.log 4 * (x ^ (-(2⁻¹ : ℝ)) * x)
          + 2 * (x ^ (-(2⁻¹ : ℝ)) * Real.sqrt x) * Real.log x := by ring
      _ = Real.log 4 * Real.sqrt x + 2 * Real.log x := by rw [e1, e2]; ring
  have h2 := integral_psi_rpow_tail hx
  have hlog4 : (0 : ℝ) ≤ Real.log 4 := Real.log_nonneg (by norm_num)
  nlinarith [h1, h2]

/-- Uniform ≪ √x form with explicit constant. -/
theorem cheb1b_explicit {x : ℝ} (hx : 1 ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n ≤ (2 * Real.log 4 + 16) * Real.sqrt x := by
  have hx0 : (0 : ℝ) < x := lt_of_lt_of_le one_pos hx
  have h := cheb1b_precise hx
  have hq : x ^ ((4 : ℝ)⁻¹) * x ^ ((4 : ℝ)⁻¹) = Real.sqrt x := by
    rw [← Real.rpow_add hx0, Real.sqrt_eq_rpow]; norm_num
  have hlog : Real.log x ≤ 4 * x ^ ((4 : ℝ)⁻¹) := by
    have h4 := Real.log_le_rpow_div hx0.le (by norm_num : (0 : ℝ) < (4 : ℝ)⁻¹)
    rw [div_eq_mul_inv, inv_inv, mul_comm] at h4
    exact h4
  have h14 : x ^ ((4 : ℝ)⁻¹) ≤ Real.sqrt x := by
    rw [Real.sqrt_eq_rpow]
    exact Real.rpow_le_rpow_of_exponent_le hx (by norm_num)
  have hlognn : (0 : ℝ) ≤ Real.log x := Real.log_nonneg hx
  have h14nn : (0 : ℝ) ≤ x ^ ((4 : ℝ)⁻¹) := Real.rpow_nonneg hx0.le _
  have hsq : Real.log x ^ 2 ≤ 16 * Real.sqrt x := by nlinarith [hlog, hlognn, hq, h14nn]
  have h2log : 2 * Real.log x ≤ 8 * Real.sqrt x := by nlinarith [hlog, h14, h14nn]
  nlinarith [h, hsq, h2log]

/-- Paper [eq:cheb1].2 with explicit threshold: ≤ 3√x. -/
theorem cheb1b_three_explicit {x : ℝ}
    (hx : max 1 ((48 / (3 - 2 * Real.log 4)) ^ 4) ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n ≤ 3 * Real.sqrt x := by
  have hlog4lt : Real.log 4 < 3 / 2 := by
    have h2 : Real.log 4 = 2 * Real.log 2 := by
      rw [show (4 : ℝ) = 2 ^ 2 by norm_num, Real.log_pow]; push_cast; ring
    rw [h2]; nlinarith [Real.log_two_lt_d9]
  set c : ℝ := 3 - 2 * Real.log 4 with hc
  have hcpos : 0 < c := by rw [hc]; linarith
  have hx' : max 1 ((48 / c) ^ 4) ≤ x := by rw [hc]; exact hx
  have hx1 : (1 : ℝ) ≤ x := le_trans (le_max_left _ _) hx'
  have hx0 : (0 : ℝ) < x := lt_of_lt_of_le one_pos hx1
  have h := cheb1b_precise hx1
  have hlog8 : Real.log x ≤ 8 * x ^ ((8 : ℝ)⁻¹) := by
    have h8 := Real.log_le_rpow_div hx0.le (by norm_num : (0 : ℝ) < (8 : ℝ)⁻¹)
    rw [div_eq_mul_inv, inv_inv, mul_comm] at h8
    exact h8
  have h18nn : (0 : ℝ) ≤ x ^ ((8 : ℝ)⁻¹) := Real.rpow_nonneg hx0.le _
  have h14nn : (0 : ℝ) ≤ x ^ ((4 : ℝ)⁻¹) := Real.rpow_nonneg hx0.le _
  have hq8 : x ^ ((8 : ℝ)⁻¹) * x ^ ((8 : ℝ)⁻¹) = x ^ ((4 : ℝ)⁻¹) := by
    rw [← Real.rpow_add hx0]; norm_num
  have hsq : Real.log x ^ 2 ≤ 64 * x ^ ((4 : ℝ)⁻¹) := by
    nlinarith [hlog8, Real.log_nonneg hx1, hq8, h18nn]
  have h84 : x ^ ((8 : ℝ)⁻¹) ≤ x ^ ((4 : ℝ)⁻¹) :=
    Real.rpow_le_rpow_of_exponent_le hx1 (by norm_num)
  have hbound : 2 * Real.log x + Real.log x ^ 2 / 2 ≤ 48 * x ^ ((4 : ℝ)⁻¹) := by
    nlinarith [hlog8, hsq, h84]
  have hxc : (48 / c) ^ 4 ≤ x := le_trans (le_max_right _ _) hx'
  have h48nn : (0 : ℝ) ≤ 48 / c := by positivity
  have hx14 : 48 / c ≤ x ^ ((4 : ℝ)⁻¹) := by
    have hmono := Real.rpow_le_rpow (by positivity) hxc (by norm_num : (0 : ℝ) ≤ (4 : ℝ)⁻¹)
    rwa [← Real.rpow_natCast (48 / c) 4, ← Real.rpow_mul h48nn,
      (by norm_num : ((4 : ℕ) : ℝ) * (4 : ℝ)⁻¹ = 1), Real.rpow_one] at hmono
  have hsqrt : Real.sqrt x = x ^ ((4 : ℝ)⁻¹) * x ^ ((4 : ℝ)⁻¹) := by
    rw [← Real.rpow_add hx0, Real.sqrt_eq_rpow]; norm_num
  have hkey : 48 * x ^ ((4 : ℝ)⁻¹) ≤ c * Real.sqrt x := by
    rw [hsqrt]
    have hc48 : c * (48 / c) = 48 := by field_simp
    have h1 : (48 : ℝ) ≤ c * x ^ ((4 : ℝ)⁻¹) := by
      have h2 := mul_le_mul_of_nonneg_left hx14 hcpos.le
      rwa [hc48] at h2
    calc 48 * x ^ ((4 : ℝ)⁻¹) ≤ (c * x ^ ((4 : ℝ)⁻¹)) * x ^ ((4 : ℝ)⁻¹) :=
          mul_le_mul_of_nonneg_right h1 h14nn
      _ = c * (x ^ ((4 : ℝ)⁻¹) * x ^ ((4 : ℝ)⁻¹)) := by ring
  nlinarith [h, hbound, hkey, hc]

/-- Paper [eq:cheb1].2 existential: Σ Λ(n)/√n ≤ 3√x for large x. -/
theorem cheb1b_three :
    ∃ x₀ : ℝ, ∀ x : ℝ, x₀ ≤ x →
      ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n ≤ 3 * Real.sqrt x :=
  ⟨max 1 ((48 / (3 - 2 * Real.log 4)) ^ 4),
    fun _ hx => cheb1b_three_explicit hx⟩

/-- Weaker existential ≪ √x form (all x ≥ 1). -/
theorem cheb1b_bound :
    ∃ C : ℝ, ∀ x : ℝ, 1 ≤ x →
      ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n ≤ C * Real.sqrt x :=
  ⟨2 * Real.log 4 + 16, fun _ hx => cheb1b_explicit hx⟩

/-! ### [eq:cheb1].3 — Σ Λ(n)/(√n log n) ≪ √x / log x -/

/-- Elementary: Σ_{n≤N} 1/√n ≤ 2√N. -/
theorem sum_one_div_sqrt_le (N : ℕ) :
    ∑ n ∈ Ioc 0 N, (1 : ℝ) / Real.sqrt n ≤ 2 * Real.sqrt N := by
  induction N with
  | zero => simp
  | succ m ih =>
    rw [Finset.sum_Ioc_succ_top (Nat.zero_le m)]
    have hm1 : (0 : ℝ) < (m : ℝ) + 1 := by positivity
    have hs : (0 : ℝ) < Real.sqrt ((m : ℝ) + 1) := Real.sqrt_pos.mpr hm1
    have key : 1 / Real.sqrt ((m : ℝ) + 1) ≤
        2 * Real.sqrt ((m : ℝ) + 1) - 2 * Real.sqrt (m : ℝ) := by
      rw [div_le_iff₀ hs]
      nlinarith [sq_nonneg (Real.sqrt ((m : ℝ) + 1) - Real.sqrt (m : ℝ)),
        Real.sqrt_nonneg (m : ℝ), Real.sqrt_nonneg ((m : ℝ) + 1),
        Real.sq_sqrt (Nat.cast_nonneg m), Real.sq_sqrt hm1.le]
    have hcast : ((m + 1 : ℕ) : ℝ) = (m : ℝ) + 1 := by push_cast; ring
    rw [hcast]
    linarith [ih, key]

/-- Explicit form of [eq:cheb1].3. -/
theorem cheb1c_explicit {x : ℝ} (hx : 2 ≤ x) :
    ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n) ≤
      (4 * Real.log 4 + 40) * Real.sqrt x / Real.log x := by
  have hx1 : (1 : ℝ) ≤ x := by linarith
  have hx0 : (0 : ℝ) < x := by linarith
  have hlx : (0 : ℝ) < Real.log x := Real.log_pos (by linarith)
  set R : ℕ := ⌊Real.sqrt x⌋₊ with hR
  have hsqx : Real.sqrt x ≤ x := (Real.sqrt_le_left hx0.le).mpr (by nlinarith)
  have hRle : R ≤ ⌊x⌋₊ := Nat.floor_le_floor hsqx
  have hsplit : (∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n))
      + ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)
      = ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n) :=
    Finset.sum_Ioc_consecutive _ (Nat.zero_le R) hRle
  rw [← hsplit]
  have hpart1 : ∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n) ≤ 2 * Real.sqrt R := by
    refine le_trans (Finset.sum_le_sum fun n hn => ?_) (sum_one_div_sqrt_le R)
    obtain ⟨hn0, _⟩ := Finset.mem_Ioc.mp hn
    rcases Nat.lt_or_ge n 2 with h2 | h2
    · have hn1 : n = 1 := by omega
      subst hn1
      simp [vonMangoldt_apply_one]
    · have hncast : (1 : ℝ) < (n : ℝ) := by exact_mod_cast h2.trans_lt' one_lt_two
      have hlogn : (0 : ℝ) < Real.log n := Real.log_pos hncast
      have hsn : (0 : ℝ) < Real.sqrt n := Real.sqrt_pos.mpr (by positivity)
      calc Λ n / (Real.sqrt n * Real.log n)
          ≤ Real.log n / (Real.sqrt n * Real.log n) := by
            gcongr
            exact vonMangoldt_le_log
        _ = 1 / Real.sqrt n := by field_simp
  have hq : x ^ ((4 : ℝ)⁻¹) * x ^ ((4 : ℝ)⁻¹) = Real.sqrt x := by
    rw [← Real.rpow_add hx0, Real.sqrt_eq_rpow]; norm_num
  have h14nn : (0 : ℝ) ≤ x ^ ((4 : ℝ)⁻¹) := Real.rpow_nonneg hx0.le _
  have hsqR : Real.sqrt R ≤ x ^ ((4 : ℝ)⁻¹) := by
    have h1 : Real.sqrt (R : ℝ) ≤ Real.sqrt (Real.sqrt x) :=
      Real.sqrt_le_sqrt (Nat.floor_le (Real.sqrt_nonneg x))
    have h2 : Real.sqrt (Real.sqrt x) = x ^ ((4 : ℝ)⁻¹) := by
      rw [Real.sqrt_eq_rpow (Real.sqrt x), Real.sqrt_eq_rpow x, ← Real.rpow_mul hx0.le]
      norm_num
    rwa [h2] at h1
  have hlog : Real.log x ≤ 4 * x ^ ((4 : ℝ)⁻¹) := by
    have h4 := Real.log_le_rpow_div hx0.le (by norm_num : (0 : ℝ) < (4 : ℝ)⁻¹)
    rw [div_eq_mul_inv, inv_inv, mul_comm] at h4
    exact h4
  have hS := cheb1b_explicit hx1
  have hsub : ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / Real.sqrt n
      ≤ ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n := by
    refine Finset.sum_le_sum_of_subset_of_nonneg ?_ fun n _ _ => ?_
    · exact Finset.Ioc_subset_Ioc (Nat.zero_le R) le_rfl
    · exact div_nonneg vonMangoldt_nonneg (Real.sqrt_nonneg _)
  have hpart2 : ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)
      ≤ 2 / Real.log x * ((2 * Real.log 4 + 16) * Real.sqrt x) := by
    have step : ∀ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)
        ≤ 2 / Real.log x * (Λ n / Real.sqrt n) := by
      intro n hn
      obtain ⟨hnR, _⟩ := Finset.mem_Ioc.mp hn
      have hsx : Real.sqrt x < (n : ℝ) := by
        have := Nat.lt_floor_add_one (Real.sqrt x)
        have hn1 : (R : ℝ) + 1 ≤ (n : ℝ) := by exact_mod_cast hnR
        rw [hR] at hn1
        linarith
      have hsx0 : (0 : ℝ) < Real.sqrt x := Real.sqrt_pos.mpr hx0
      have hn0 : (0 : ℝ) < (n : ℝ) := lt_trans hsx0 hsx
      have hlogn : Real.log x / 2 ≤ Real.log n := by
        have := Real.log_le_log hsx0 hsx.le
        rwa [Real.log_sqrt hx0.le] at this
      have hlogn0 : (0 : ℝ) < Real.log n := lt_of_lt_of_le (by positivity) hlogn
      have hsn : (0 : ℝ) < Real.sqrt n := Real.sqrt_pos.mpr hn0
      have hΛ : (0 : ℝ) ≤ Λ n := vonMangoldt_nonneg
      have ha : (0 : ℝ) ≤ Λ n / Real.sqrt n := div_nonneg hΛ hsn.le
      have hL2 : (0 : ℝ) < Real.log x / 2 := by positivity
      calc Λ n / (Real.sqrt n * Real.log n)
          = (Λ n / Real.sqrt n) / Real.log n := by rw [div_div]
        _ ≤ (Λ n / Real.sqrt n) / (Real.log x / 2) := by
            rw [div_le_div_iff₀ hlogn0 hL2]
            exact mul_le_mul_of_nonneg_left hlogn ha
        _ = 2 / Real.log x * (Λ n / Real.sqrt n) := by
            rw [div_div_eq_mul_div]
            ring
    calc ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)
        ≤ ∑ n ∈ Ioc R ⌊x⌋₊, 2 / Real.log x * (Λ n / Real.sqrt n) :=
          Finset.sum_le_sum step
      _ = 2 / Real.log x * ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / Real.sqrt n := by
          rw [Finset.mul_sum]
      _ ≤ 2 / Real.log x * ((2 * Real.log 4 + 16) * Real.sqrt x) := by
          have h2l : (0 : ℝ) ≤ 2 / Real.log x := by positivity
          exact mul_le_mul_of_nonneg_left (le_trans hsub hS) h2l
  rw [le_div_iff₀ hlx]
  have e2 : 2 / Real.log x * ((2 * Real.log 4 + 16) * Real.sqrt x) * Real.log x
      = 2 * ((2 * Real.log 4 + 16) * Real.sqrt x) := by field_simp
  have hp1log : (∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
      ≤ 8 * Real.sqrt x := by
    have step1 : (∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
        ≤ (2 * Real.sqrt R) * Real.log x :=
      mul_le_mul_of_nonneg_right hpart1 hlx.le
    have step2 : (2 * Real.sqrt R) * Real.log x
        ≤ (2 * x ^ ((4 : ℝ)⁻¹)) * (4 * x ^ ((4 : ℝ)⁻¹)) := by
      nlinarith [Real.sqrt_nonneg (R : ℝ), hsqR, hlog, hlx, h14nn]
    have step3 : (2 * x ^ ((4 : ℝ)⁻¹)) * (4 * x ^ ((4 : ℝ)⁻¹)) = 8 * Real.sqrt x := by
      rw [← hq]; ring
    linarith
  have hp2log : (∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
      ≤ 2 * ((2 * Real.log 4 + 16) * Real.sqrt x) := by
    calc (∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
        ≤ 2 / Real.log x * ((2 * Real.log 4 + 16) * Real.sqrt x) * Real.log x :=
          mul_le_mul_of_nonneg_right hpart2 hlx.le
      _ = 2 * ((2 * Real.log 4 + 16) * Real.sqrt x) := e2
  have hfin : (∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n)
      + ∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
      = (∑ n ∈ Ioc 0 R, Λ n / (Real.sqrt n * Real.log n)) * Real.log x
        + (∑ n ∈ Ioc R ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)) * Real.log x := by ring
  rw [hfin]
  nlinarith [hp1log, hp2log]

/-- Existential ≪ form of cheb1c. -/
theorem cheb1c_bound :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x →
      ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n) ≤
        C * Real.sqrt x / Real.log x :=
  ⟨4 * Real.log 4 + 40, fun _ hx => cheb1c_explicit hx⟩

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
