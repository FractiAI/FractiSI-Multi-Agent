/-
FractiSI invent — paper-guided lemmas from arXiv:2608.13637 (public outline).
NO import of Anthropic Zeta23. Challenge-only Mathlib invent.
-/
import Mathlib

open scoped BigOperators
open Finset Matrix

noncomputable section

/-- Remark 3.3 scalar inequalities used in rank–trace equality cases. -/
theorem rank_trace_scalar_cases (x : ℝ) :
    (x - 1) ^ 2 ≥ 0 ∧ x ^ 2 ≥ 0 ∧ (x - 2) ^ 2 ≥ 0 := by
  exact ⟨sq_nonneg _, sq_nonneg _, sq_nonneg _⟩

/-- Pointwise: for p ≥ 0, 1_{p>0} ≥ 2p − p². -/
lemma indicator_pos_ge_two_sub_sq {p : ℝ} (hp : 0 ≤ p) :
    (if 0 < p then (1 : ℝ) else 0) ≥ 2 * p - p ^ 2 := by
  by_cases h : 0 < p
  · simp only [h, ↓reduceIte]
    nlinarith [sq_nonneg (p - 1)]
  · have hp0 : p = 0 := le_antisymm (le_of_not_gt h) hp
    simp [hp0]

/-- Pointwise rank–trace diagonal cell (p,q ≥ 0). -/
lemma rank_trace_cell {p q : ℝ} (hp : 0 ≤ p) (hq : 0 ≤ q) :
    (if 0 < p then (1 : ℝ) else 0) ≥
      2 * p + 4 * q - 4 * (if 0 < q then (1 : ℝ) else 0) - (p + q) ^ 2 := by
  have hp' := indicator_pos_ge_two_sub_sq hp
  by_cases hq0 : 0 < q
  · have hreduce :
        2 * p + 4 * q - 4 * (if 0 < q then (1 : ℝ) else 0) - (p + q) ^ 2
          ≤ 2 * p - p ^ 2 := by
      simp only [hq0, ↓reduceIte]
      nlinarith [sq_nonneg (q - 2), mul_nonneg hp (le_of_lt hq0),
        sq_nonneg p, sq_nonneg q, mul_nonneg hp hq]
    exact le_trans hreduce hp'
  · have hqz : q = 0 := le_antisymm (le_of_not_gt hq0) hq
    simpa [hqz] using hp'

/-- Lemma 3.2 scalar/diagonal form (finite real compression of rank–trace). -/
theorem rank_trace_inequality_real_diag
    (d : ℕ) (p q : Fin d → ℝ)
    (hp : ∀ i, 0 ≤ p i) (hq : ∀ i, 0 ≤ q i) :
    ((univ.filter (fun i : Fin d => 0 < p i)).card : ℝ) ≥
      2 * ∑ i, p i + 4 * ∑ i, q i
        - 4 * ((univ.filter (fun i : Fin d => 0 < q i)).card : ℝ)
        - ∑ i, (p i + q i) ^ 2 := by
  classical
  set Ip : Fin d → ℝ := fun i => if 0 < p i then (1 : ℝ) else 0
  set Iq : Fin d → ℝ := fun i => if 0 < q i then (1 : ℝ) else 0
  have hpt : ∀ i ∈ (univ : Finset (Fin d)), Ip i ≥ 2 * p i + 4 * q i - 4 * Iq i - (p i + q i) ^ 2 :=
    fun i _ => by
      change (if 0 < p i then (1 : ℝ) else 0) ≥ _
      simpa [Iq] using rank_trace_cell (hp i) (hq i)
  have hsum : ∑ i, (2 * p i + 4 * q i - 4 * Iq i - (p i + q i) ^ 2) ≤ ∑ i, Ip i :=
    sum_le_sum hpt
  have hpcard : ∑ i, Ip i = ((univ.filter (fun i : Fin d => 0 < p i)).card : ℝ) := by
    simp [Ip, sum_boole]
  have hqcard : ∑ i, Iq i = ((univ.filter (fun i : Fin d => 0 < q i)).card : ℝ) := by
    simp [Iq, sum_boole]
  have hexpand :
      ∑ i, (2 * p i + 4 * q i - 4 * Iq i - (p i + q i) ^ 2) =
        2 * ∑ i, p i + 4 * ∑ i, q i - 4 * ∑ i, Iq i - ∑ i, (p i + q i) ^ 2 := by
    have e1 : ∑ i, (2 * p i + 4 * q i - 4 * Iq i - (p i + q i) ^ 2) =
        ∑ i, 2 * p i + ∑ i, 4 * q i - ∑ i, 4 * Iq i - ∑ i, (p i + q i) ^ 2 := by
      simp [sum_add_distrib, sum_sub_distrib]
    have e2 : ∑ i, (2 : ℝ) * p i = 2 * ∑ i, p i := by rw [← mul_sum]
    have e3 : ∑ i, (4 : ℝ) * q i = 4 * ∑ i, q i := by rw [← mul_sum]
    have e4 : ∑ i, (4 : ℝ) * Iq i = 4 * ∑ i, Iq i := by rw [← mul_sum]
    rw [e1, e2, e3, e4]
  calc
    ((univ.filter (fun i : Fin d => 0 < p i)).card : ℝ) = ∑ i, Ip i := hpcard.symm
    _ ≥ ∑ i, (2 * p i + 4 * q i - 4 * Iq i - (p i + q i) ^ 2) := hsum
    _ = 2 * ∑ i, p i + 4 * ∑ i, q i - 4 * ∑ i, Iq i - ∑ i, (p i + q i) ^ 2 := hexpand
    _ = 2 * ∑ i, p i + 4 * ∑ i, q i
          - 4 * ((univ.filter (fun i : Fin d => 0 < q i)).card : ℝ)
          - ∑ i, (p i + q i) ^ 2 := by rw [hqcard]

