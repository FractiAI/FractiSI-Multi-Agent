/-
FractiSI invent — traces / block residual / moment / spectral scaffolding (Challenge-only).
NO import of Anthropic Zeta23.

Closed here from Mathlib + InventMainEstimate / InventAnalytic / InventMath:
  · residual nonnegativity and coefficient identities (c(λ) ↔ Hfun)
  · packaging InventTracesAt from witnesses / N0star_lower_explicit / ideal traces
  · diagonal spectral-trace + Frobenius-moment majorants (finite compressions)
  · residual family definitions feeding err =o[N]
  · InventTracesLike composition from eventually families
  · classical-input assembly: InventTracesLike + residual little-o + InventRvMLike
    → InventClassicalMainInputs (reduction only)

Classical target (comments only — not claimed):
  InventTracesLike λ : eventually InventTracesAt λ (N0star T 2T) (Ncount T 2T)
GAP: needs Weil EF / prime-side traces (trGh ≈ N, frGh ≪ c(λ)·N) beyond Mathlib.
Do **not** treat `InventTracesLike` as discharged: analytic trGh/frGh remain open.
-/
import InventMainEstimate
import InventAnalytic
import InventMath

open Real Filter Asymptotics Topology
open scoped BigOperators
open Finset Matrix

noncomputable section

/-! ## Coefficient identities (c(λ) = 1/λ + λ/3 ↔ Hfun) -/

/-- Spectral coefficient appearing in `InventTracesAt` / `N0star_lower_H`. -/
def TraceCoeff (lam : ℝ) : ℝ := 1 / lam + lam / 3

theorem TraceCoeff_eq (lam : ℝ) : TraceCoeff lam = 1 / lam + lam / 3 := rfl

/-- Algebraic partner of Hfun: H(λ) = 2 − c(λ). -/
theorem Hfun_eq_two_sub_TraceCoeff (lam : ℝ) :
    Hfun lam = 2 - TraceCoeff lam := by
  simp only [Hfun, TraceCoeff]
  ring

theorem TraceCoeff_eq_two_sub_Hfun (lam : ℝ) :
    TraceCoeff lam = 2 - Hfun lam := by
  linarith [Hfun_eq_two_sub_TraceCoeff lam]

/-- At λ = 1: c(1) = 4/3 (matches R_indicator). -/
theorem TraceCoeff_one : TraceCoeff 1 = (4 : ℝ) / 3 := by
  simp only [TraceCoeff]
  norm_num

theorem TraceCoeff_one_eq_R_indicator : TraceCoeff 1 = R_indicator := by
  rw [TraceCoeff_one, R_indicator]

/-- On the invent λ-window [1/2, 1), c(λ) is nonnegative when λ > 0. -/
theorem TraceCoeff_nonneg {lam : ℝ} (hlam : 0 < lam) : 0 ≤ TraceCoeff lam := by
  simp only [TraceCoeff]
  positivity

/-! ## Residual algebra (feeds N0star_lower_H error term) -/

/-- Explicit residual of `N0star_lower_H` at coefficient `c`. -/
def TraceResidual (c N B R₁ R₂ NII : ℝ) : ℝ :=
  4 * R₁ + R₂ + 3 * NII + B * (4 + 2 * Real.sqrt (c * N + R₂) + B)

/-- Nonnegative residual bound used in N0star_lower_H. -/
theorem residual_nonneg_of_parts {B R₁ R₂ NII N : ℝ}
    (hB : 0 ≤ B) (hR₁ : 0 ≤ R₁) (hR₂ : 0 ≤ R₂) (hNII : 0 ≤ NII)
    (_hN : 0 ≤ N) :
    0 ≤
      4 * R₁ + R₂ + 3 * NII +
        B * (4 + 2 * Real.sqrt ((1 + 1 / 3) * N + R₂) + B) := by
  have hsq : 0 ≤ Real.sqrt ((1 + 1 / 3) * N + R₂) := Real.sqrt_nonneg _
  positivity

