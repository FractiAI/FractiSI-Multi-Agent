/-
FractiSI invent — paper-guided lemmas from arXiv:2608.13637 (public outline).
NO import of Anthropic Zeta23. Challenge-only Mathlib invent.
-/
import Mathlib

open scoped BigOperators
open Finset

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
  -- Work entirely with indicator sums, then rewrite to cards.
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

/-- Assembly arithmetic: R ≤ 4/3 ⇒ 2 − R ≥ 2/3 (feeds Theorem A constant). -/
theorem thmA_assembly_two_thirds {R : ℝ} (hR : R ≤ (4 : ℝ) / 3) :
    (2 : ℝ) - R ≥ (2 : ℝ) / 3 := by
  linarith

end