/-- Diagonal-matrix packaging of the real rank–trace form (Lemma 3.2 diagonal case). -/
theorem rank_trace_diagonal_matrices
    {d : ℕ} (p q : Fin d → ℝ)
    (hp : ∀ i, 0 ≤ p i) (hq : ∀ i, 0 ≤ q i) :
    ((univ.filter (fun i : Fin d => 0 < p i)).card : ℝ) ≥
      2 * (diagonal p).trace + 4 * (diagonal q).trace
        - 4 * ((univ.filter (fun i : Fin d => 0 < q i)).card : ℝ)
        - ∑ i, ((diagonal p + diagonal q) i i) ^ 2 := by
  have htP : (diagonal p).trace = ∑ i, p i := by simp [Matrix.trace_diagonal]
  have htQ : (diagonal q).trace = ∑ i, q i := by simp [Matrix.trace_diagonal]
  have hii : ∀ i, (diagonal p + diagonal q) i i = p i + q i := by
    intro i
    simp [diagonal]
  simp_rw [htP, htQ, hii]
  exact rank_trace_inequality_real_diag d p q hp hq

/-- Indicator-window constant R(ψ₀) = 4/3 (paper Lemma 5.6 / §1). -/
def R_indicator : ℝ := (4 : ℝ) / 3

theorem window_constant_indicator : R_indicator = (4 : ℝ) / 3 := rfl

/-- At the indicator window, 2 − R = 2/3. -/
theorem two_minus_indicator_window : (2 : ℝ) - R_indicator = (2 : ℝ) / 3 := by
  simp [R_indicator]
  ring

/-- Assembly arithmetic: R ≤ 4/3 ⇒ 2 − R ≥ 2/3 (feeds Theorem A constant). -/
theorem thmA_assembly_two_thirds {R : ℝ} (hR : R ≤ (4 : ℝ) / 3) :
    (2 : ℝ) - R ≥ (2 : ℝ) / 3 := by
  linarith

/-- Theorem A arithmetic chain (ε-free skeleton):
    if Ns ≥ (2 - R) * N and R ≤ 4/3 then Ns ≥ (2/3) * N. -/
theorem thmA_chain_two_thirds
    {N R Ns : ℝ} (hN : 0 ≤ N) (hR : R ≤ (4 : ℝ) / 3)
    (h : Ns ≥ (2 - R) * N) :
    Ns ≥ (2 : ℝ) / 3 * N := by
  have hcoef : (2 : ℝ) - R ≥ (2 : ℝ) / 3 := thmA_assembly_two_thirds hR
  have : (2 - R) * N ≥ ((2 : ℝ) / 3) * N :=
    mul_le_mul_of_nonneg_right hcoef hN
  exact le_trans this h

/-- Distinct-count coefficient: R ≤ 4/3 ⇒ (3 − R)/2 ≥ 5/6. -/
theorem thmC_assembly_five_sixths {R : ℝ} (hR : R ≤ (4 : ℝ) / 3) :
    ((3 : ℝ) - R) / 2 ≥ (5 : ℝ) / 6 := by
  linarith