theorem TraceResidual_nonneg {c N B R₁ R₂ NII : ℝ}
    (_hcN : 0 ≤ c * N + R₂) (hB : 0 ≤ B) (hR₁ : 0 ≤ R₁) (hR₂ : 0 ≤ R₂)
    (hNII : 0 ≤ NII) :
    0 ≤ TraceResidual c N B R₁ R₂ NII := by
  simp only [TraceResidual]
  have hsq : 0 ≤ Real.sqrt (c * N + R₂) := Real.sqrt_nonneg _
  positivity

/-- Flat residual when B = R₁ = R₂ = NII = 0. -/
theorem TraceResidual_zero_flat (c N : ℝ) :
    TraceResidual c N 0 0 0 0 = 0 := by
  simp [TraceResidual]

/-- Residual is monotone in each of R₁, R₂, NII when B ≥ 0 and the sqrt argument grows. -/
theorem TraceResidual_mono_R₁ {c N B R₁ R₁' R₂ NII : ℝ}
    (_hB : 0 ≤ B) (h : R₁ ≤ R₁') :
    TraceResidual c N B R₁ R₂ NII ≤ TraceResidual c N B R₁' R₂ NII := by
  simp only [TraceResidual]
  nlinarith

theorem TraceResidual_mono_NII {c N B R₁ R₂ NII NII' : ℝ}
    (h : NII ≤ NII') :
    TraceResidual c N B R₁ R₂ NII ≤ TraceResidual c N B R₁ R₂ NII' := by
  simp only [TraceResidual]
  nlinarith

/-! ## InventTracesAt packaging -/

/-- Package InventTracesAt from explicit numeric witnesses. -/
theorem InventTracesAt.of_witnesses
    (lam N0 N trGh frGh B R₁ R₂ NII : ℝ)
    (hB : 0 ≤ B)
    (h0 : 4 * trGh - frGh - 2 * N - 3 * NII - B * (4 + 2 * Real.sqrt frGh + B) ≤ N0)
    (htr : |trGh - N| ≤ R₁)
    (hfr : frGh ≤ (1 / lam + lam / 3) * N + R₂) :
    InventTracesAt lam N0 N :=
  ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr⟩

/-- Same packaging with `TraceCoeff`. -/
theorem InventTracesAt.of_witnesses_coeff
    (lam N0 N trGh frGh B R₁ R₂ NII : ℝ)
    (hB : 0 ≤ B)
    (h0 : 4 * trGh - frGh - 2 * N - 3 * NII - B * (4 + 2 * Real.sqrt frGh + B) ≤ N0)
    (htr : |trGh - N| ≤ R₁)
    (hfr : frGh ≤ TraceCoeff lam * N + R₂) :
    InventTracesAt lam N0 N := by
  refine InventTracesAt.of_witnesses lam N0 N trGh frGh B R₁ R₂ NII hB h0 htr ?_
  simpa [TraceCoeff] using hfr

/-- Package from the explicit rank–trace / perturbation rearrangement. -/
theorem InventTracesAt.of_N0star_lower_explicit
    {N0 s12 : ℕ} {N NII trGh frGh trAh frAh B R₁ R₂ lam : ℝ}
    (hB : 0 ≤ B)
    (hcount : (s12 : ℝ) ≤ (N0 : ℝ) + NII)
    (hcore : 4 * trAh - 2 * (N + NII) - frAh ≤ (s12 : ℝ))
    (hpert : 4 * trGh - frGh - B * (4 + 2 * Real.sqrt frGh + B) ≤ 4 * trAh - frAh)
    (htr : |trGh - N| ≤ R₁)
    (hfr : frGh ≤ TraceCoeff lam * N + R₂) :
    InventTracesAt lam (N0 : ℝ) N := by
  have h0 :=
    N0star_lower_explicit (N0star := N0) (s12 := s12) (N := N) (NII := NII)
      (trGh := trGh) (frGh := frGh) (trAh := trAh) (frAh := frAh) (B := B)
      hcount hcore hpert
  exact InventTracesAt.of_witnesses_coeff lam (N0 : ℝ) N trGh frGh B R₁ R₂ NII
    hB h0 htr hfr

/-- Ideal traces: exact match trGh = N, frGh ≤ c(λ)·N, no perturbation. -/
theorem InventTracesAt.of_ideal
    {lam N0 N frGh : ℝ}
    (h0 : 4 * N - frGh - 2 * N ≤ N0)
    (hfr : frGh ≤ TraceCoeff lam * N) :
    InventTracesAt lam N0 N := by
  refine InventTracesAt.of_witnesses_coeff lam N0 N N frGh 0 0 0 0
    le_rfl ?_ ?_ ?_
  · simpa using h0
  · simp
  · linarith

/-- Hfun packaging exists whenever InventTracesAt holds. -/
theorem Hfun_pack_of_InventTracesAt {lam N0 N : ℝ} (h : InventTracesAt lam N0 N) :
    ∃ err : ℝ, Hfun lam * N - err ≤ N0 :=
  exists_Hfun_pack_of_tracesAt h

/-- Explicit residual witness from InventTracesAt via N0star_lower_H. -/
theorem Hfun_pack_residual_of_InventTracesAt {lam N0 N : ℝ}
    (h : InventTracesAt lam N0 N) :
    ∃ B R₁ R₂ NII : ℝ, 0 ≤ B ∧
      Hfun lam * N - TraceResidual (TraceCoeff lam) N B R₁ R₂ NII ≤ N0 := by
  obtain ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr⟩ := h
  refine ⟨B, R₁, R₂, NII, hB, ?_⟩
  have hH := N0star_lower_H (lam₁ := lam) hB h0 htr hfr
  simpa [TraceResidual, TraceCoeff] using hH

/-! ## Diagonal spectral-trace / Frobenius-moment scaffolding

Finite compressions of the paper's spectral side: `tr = ∑ p`, `fr = ∑ (p+q)²`.
These feed the shape of `trGh` / `frGh` once the analytic operator invent closes. -/

/-- Diagonal spectral trace = sum of entries. -/
theorem diagonal_trace_eq_sum {d : ℕ} (p : Fin d → ℝ) :
    (diagonal p).trace = ∑ i, p i := by
  simp [Matrix.trace_diagonal]

/-- Frobenius-type diagonal moment ∑ (p i)². -/
def diagMoment (d : ℕ) (p : Fin d → ℝ) : ℝ := ∑ i, (p i) ^ 2

theorem diagMoment_nonneg {d : ℕ} (p : Fin d → ℝ) : 0 ≤ diagMoment d p :=
  Finset.sum_nonneg fun _ _ => sq_nonneg _

/-- Cauchy–Schwarz on the diagonal: (∑ p)² ≤ d · ∑ p². -/
theorem diag_trace_sq_le_card_mul_moment {d : ℕ} (p : Fin d → ℝ) :
    ((diagonal p).trace) ^ 2 ≤ (d : ℝ) * diagMoment d p := by
  have htr : (diagonal p).trace = ∑ i, p i := diagonal_trace_eq_sum p
  rw [htr]
  -- (∑ p_i)² ≤ (∑ 1²) (∑ p_i²) = d · ∑ p_i²
  have h := Finset.sum_mul_sq_le_sq_mul_sq (univ : Finset (Fin d))
      (fun _ => (1 : ℝ)) p
  simpa [diagMoment, sq, Finset.card_univ, Fintype.card_fin, one_pow, mul_one,
    Finset.sum_const, nsmul_eq_mul] using h

/-- When p,q ≥ 0, ∑ p² ≤ ∑ (p+q)². -/
theorem diagMoment_le_combined {d : ℕ} (p q : Fin d → ℝ)
    (hp : ∀ i, 0 ≤ p i) (hq : ∀ i, 0 ≤ q i) :
    diagMoment d p ≤ ∑ i, (p i + q i) ^ 2 := by
  refine Finset.sum_le_sum fun i _ => ?_
  have : (p i) ^ 2 ≤ (p i + q i) ^ 2 := by
    nlinarith [mul_nonneg (hp i) (hq i), sq_nonneg (q i)]
  exact this

theorem diagMoment_q_le_combined {d : ℕ} (p q : Fin d → ℝ)
    (hp : ∀ i, 0 ≤ p i) (hq : ∀ i, 0 ≤ q i) :
    diagMoment d q ≤ ∑ i, (p i + q i) ^ 2 := by
  refine Finset.sum_le_sum fun i _ => ?_
  have : (q i) ^ 2 ≤ (p i + q i) ^ 2 := by
    nlinarith [mul_nonneg (hp i) (hq i), sq_nonneg (p i)]
  exact this

/-- Expand the combined diagonal moment. -/
theorem combined_moment_expand {d : ℕ} (p q : Fin d → ℝ) :
    ∑ i, (p i + q i) ^ 2 =
      diagMoment d p + diagMoment d q + 2 * ∑ i, p i * q i := by
  simp only [diagMoment, pow_two]
  calc
    ∑ i, (p i + q i) * (p i + q i)
        = ∑ i, (p i * p i + q i * q i + 2 * (p i * q i)) := by
          refine Finset.sum_congr rfl fun i _ => by ring
      _ = ∑ i, p i * p i + ∑ i, q i * q i + ∑ i, 2 * (p i * q i) := by
          simp [Finset.sum_add_distrib]
      _ = ∑ i, p i * p i + ∑ i, q i * q i + 2 * ∑ i, p i * q i := by
          simp [← Finset.mul_sum]

/-- Rank–trace diagonal cell rearranges to a spectral lower bound shape
`4·tr_q-ish` absorbed into the paper's 4 tr − fr skeleton (awareness bridge). -/
theorem spectral_core_of_rank_trace_diag
    {d : ℕ} (p q : Fin d → ℝ)
    (hp : ∀ i, 0 ≤ p i) (hq : ∀ i, 0 ≤ q i) :
    ((univ.filter (fun i : Fin d => 0 < p i)).card : ℝ) +
        4 * ((univ.filter (fun i : Fin d => 0 < q i)).card : ℝ) ≥
      2 * (diagonal p).trace + 4 * (diagonal q).trace -
        ∑ i, (p i + q i) ^ 2 := by
  have h := rank_trace_inequality_real_diag d p q hp hq
  have htP : (diagonal p).trace = ∑ i, p i := diagonal_trace_eq_sum p
  have htQ : (diagonal q).trace = ∑ i, q i := diagonal_trace_eq_sum q
  linarith [h, htP, htQ]

/-! ## Residual families → InventErrorLittleO (reduction) -/

/-- Pointwise residual evaluator along a family of witnesses. -/
def residualFamily (c : ℝ → ℝ) (N B R₁ R₂ NII : ℝ → ℝ) : ℝ → ℝ :=
  fun T => TraceResidual (c T) (N T) (B T) (R₁ T) (R₂ T) (NII T)

/-- Flat residual family with vanishing B,R₁,R₂,NII is identically 0 (=o anything). -/
theorem residualFamily_zero_isLittleO (c N : ℝ → ℝ) :
    residualFamily c N (fun _ => 0) (fun _ => 0) (fun _ => 0) (fun _ => 0)
      =o[atTop] N := by
  have h0 : residualFamily c N (fun _ => 0) (fun _ => 0) (fun _ => 0) (fun _ => 0) =
      fun _ => (0 : ℝ) := by
    funext T
    simp [residualFamily, TraceResidual]
  rw [h0]
  exact isLittleO_zero _ _

/-- Re-export: §6 residual is o(N) under the InventMainEstimate hypotheses. -/
theorem residualFamily_isLittleO {N R₁ R₂ NII B c : ℝ → ℝ} {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hc : ∀ᶠ T in atTop, 0 ≤ c T ∧ c T ≤ K) :
    residualFamily c N B R₁ R₂ NII =o[atTop] N := by
  change (fun T =>
      4 * R₁ T + R₂ T + 3 * NII T +
        B T * (4 + 2 * Real.sqrt (c T * N T + R₂ T) + B T)) =o[atTop] N
  exact err_isLittleO_of_zero_delta (N := N) (R₁ := R₁) (R₂ := R₂) (NII := NII)
    (B := B) (c := c) (K := K) hN hR₁ hR₂ hNII hB hc

/-! ## InventTracesLike composition (eventual families) -/

/-- Build `InventTracesLike` from an eventually-present witness family. -/
theorem InventTracesLike.of_eventually_family {lam : ℝ}
    (h : ∀ᶠ T in atTop,
      ∃ trGh frGh B R₁ R₂ NII : ℝ,
        0 ≤ B ∧
          4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII -
              B * (4 + 2 * Real.sqrt frGh + B) ≤ (N0star T (2 * T) : ℝ) ∧
          |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁ ∧
          frGh ≤ TraceCoeff lam * (Ncount T (2 * T) : ℝ) + R₂) :
    InventTracesLike lam := by
  refine ⟨?_⟩
  filter_upwards [h] with T ht
  obtain ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr⟩ := ht
  exact InventTracesAt.of_witnesses_coeff lam _ _ trGh frGh B R₁ R₂ NII
    hB h0 htr hfr

/-- Constant-in-T exact ideal family on every dyadic window (awareness / reduction).
Requires a uniform exact spectral identity — not claimed from Mathlib alone. -/
theorem InventTracesLike.of_ideal_everywhere {lam : ℝ}
    (h : ∀ T : ℝ,
      4 * (Ncount T (2 * T) : ℝ) - TraceCoeff lam * (Ncount T (2 * T) : ℝ) -
          2 * (Ncount T (2 * T) : ℝ) ≤ (N0star T (2 * T) : ℝ)) :
    InventTracesLike lam := by
  refine InventTracesLike.of_eventually_family ?_
  refine Eventually.of_forall fun T => ?_
  refine ⟨(Ncount T (2 * T) : ℝ), TraceCoeff lam * (Ncount T (2 * T) : ℝ),
    0, 0, 0, 0, le_rfl, ?_, ?_, ?_⟩
  · have := h T
    simp
    linarith
  · simp
  · simp

/-- Hfun packing along an InventTracesLike family. -/
theorem Hfun_pack_eventually_of_InventTracesLike {lam : ℝ}
    (h : InventTracesLike lam) :
    ∀ᶠ T in atTop,
      ∃ err : ℝ,
        Hfun lam * (Ncount T (2 * T) : ℝ) - err ≤ (N0star T (2 * T) : ℝ) := by
  filter_upwards [h.eventually] with T ht
  exact Hfun_pack_of_InventTracesAt ht

/-! ## Classical-input assembly (InventTracesLike + residual little-o + RvM)

Reduction only: once analytic traces discharge `InventTracesLike` and residual
families are o(N), classical inputs package. Does **not** invent Weil/prime side. -/

/-- Package `InventClassicalMainInputs` from RvM + traces + residual little-o family. -/
theorem InventClassicalMainInputs.of_traces_residual
    {lam : ℝ}
    (hrvm : InventRvMLike)
    (htr : InventTracesLike lam)
    (B R₁ R₂ NII : ℝ → ℝ)
    (trGh frGh : ℝ → ℝ)
    (hpack : ∀ᶠ T in atTop,
      0 ≤ B T ∧
        4 * trGh T - frGh T - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII T -
            B T * (4 + 2 * Real.sqrt (frGh T) + B T) ≤ (N0star T (2 * T) : ℝ) ∧
        |trGh T - (Ncount T (2 * T) : ℝ)| ≤ R₁ T ∧
        frGh T ≤ TraceCoeff lam * (Ncount T (2 * T) : ℝ) + R₂ T)
    (herr :
      residualFamily (fun _ => TraceCoeff lam)
          (fun T => (Ncount T (2 * T) : ℝ)) B R₁ R₂ NII =o[atTop]
        fun T => (Ncount T (2 * T) : ℝ)) :
    InventClassicalMainInputs lam := by
  refine ⟨hrvm, htr, ?_⟩
  refine ⟨residualFamily (fun _ => TraceCoeff lam)
      (fun T => (Ncount T (2 * T) : ℝ)) B R₁ R₂ NII, herr, ?_⟩
  filter_upwards [hpack] with T ht
  refine ⟨trGh T, frGh T, B T, R₁ T, R₂ T, NII T, ht.1, ht.2.1, ht.2.2.1, ?_, ?_⟩
  · simpa [TraceCoeff] using ht.2.2.2
  · simp only [residualFamily, TraceResidual, TraceCoeff]

/-- Specialization: vanishing residual family. -/
theorem InventClassicalMainInputs.of_traces_flat_residual
    {lam : ℝ}
    (hrvm : InventRvMLike)
    (htr : InventTracesLike lam)
    (trGh frGh : ℝ → ℝ)
    (hpack : ∀ᶠ T in atTop,
      4 * trGh T - frGh T - 2 * (Ncount T (2 * T) : ℝ) ≤ (N0star T (2 * T) : ℝ) ∧
        trGh T = (Ncount T (2 * T) : ℝ) ∧
        frGh T ≤ TraceCoeff lam * (Ncount T (2 * T) : ℝ)) :
    InventClassicalMainInputs lam := by
  refine InventClassicalMainInputs.of_traces_residual hrvm htr
    (fun _ => 0) (fun _ => 0) (fun _ => 0) (fun _ => 0) trGh frGh ?_ ?_
  · filter_upwards [hpack] with T ht
    refine ⟨le_rfl, ?_, ?_, ?_⟩
    · simpa using ht.1
    · simp [ht.2.1]
    · simpa using ht.2.2
  · exact residualFamily_zero_isLittleO _ _

/-! ## Classical target shape (awareness only — gap named, not sorry'd) -/

/-- Classical traces package on dyadic windows (Weil EF · prime side).

GAP (not closed here): uniform control of `trGh ≈ Ncount` and
`frGh ≤ TraceCoeff λ · Ncount + o(N)` needs the Weil explicit formula /
prime-side moment invent beyond Mathlib. Closed scaffolding above feeds this
once that analytic step invents. -/
def ClassicalTracesPackage (lam : ℝ) : Prop := InventTracesLike lam

/-- Bundle matching classical H-estimate inputs (RvM + traces + residual little-o). -/
structure ClassicalMainEstimateScaffold (lam : ℝ) : Prop where
  rvm : InventRvMLike
  traces : InventTracesLike lam
  residual_o :
    ∃ B R₁ R₂ NII trGh frGh : ℝ → ℝ,
      (∀ᶠ T in atTop,
        0 ≤ B T ∧
          4 * trGh T - frGh T - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII T -
              B T * (4 + 2 * Real.sqrt (frGh T) + B T) ≤
            (N0star T (2 * T) : ℝ) ∧
          |trGh T - (Ncount T (2 * T) : ℝ)| ≤ R₁ T ∧
          frGh T ≤ TraceCoeff lam * (Ncount T (2 * T) : ℝ) + R₂ T) ∧
      residualFamily (fun _ => TraceCoeff lam)
          (fun T => (Ncount T (2 * T) : ℝ)) B R₁ R₂ NII =o[atTop]
        fun T => (Ncount T (2 * T) : ℝ)

/-- Scaffold ⇒ classical main inputs (reduction; not a Weil discharge). -/
theorem InventClassicalMainInputs_of_scaffold {lam : ℝ}
    (h : ClassicalMainEstimateScaffold lam) :
    InventClassicalMainInputs lam := by
  obtain ⟨hrvm, htr, B, R₁, R₂, NII, trGh, frGh, hpack, herr⟩ := h
  exact InventClassicalMainInputs.of_traces_residual hrvm htr B R₁ R₂ NII trGh frGh
    hpack herr

end
