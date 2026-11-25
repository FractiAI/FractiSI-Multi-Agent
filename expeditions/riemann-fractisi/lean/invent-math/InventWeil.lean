/-
FractiSI invent — Weil EF invent surface (Challenge-only Mathlib).
NO import of Anthropic Zeta23.

Closed here (Mathlib-only):
  · TestC2: compactly supported C² test weights on [-L/2, L/2]
  · paperFT / Hfn: paper Fourier convention + [eq:hfbound] decay (C_c²)
  · WeilResidueRates → InventErrorLittleO / herr packaging for
    InventMainEstimate.eps_form_of_classicalInputs (little-o half)

Classical gaps (comments only — not claimed closed):
  GAP: full Weil explicit-formula contour (zero tsum = arch + prime + poles).
  GAP: prime-side traces discharging InventTracesLike / eventual witnesses.
  GAP: Tit86 uniform local count for InventRvMLike.
  GAP: Ncount T (2T) → ∞ from classical RvM (hypothesis on WeilResidueRates).
  GAP: Γ′/Γ Stirling for the archimedean density μ.
Do **not** treat InventClassicalMainInputs as discharged.
Sibling InventTraces owns TraceResidual / classical-input assembly reduction;
sibling InventWeilEF owns FE / digamma / pole / Ncount→∞ contour scaffolding;
this file invents the Weil FT surface and the residue-rate → little-o bridge.
-/
import InventMainEstimate
import Mathlib.Analysis.Fourier.FourierTransform
import Mathlib.MeasureTheory.Integral.IntegralEqImproper
import Mathlib.Analysis.Calculus.Deriv.Support
import Mathlib.Analysis.Calculus.ContDiff.Deriv
import Mathlib.Topology.Homeomorph.Lemmas

open Complex ContDiff MeasureTheory Real Set Filter Topology Asymptotics
open scoped FourierTransform

noncomputable section

/-! ## TestC2 — compactly supported C² test weights -/

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

theorem TestC2.contDiff {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) : ContDiff ℝ 2 f :=
  hf.1

theorem TestC2.tsupport_subset {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) :
    tsupport f ⊆ Icc (-(L / 2)) (L / 2) :=
  hf.2

theorem TestC2.hasCompactSupport {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) :
    HasCompactSupport f :=
  isCompact_Icc.of_isClosed_subset (isClosed_tsupport f) hf.2

theorem TestC2.support_abs {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) {u : ℝ}
    (hu : f u ≠ 0) : |u| ≤ L / 2 :=
  abs_le.mpr (hf.2 (subset_tsupport _ (Function.mem_support.mpr hu)))

theorem TestC2.support_subset_abs {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) :
    ∀ u, f u ≠ 0 → |u| ≤ L / 2 := fun _ hu => hf.support_abs hu

theorem TestC2.integrable {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) : Integrable f :=
  hf.contDiff.continuous.integrable_of_hasCompactSupport hf.hasCompactSupport

/-- Reflection u ↦ −u preserves TestC2 (support interval is symmetric). -/
theorem testC2_comp_neg {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) :
    TestC2 L fun u => f (-u) := by
  refine ⟨hf.contDiff.comp contDiff_neg, ?_⟩
  have hembed : IsClosedEmbedding (fun x : ℝ => -x) :=
    (Homeomorph.neg ℝ).isClosedEmbedding
  have hsupp :
      Function.support (fun v : ℝ => f (-v)) =
        (fun x : ℝ => -x) '' Function.support f := by
    ext x
    constructor
    · intro hx
      refine ⟨-x, ?_, by simp⟩
      simpa [Function.support] using hx
    · rintro ⟨y, hy, rfl⟩
      simpa [Function.support] using hy
  intro u hu
  have : u ∈ (fun x : ℝ => -x) '' tsupport f := by
    rw [tsupport, ← hembed.closure_image_eq, ← hsupp]
    exact hu
  obtain ⟨y, hy, rfl⟩ := this
  have hI := hf.2 hy
  exact ⟨by nlinarith [hI.2], by nlinarith [hI.1]⟩