/-- Theorem C arithmetic chain skeleton. -/
theorem thmC_chain_five_sixths
    {N R Nd : ℝ} (hN : 0 ≤ N) (hR : R ≤ (4 : ℝ) / 3)
    (h : Nd ≥ ((3 - R) / 2) * N) :
    Nd ≥ (5 : ℝ) / 6 * N := by
  have hcoef := thmC_assembly_five_sixths hR
  have : ((3 - R) / 2) * N ≥ ((5 : ℝ) / 6) * N :=
    mul_le_mul_of_nonneg_right hcoef hN
  exact le_trans this h

/-- Scalar form of m² ≥ 2m − 1 (paper: matrix form of this identity). -/
theorem multiplicity_quadratic_bound (m : ℝ) :
    m ^ 2 ≥ 2 * m - 1 := by
  nlinarith [sq_nonneg (m - 1)]

/-- Algebraic identity behind the flat-charge recovery m² ≥ 3m − 2. -/
theorem multiplicity_flat_charge_identity (m : ℝ) :
    m ^ 2 - (3 * m - 2) = (m - 1) * (m - 2) := by
  ring

/-- Indicator window specializes Theorem A chain to the 2/3 constant. -/
theorem thmA_indicator_specialization
    {N Ns : ℝ} (hN : 0 ≤ N) (h : Ns ≥ (2 - R_indicator) * N) :
    Ns ≥ (2 : ℝ) / 3 * N := by
  have hR : R_indicator ≤ (4 : ℝ) / 3 := by simp [R_indicator]
  exact thmA_chain_two_thirds hN hR h

/-! ## Layer: paper §6 asymptotic ε-forms (H/F · o(N) → ε · λ→1⁻)

Rhyming Templates: each lemma is a selective delta on the assembly/arithmetic partners above.
Challenge-only Mathlib — no sealed Zeta23. -/

open Filter Asymptotics Topology

/-- H(λ) := 2 − 1/λ − λ/3 [eq:Fdef]; H(1) = 2/3. -/
def Hfun (x : ℝ) : ℝ := 2 - 1 / x - x / 3

/-- F(λ) := λ / (1 + λ²/3) [eq:Fdef]; F(1) = 3/4. -/
def Ffun (x : ℝ) : ℝ := x / (1 + x ^ 2 / 3)

theorem Hfun_one : Hfun 1 = (2 : ℝ) / 3 := by norm_num [Hfun]

theorem Ffun_one : Ffun 1 = (3 : ℝ) / 4 := by norm_num [Ffun]

/-- Lipschitz for F on [0,1]: F(y) − F(x) ≤ y − x when 0 ≤ x ≤ y ≤ 1. -/
lemma Ffun_sub_le (x y : ℝ) (hx : 0 ≤ x) (hxy : x ≤ y) (_hy : y ≤ 1) :
    Ffun y - Ffun x ≤ y - x := by
  simp only [Ffun]
  rw [div_sub_div _ _ (by positivity) (by positivity), div_le_iff₀ (by positivity)]
  nlinarith [mul_nonneg hx (sub_nonneg.2 hxy), mul_nonneg (mul_nonneg hx hx) (sub_nonneg.2 hxy),
    sq_nonneg x, sq_nonneg y, mul_nonneg hx (hx.trans hxy),
    mul_le_mul hxy hxy hx (hx.trans hxy)]

/-- Quantitative near-1 bound: H(λ) ≥ 2/3 − (5/3)(1 − λ) on [1/2, 1]. -/
lemma Hfun_ge_near_one (lam : ℝ) (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam ≤ 1) :
    (2 : ℝ) / 3 - (5 : ℝ) / 3 * (1 - lam) ≤ Hfun lam := by
  simp only [Hfun]
  have hlam : 0 < lam := by linarith
  have : (1 : ℝ) / lam ≤ 1 + 2 * (1 - lam) := by
    rw [div_le_iff₀ hlam]
    nlinarith
  linarith

/-- Near-1 bound for F: F(λ) ≥ 3/4 − (1 − λ) on [0, 1]. -/
lemma Ffun_ge_near_one (lam : ℝ) (h1 : 0 ≤ lam) (h2 : lam ≤ 1) :
    (3 : ℝ) / 4 - (1 - lam) ≤ Ffun lam := by
  have := Ffun_sub_le lam 1 h1 h2 le_rfl
  rw [Ffun_one] at this
  linarith

/-- E2 rhyme: o(N) error ⇒ ε-form (paper §6). Template: linear rearrange of |err| ≤ ε·N. -/
theorem eps_form_of_isLittleO {H₀ : ℝ} {N lower err : ℝ → ℝ}
    (hmain : ∀ᶠ T in atTop, H₀ * N T - err T ≤ lower T)
    (hN : ∀ᶠ T in atTop, 0 ≤ N T) (herr : err =o[atTop] N) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (H₀ - ε) * N T ≤ lower T := by
  intro ε hε
  have h := (herr.def hε).and (hmain.and hN)
  obtain ⟨T₀, hT₀⟩ := Filter.eventually_atTop.mp h
  refine ⟨T₀, fun T hT => ?_⟩
  obtain ⟨h1, h2, h3⟩ := hT₀ T hT
  rw [Real.norm_eq_abs, Real.norm_eq_abs, abs_of_nonneg h3] at h1
  have : err T ≤ ε * N T := (le_abs_self _).trans h1
  linarith

/-- A point of [1/2, 1) within δ of 1. -/
lemma exists_lam_near_one {δ : ℝ} (hδ : 0 < δ) :
    ∃ lam : ℝ, (1 : ℝ) / 2 ≤ lam ∧ lam < 1 ∧ 1 - lam ≤ δ :=
  ⟨max ((1 : ℝ) / 2) (1 - δ), le_max_left _ _,
    max_lt (by norm_num) (sub_lt_self _ hδ), by
      have := le_max_right ((1 : ℝ) / 2) (1 - δ)
      linarith⟩

/-- λ→1⁻ packaging: if ε-forms hold with c(λ) on [1/2,1) and C is approached from below, get C. -/
theorem eps_form_sup_half {c : ℝ → ℝ} {C : ℝ}
    (hc : ∀ η > (0 : ℝ), ∃ lam : ℝ, (1 : ℝ) / 2 ≤ lam ∧ lam < 1 ∧ C - η ≤ c lam)
    {N lower : ℝ → ℝ} (hN : ∀ T, 0 ≤ N T)
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (c lam - ε) * N T ≤ lower T) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (C - ε) * N T ≤ lower T := by
  intro ε hε
  obtain ⟨lam, h0, h1, h2⟩ := hc (ε / 2) (by linarith)
  obtain ⟨T₀, hT₀⟩ := h lam h0 h1 (ε / 2) (by linarith)
  exact ⟨T₀, fun T hT =>
    (mul_le_mul_of_nonneg_right (by linarith) (hN T)).trans (hT₀ T hT)⟩

/-- E3: λ→1⁻ for H → constant 2/3 (Thm A ε-form). -/
theorem eps_form_twoThirds {N lower : ℝ → ℝ} (hN : ∀ T, 0 ≤ N T)
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (Hfun lam - ε) * N T ≤ lower T) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, ((2 : ℝ) / 3 - ε) * N T ≤ lower T := by
  exact eps_form_sup_half
    (fun η hη => by
      obtain ⟨lam, h1, h2, h3⟩ := exists_lam_near_one (show 0 < 3 * η / 5 by linarith)
      exact ⟨lam, h1, h2, by linarith [Hfun_ge_near_one lam h1 h2.le]⟩)
    hN h

/-- E3 for F → constant 3/4 (Thm C shape). -/
theorem eps_form_threeQuarters {N lower : ℝ → ℝ} (hN : ∀ T, 0 ≤ N T)
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (Ffun lam - ε) * N T ≤ lower T) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, ((3 : ℝ) / 4 - ε) * N T ≤ lower T := by
  exact eps_form_sup_half
    (fun η hη => by
      obtain ⟨lam, h1, h2, h3⟩ := exists_lam_near_one hη
      exact ⟨lam, h1, h2, by linarith [Ffun_ge_near_one lam (by linarith) h2.le]⟩)
    hN h

/-- E3 for 2F−1 → constant 1/2 (Thm B shape). -/
theorem eps_form_half {N lower : ℝ → ℝ} (hN : ∀ T, 0 ≤ N T)
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (2 * Ffun lam - 1 - ε) * N T ≤ lower T) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, ((1 : ℝ) / 2 - ε) * N T ≤ lower T := by
  exact eps_form_sup_half (c := fun lam => 2 * Ffun lam - 1)
    (fun η hη => by
      obtain ⟨lam, h1, h2, h3⟩ := exists_lam_near_one (half_pos hη)
      exact ⟨lam, h1, h2, by linarith [Ffun_ge_near_one lam (by linarith) h2.le]⟩)
    hN h

end