/-! ## paperFT — paper Fourier convention [subsec:weil]

Paper: ĥ(z) := ∫ f(u) e^{i z u} du. Mathlib `𝓕` uses e^{−2π i v ξ}, so for real τ
`paperFT f τ = 𝓕 f (−τ/(2π))`. -/

/-- Paper Fourier transform: `paperFT f z = ∫ u, f u * exp (I * z * u)`. -/
def paperFT (f : ℝ → ℂ) (z : ℂ) : ℂ :=
  ∫ u : ℝ, f u * Complex.exp (Complex.I * z * (u : ℂ))

theorem paperFT_def (f : ℝ → ℂ) (z : ℂ) :
    paperFT f z = ∫ u : ℝ, f u * cexp (I * z * u) :=
  rfl

/-- Weil weight: H(s) = ĥ((s − 1/2)/i). -/
def Hfn (k : ℝ → ℂ) (s : ℂ) : ℂ :=
  paperFT k ((s - 1 / 2) / I)

theorem Hfn_def (k : ℝ → ℂ) (s : ℂ) :
    Hfn k s = paperFT k ((s - 1 / 2) / I) :=
  rfl

theorem Hfn_zero_add_one (k : ℝ → ℂ) :
    Hfn k 0 + Hfn k 1 = paperFT k (I / 2) + paperFT k (-I / 2) := by
  have h0 : Hfn k 0 = paperFT k (I / 2) := by
    unfold Hfn; congr 1
    rw [div_eq_iff Complex.I_ne_zero, div_mul_eq_mul_div, Complex.I_mul_I]
    norm_num
  have h1 : Hfn k 1 = paperFT k (-I / 2) := by
    unfold Hfn; congr 1
    rw [div_eq_iff Complex.I_ne_zero]
    rw [show (-I / 2) * I = -(I * I) / 2 by ring, Complex.I_mul_I]
    norm_num
  rw [h0, h1]

theorem paperFT_ofReal_eq_fourier (f : ℝ → ℂ) (s : ℝ) :
    paperFT f s = 𝓕 f (-s / (2 * π)) := by
  rw [Real.fourier_real_eq_integral_exp_smul]
  unfold paperFT
  congr 1 with u
  rw [smul_eq_mul, mul_comm (f u)]
  congr 1
  congr 1
  push_cast
  field_simp

theorem fourier_eq_paperFT (f : ℝ → ℂ) (w : ℝ) :
    𝓕 f w = paperFT f (-(2 * π * w)) := by
  have := paperFT_ofReal_eq_fourier f (-(2 * π * w))
  push_cast at this ⊢
  rw [this]
  field_simp

theorem paperFT_comp_neg (k : ℝ → ℂ) (z : ℂ) :
    paperFT (fun u => k (-u)) z = paperFT k (-z) := by
  rw [paperFT_def, paperFT_def]
  refine Eq.trans (integral_congr_ae (Eventually.of_forall fun u => ?_))
    (integral_neg_eq_self (fun v : ℝ => k v * cexp (I * (-z) * v)) volume)
  show k (-u) * cexp (I * z * u) = k (-u) * cexp (I * (-z) * ((-u : ℝ) : ℂ))
  push_cast
  ring_nf

/-! ### [eq:hfbound] decay for C_c² test weights -/

theorem norm_cexp_I_mul (z : ℂ) (u : ℝ) :
    ‖cexp (I * z * u)‖ = Real.exp (-(z.im * u)) := by
  rw [Complex.norm_exp]
  congr 1
  simp [Complex.mul_re, Complex.mul_im]

theorem norm_cexp_I_mul_le {z : ℂ} {u Λ : ℝ} (hu : |u| ≤ Λ) :
    ‖cexp (I * z * u)‖ ≤ Real.exp (|z.im| * Λ) := by
  rw [norm_cexp_I_mul, Real.exp_le_exp]
  calc -(z.im * u) ≤ |z.im * u| := neg_le_abs _
    _ = |z.im| * |u| := abs_mul _ _
    _ ≤ |z.im| * Λ := by gcongr

theorem hasCompactSupport_of_support_subset_abs {E : Type*} [Zero E] {f : ℝ → E} {Λ : ℝ}
    (hsupp : ∀ u, f u ≠ 0 → |u| ≤ Λ) : HasCompactSupport f := by
  refine HasCompactSupport.of_support_subset_isCompact (isCompact_Icc (a := -Λ) (b := Λ)) ?_
  intro u hu
  exact abs_le.mp (hsupp u hu)

theorem tsupport_subset_of_support_subset_abs {E : Type*} [Zero E] {f : ℝ → E} {Λ : ℝ}
    (hsupp : ∀ u, f u ≠ 0 → |u| ≤ Λ) : tsupport f ⊆ Icc (-Λ) Λ :=
  closure_minimal (fun u hu => abs_le.mp (hsupp u hu)) isClosed_Icc

/-- [eq:hfbound], zeroth order: `‖h_f(z)‖ ≤ e^{|Im z| Λ} ‖f‖₁`. -/
theorem norm_paperFT_le {f : ℝ → ℂ} {Λ : ℝ} (hfi : Integrable f)
    (hsupp : ∀ u, f u ≠ 0 → |u| ≤ Λ) (z : ℂ) :
    ‖paperFT f z‖ ≤ Real.exp (|z.im| * Λ) * ∫ u, ‖f u‖ := by
  rw [paperFT_def, ← integral_const_mul]
  refine norm_integral_le_of_norm_le (hfi.norm.const_mul _) (Eventually.of_forall fun u => ?_)
  rw [norm_mul]
  by_cases hu : f u = 0
  · simp [hu]
  · rw [mul_comm]
    gcongr
    exact norm_cexp_I_mul_le (hsupp u hu)

/-- One integration by parts: `(f')^(z) = −i z · f̂(z)` for `f ∈ C_c¹`. -/
theorem paperFT_deriv {f : ℝ → ℂ} (hf : ContDiff ℝ 1 f) (hsupp : HasCompactSupport f)
    (z : ℂ) : paperFT (deriv f) z = -(I * z) * paperFT f z := by
  have hf' : Continuous (deriv f) := hf.continuous_deriv le_rfl
  have hfd : ∀ x, HasDerivAt f (deriv f x) x :=
    fun x => (hf.differentiable (by norm_num) x).hasDerivAt
  have hv : ∀ x : ℝ, HasDerivAt (fun u : ℝ => cexp (I * z * u)) (I * z * cexp (I * z * x)) x := by
    intro x
    have h1 : HasDerivAt (fun u : ℝ => I * z * u) (I * z * 1) x :=
      ((hasDerivAt_id x).ofReal_comp).const_mul (I * z)
    simpa [mul_comm] using h1.cexp
  have hcv : Continuous (fun u : ℝ => cexp (I * z * u)) := by fun_prop
  have hcv' : Continuous (fun u : ℝ => I * z * cexp (I * z * u)) := by fun_prop
  have key :=
    integral_mul_deriv_eq_deriv_mul_of_integrable (u := f)
      (v := fun u : ℝ => cexp (I * z * u)) (u' := deriv f)
      (v' := fun x : ℝ => I * z * cexp (I * z * x))
      (fun x _ => hfd x) (fun x _ => hv x)
      ((hf.continuous.mul hcv').integrable_of_hasCompactSupport hsupp.mul_right)
      ((hf'.mul hcv).integrable_of_hasCompactSupport hsupp.deriv.mul_right)
      ((hf.continuous.mul hcv).integrable_of_hasCompactSupport hsupp.mul_right)
  have : (fun u : ℝ => f u * (I * z * cexp (I * z * u))) =
      fun u => (I * z) * (f u * cexp (I * z * u)) := by
    funext u; ring
  rw [this, integral_const_mul] at key
  have key' : I * z * paperFT f z = -paperFT (deriv f) z := by
    rw [paperFT_def, paperFT_def]; exact key
  linear_combination key'

/-- Two integrations by parts: `(f'')^(z) = −z² · f̂(z)`. -/
theorem paperFT_deriv_deriv {f : ℝ → ℂ} (hf : ContDiff ℝ 2 f) (hsupp : HasCompactSupport f)
    (z : ℂ) : paperFT (deriv (deriv f)) z = -z ^ 2 * paperFT f z := by
  have h1 : ContDiff ℝ 1 (deriv f) := hf.deriv'
  rw [paperFT_deriv h1 hsupp.deriv, paperFT_deriv (hf.of_le (by norm_num)) hsupp]
  ring_nf
  rw [I_sq]
  ring

/-- [eq:hfbound], second order: `‖h_f(z)‖ · ‖z‖² ≤ e^{|Im z| Λ} ‖f''‖₁`. -/
theorem norm_paperFT_mul_sq_le {f : ℝ → ℂ} {Λ : ℝ} (hf : ContDiff ℝ 2 f)
    (hsupp : ∀ u, f u ≠ 0 → |u| ≤ Λ) (z : ℂ) :
    ‖paperFT f z‖ * ‖z‖ ^ 2 ≤ Real.exp (|z.im| * Λ) * ∫ u, ‖deriv (deriv f) u‖ := by
  have hcs : HasCompactSupport f := hasCompactSupport_of_support_subset_abs hsupp
  have hts := tsupport_subset_of_support_subset_abs hsupp
  have hsupp2 : ∀ u, deriv (deriv f) u ≠ 0 → |u| ≤ Λ := by
    intro u hu
    have : u ∈ tsupport f :=
      tsupport_deriv_subset (support_deriv_subset (Function.mem_support.mpr hu))
    exact abs_le.mpr (hts this)
  have hint : Integrable (deriv (deriv f)) :=
    (hf.deriv'.continuous_deriv le_rfl).integrable_of_hasCompactSupport hcs.deriv.deriv
  have := norm_paperFT_le hint hsupp2 z
  rw [paperFT_deriv_deriv hf hcs, norm_mul, norm_neg, norm_pow, mul_comm] at this
  exact this

/-- [eq:hfbound] for `z ≠ 0`: `‖h_f(z)‖ ≤ e^{|Im z|Λ} ‖f''‖₁ / ‖z‖²`. -/
theorem norm_paperFT_le_div {f : ℝ → ℂ} {Λ : ℝ} (hf : ContDiff ℝ 2 f)
    (hsupp : ∀ u, f u ≠ 0 → |u| ≤ Λ) {z : ℂ} (hz : z ≠ 0) :
    ‖paperFT f z‖ ≤
      Real.exp (|z.im| * Λ) * (∫ u, ‖deriv (deriv f) u‖) / ‖z‖ ^ 2 := by
  rw [le_div_iff₀ (by positivity)]
  exact norm_paperFT_mul_sq_le hf hsupp z

/-- TestC2 specialization of the L¹ bound. -/
theorem TestC2.norm_paperFT_bound {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) (z : ℂ) :
    ‖paperFT f z‖ ≤ Real.exp (|z.im| * (L / 2)) * ∫ u, ‖f u‖ :=
  norm_paperFT_le hf.integrable hf.support_subset_abs z

/-- TestC2 specialization of the ‖z‖⁻² decay. -/
theorem TestC2.norm_paperFT_decay {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f) {z : ℂ}
    (hz : z ≠ 0) :
    ‖paperFT f z‖ ≤
      Real.exp (|z.im| * (L / 2)) * (∫ u, ‖deriv (deriv f) u‖) / ‖z‖ ^ 2 :=
  norm_paperFT_le_div hf.contDiff hf.support_subset_abs hz

/-- Hfn inherits the TestC2 L¹ bound via the paperFT dictionary. -/
theorem TestC2.norm_Hfn_bound {L : ℝ} {k : ℝ → ℂ} (hk : TestC2 L k) (s : ℂ) :
    ‖Hfn k s‖ ≤
      Real.exp (|((s - 1 / 2) / I).im| * (L / 2)) * ∫ u, ‖k u‖ := by
  simpa [Hfn] using hk.norm_paperFT_bound ((s - 1 / 2) / I)

/-! ## Weil residue rates → InventErrorLittleO (little-o half of classical inputs)

The herr field of `InventClassicalMainInputs` asks for an err with the explicit §6 shape
used by `N0star_lower_H` / `eps_form_of_classicalInputs`. Under mild rate hypotheses
(R₁, R₂, NII = o(N), B → 0) that shape is little-o of Ncount on dyadic windows.

GAP: producing the rate hypotheses and the eventual (trGh, frGh, …) witnesses from the
Weil EF + prime-side traces remains invent (not closed here). -/

/-- Classical §6 residual matching `InventClassicalMainInputs.herr` / `N0star_lower_H`. -/
def weilClassicalResidual (lam : ℝ) (N R₁ R₂ NII B : ℝ → ℝ) (T : ℝ) : ℝ :=
  4 * R₁ T + R₂ T + 3 * NII T +
    B T *
      (4 + 2 * Real.sqrt ((1 / lam + lam / 3) * N T + R₂ T) + B T)

theorem c_lam_nonneg {lam : ℝ} (h1 : (1 : ℝ) / 2 ≤ lam) (_h2 : lam < 1) :
    0 ≤ 1 / lam + lam / 3 := by
  have hpos : (0 : ℝ) < lam := lt_of_lt_of_le (by norm_num : (0 : ℝ) < 1 / 2) h1
  have hinv : (0 : ℝ) ≤ 1 / lam := div_nonneg zero_le_one hpos.le
  have hlam : (0 : ℝ) ≤ lam / 3 := div_nonneg hpos.le (by norm_num : (0 : ℝ) ≤ 3)
  exact add_nonneg hinv hlam

theorem c_lam_le_three {lam : ℝ} (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1) :
    1 / lam + lam / 3 ≤ 3 := by
  have hpos : (0 : ℝ) < lam := lt_of_lt_of_le (by norm_num : (0 : ℝ) < 1 / 2) h1
  have hinv : 1 / lam ≤ (2 : ℝ) := by
    rw [div_le_iff₀ hpos]
    nlinarith
  have hlam : lam / 3 ≤ (1 : ℝ) / 3 := by
    have : lam ≤ (1 : ℝ) := h2.le
    nlinarith
  linarith

/-- Abstract residual rates ⇒ little-o of an arbitrary N → ∞. -/
theorem weilClassicalResidual_isLittleO {lam : ℝ} {N R₁ R₂ NII B : ℝ → ℝ}
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1)
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0)) :
    (fun T => weilClassicalResidual lam N R₁ R₂ NII B T) =o[atTop] N := by
  have hc : ∀ᶠ _T : ℝ in atTop,
      (0 : ℝ) ≤ 1 / lam + lam / 3 ∧ 1 / lam + lam / 3 ≤ (3 : ℝ) :=
    Eventually.of_forall fun _ => ⟨c_lam_nonneg h1 h2, c_lam_le_three h1 h2⟩
  simpa [weilClassicalResidual] using
    err_isLittleO_of_zero_delta (N := N) (R₁ := R₁) (R₂ := R₂) (NII := NII) (B := B)
      (c := fun _ : ℝ => (1 / lam + lam / 3 : ℝ)) (K := (3 : ℝ)) hN hR₁ hR₂ hNII hB hc

/-- Rate package produced by a Weil EF residue / remainder analysis on dyadic windows.
Prop-valued: rate functions existentially bound. Discharging from contour EF remains invent. -/
structure WeilResidueRates (lam : ℝ) : Prop where
  rates :
    ∃ (R₁ R₂ NII B : ℝ → ℝ),
      (1 : ℝ) / 2 ≤ lam ∧
        lam < 1 ∧
          Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop ∧
            R₁ =o[atTop] (fun T => (Ncount T (2 * T) : ℝ)) ∧
              R₂ =o[atTop] (fun T => (Ncount T (2 * T) : ℝ)) ∧
                NII =o[atTop] (fun T => (Ncount T (2 * T) : ℝ)) ∧
                  Tendsto B atTop (𝓝 0) ∧
                    ∀ᶠ T in atTop,
                      ∃ trGh frGh : ℝ,
                        0 ≤ B T ∧
                          4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII T -
                              B T * (4 + 2 * Real.sqrt frGh + B T) ≤
                            (N0star T (2 * T) : ℝ) ∧
                          |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁ T ∧
                          frGh ≤ (1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂ T

/-- Dyadic specialization: Weil residue rates ⇒ InventErrorLittleO (exists err). -/
theorem InventErrorLittleO_of_WeilResidueRates {lam : ℝ}
    (h : WeilResidueRates lam) :
    ∃ err : ℝ → ℝ, InventErrorLittleO err := by
  obtain ⟨R₁, R₂, NII, B, h1, h2, hN, hR₁, hR₂, hNII, hB, _⟩ := h.rates
  exact ⟨fun T =>
    weilClassicalResidual lam (fun T => (Ncount T (2 * T) : ℝ)) R₁ R₂ NII B T,
    weilClassicalResidual_isLittleO h1 h2 hN hR₁ hR₂ hNII hB⟩

/-- Assemble the herr existential of `InventClassicalMainInputs` from Weil residue rates.

GAP: the witnesses themselves (trGh / frGh / NII / B from Weil EF · traces) remain invent. -/
theorem herr_pack_of_WeilResidueRates {lam : ℝ} (h : WeilResidueRates lam) :
    ∃ err : ℝ → ℝ,
      InventErrorLittleO err ∧
        ∀ᶠ T in atTop,
          ∃ (trGh frGh B' R₁' R₂' NII' : ℝ),
            0 ≤ B' ∧
              4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII' -
                  B' * (4 + 2 * Real.sqrt frGh + B') ≤
                (N0star T (2 * T) : ℝ) ∧
              |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁' ∧
              frGh ≤ (1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂' ∧
              err T =
                4 * R₁' + R₂' + 3 * NII' +
                  B' *
                    (4 +
                      2 *
                        Real.sqrt
                          ((1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂') +
                      B') := by
  obtain ⟨R₁, R₂, NII, B, h1, h2, hN, hR₁, hR₂, hNII, hB, hpack⟩ := h.rates
  refine
    ⟨fun T =>
      weilClassicalResidual lam (fun T => (Ncount T (2 * T) : ℝ)) R₁ R₂ NII B T,
      weilClassicalResidual_isLittleO h1 h2 hN hR₁ hR₂ hNII hB, ?_⟩
  filter_upwards [hpack] with T ht
  obtain ⟨trGh, frGh, hB0, h0, htr, hfr⟩ := ht
  refine ⟨trGh, frGh, B T, R₁ T, R₂ T, NII T, hB0, h0, htr, hfr, ?_⟩
  rfl

/-- Bundle classical Prop inputs once rvm / traces / Weil herr are each available.
Does not invent any of the three analytic discharges. -/
theorem InventClassicalMainInputs.of_weil_herr {lam : ℝ}
    (hrvm : InventRvMLike) (htr : InventTracesLike lam)
    (hW : WeilResidueRates lam) :
    InventClassicalMainInputs lam :=
  ⟨hrvm, htr, herr_pack_of_WeilResidueRates hW⟩

/-- Zero residual rates: R₁ = R₂ = NII = 0, B = 0 ⇒ InventErrorLittleO (err ≡ 0).
Sanity check that the packaging specializes; not a Solution close. -/
theorem InventErrorLittleO_zero_residual {lam : ℝ}
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1)
    (hN : Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop) :
    InventErrorLittleO
      (fun T =>
        weilClassicalResidual lam (fun T => (Ncount T (2 * T) : ℝ))
          (fun _ => (0 : ℝ)) (fun _ => (0 : ℝ)) (fun _ => (0 : ℝ)) (fun _ => (0 : ℝ))
          T) := by
  refine
    weilClassicalResidual_isLittleO h1 h2 hN ?_ ?_ ?_ tendsto_const_nhds
  · simp
  · simp
  · simp

end
