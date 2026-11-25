/-
FractiSI invent — Weil explicit-formula *contour* scaffolding (Challenge-only Mathlib).
NO import of Anthropic Zeta23. No sorry.

Closed here from Mathlib + InventWeil (TestC2 / paperFT / Hfn / WeilResidueRates):
  · completedRiemannZeta functional equation packaging (Λ(1−s) = Λ(s))
  · riemannZeta = Λ / Gammaℝ dictionary (s ≠ 0); residue at s = 1
  · archimedean digamma = Γ′/Γ packaging (recurrence + values + meromorphy)
  · archWeilDensity := logDeriv Gammaℝ (classical μ carrier)
  · Weil pole contribution Hfn(0)+Hfn(1) = paperFT(±I/2) + TestC2 L¹ bounds
  · formal Weil EF contour identity Prop (zero = arch + prime + poles)
  · Ncount T (2T) → ∞ from a classical RvM main-term hypothesis
  · WeilResidueRates packaging from contour-shaped rate packs (reduction)

Classical gaps (comments only — not claimed closed):
  GAP: proving the contour identity itself (zero tsum = arch + prime + poles)
        against a TestC2 weight — needs meromorphic contour integration beyond Mathlib.
  GAP: identifying spectral (trGh, frGh) with Chebyshev / EF envelopes on dyadics
        (so InventTracesLike / WeilResidueRates remain undischarged).
  GAP: Tit86 uniform local count for InventRvMLike.
  GAP: pointwise digamma form of logDeriv Gammaℝ and Stirling μ ≪ log |t|
        on the critical line (Mathlib digamma exists; the Gammaℝ chain-rule identity
        and critical-line growth remain invent).
Do **not** treat InventTracesLike, WeilResidueRates, or Solution 17/17 as discharged.
-/
import InventWeil
import Mathlib.NumberTheory.LSeries.RiemannZeta
import Mathlib.Analysis.SpecialFunctions.Gamma.Deligne
import Mathlib.Analysis.SpecialFunctions.Gamma.Digamma
import Mathlib.Analysis.Calculus.LogDeriv
import Mathlib.Analysis.SpecialFunctions.Log.Basic
import Mathlib.NumberTheory.ArithmeticFunction.VonMangoldt

open Complex ContDiff Filter Topology Asymptotics Real Set MeasureTheory
open ArithmeticFunction hiding log id
open scoped BigOperators

noncomputable section

/-! ## Completed-zeta functional equation (Mathlib packaging) -/

theorem completedRiemannZeta_functional_equation (s : ℂ) :
    completedRiemannZeta (1 - s) = completedRiemannZeta s :=
  completedRiemannZeta_one_sub s

theorem completedRiemannZeta₀_functional_equation (s : ℂ) :
    completedRiemannZeta₀ (1 - s) = completedRiemannZeta₀ s :=
  completedRiemannZeta₀_one_sub s

theorem riemannZeta_eq_completed_div_Gammaℝ {s : ℂ} (hs : s ≠ 0) :
    riemannZeta s = completedRiemannZeta s / Gammaℝ s :=
  riemannZeta_def_of_ne_zero hs

theorem completedRiemannZeta_residue_at_one :
    Tendsto (fun s ↦ (s - 1) * completedRiemannZeta s) (𝓝[≠] 1) (𝓝 1) :=
  completedRiemannZeta_residue_one

theorem differentiableAt_completedRiemannZeta_off_poles {s : ℂ}
    (hs0 : s ≠ 0) (hs1 : s ≠ 1) :
    DifferentiableAt ℂ completedRiemannZeta s :=
  differentiableAt_completedZeta hs0 hs1

/-! ## Archimedean density: digamma = Γ′/Γ -/

theorem arch_digamma_eq_logDeriv_Gamma : Complex.digamma = logDeriv Complex.Gamma :=
  Complex.digamma_def

theorem arch_digamma_add_one (s : ℂ) (hs : ∀ m : ℕ, s ≠ -m) :
    Complex.digamma (s + 1) = Complex.digamma s + s⁻¹ :=
  Complex.digamma_apply_add_one s hs

theorem arch_digamma_one :
    Complex.digamma 1 = -Real.eulerMascheroniConstant :=
  Complex.digamma_one

theorem arch_digamma_one_half :
    Complex.digamma (1 / 2) =
      -2 * Complex.log 2 - Real.eulerMascheroniConstant :=
  Complex.digamma_one_half

theorem arch_digamma_meromorphic : Meromorphic Complex.digamma :=
  Complex.meromorphic_digamma

/-- Classical arch factor carrier: `μ(s) = (Γℝ′/Γℝ)(s)`.

GAP: Mathlib closes digamma = Γ′/Γ and the Deligne factor `Gammaℝ`, but the
pointwise identity `logDeriv Gammaℝ s = digamma(s/2)/2 − (log π)/2` and the
critical-line Stirling bound remain invent (named here, not sorry'd). -/
def archWeilDensity (s : ℂ) : ℂ :=
  logDeriv Gammaℝ s

theorem archWeilDensity_def (s : ℂ) : archWeilDensity s = logDeriv Gammaℝ s :=
  rfl

/-- Target digamma form of the arch density (Prop carrier; not discharged). -/
def ArchWeilDensityDigammaForm (s : ℂ) : Prop :=
  Gammaℝ s ≠ 0 →
    archWeilDensity s =
      Complex.digamma (s / 2) * (1 / 2) - (Real.log Real.pi : ℂ) / 2

def archWeilDensityCrit (t : ℝ) : ℂ :=
  archWeilDensity (1 / 2 + t * I)

theorem archWeilDensityCrit_def (t : ℝ) :
    archWeilDensityCrit t = archWeilDensity (1 / 2 + t * I) :=
  rfl

/-- Awareness: one-step digamma recurrence at a shifted argument. -/
theorem arch_digamma_add_nat_succ {s : ℂ} (n : ℕ)
    (hs : ∀ m : ℕ, (s + n : ℂ) ≠ -m) :
    Complex.digamma (s + (n + 1 : ℕ)) =
      Complex.digamma (s + n) + (s + n)⁻¹ := by
  have hEq : (s + (n + 1 : ℕ) : ℂ) = (s + n) + 1 := by
    push_cast; ring
  rw [hEq, arch_digamma_add_one _ hs]

/-! ## Pole contribution of the Weil weight -/

def weilPoleContribution (k : ℝ → ℂ) : ℂ :=
  Hfn k 0 + Hfn k 1

theorem weilPoleContribution_eq_paperFT (k : ℝ → ℂ) :
    weilPoleContribution k = paperFT k (I / 2) + paperFT k (-I / 2) := by
  simpa [weilPoleContribution] using Hfn_zero_add_one k

theorem weilPoleContribution_norm_le (k : ℝ → ℂ) :
    ‖weilPoleContribution k‖ ≤ ‖paperFT k (I / 2)‖ + ‖paperFT k (-I / 2)‖ := by
  simpa [weilPoleContribution_eq_paperFT] using
    norm_add_le (paperFT k (I / 2)) (paperFT k (-I / 2))

theorem weilPoleContribution_L1_bound {L : ℝ} {k : ℝ → ℂ} (hk : TestC2 L k) :
    ‖paperFT k (I / 2)‖ ≤ Real.exp (|((I / 2 : ℂ)).im| * (L / 2)) * ∫ u, ‖k u‖ ∧
      ‖paperFT k (-I / 2)‖ ≤
        Real.exp (|((-I / 2 : ℂ)).im| * (L / 2)) * ∫ u, ‖k u‖ :=
  ⟨hk.norm_paperFT_bound (I / 2), hk.norm_paperFT_bound (-I / 2)⟩

theorem weilPoleContribution_zero :
    weilPoleContribution (fun _ => (0 : ℂ)) = 0 := by
  simp [weilPoleContribution, Hfn, paperFT]

/-! ## Formal Weil EF contour sides (awareness carriers)

GAP: closing the identity against a TestC2 weight remains invent. -/

open Classical

def weilZeroSide (H : ℂ → ℂ) : ℂ :=
  ∑' ρ : ℂ, if IsNontrivialZero ρ then (zeroMult ρ : ℂ) * H ρ else 0

def weilArchSide (k : ℝ → ℂ) : ℂ :=
  ∫ t : ℝ, archWeilDensityCrit t * Hfn k (1 / 2 + t * I)

def weilPrimeSide (k : ℝ → ℂ) : ℂ :=
  ∑' n : ℕ,
    if n = 0 then (0 : ℂ)
    else (Λ n : ℂ) / (Real.sqrt n : ℂ) * paperFT k (-I * Complex.log n)

structure WeilExplicitFormula (k : ℝ → ℂ) : Prop where
  identity :
    weilZeroSide (Hfn k) =
      weilArchSide k + weilPrimeSide k + weilPoleContribution k

theorem WeilExplicitFormula.gap_named (k : ℝ → ℂ) :
    WeilExplicitFormula k ↔
      weilZeroSide (Hfn k) =
        weilArchSide k + weilPrimeSide k + weilPoleContribution k :=
  ⟨fun h => h.identity, fun h => ⟨h⟩⟩

/-! ## Ncount → ∞ from a classical RvM main-term hypothesis -/

theorem tendsto_linear_sub_log_atTop {C' : ℝ} (_hC' : 0 ≤ C') :
    Tendsto (fun T : ℝ => T / (2 * Real.pi) - C' * Real.log T) atTop atTop := by
  have hπ : (0 : ℝ) < 2 * Real.pi := by positivity
  have hT : Tendsto (fun T : ℝ => T / (2 * Real.pi)) atTop atTop :=
    tendsto_id.atTop_div_const hπ
  have hlog_o : (fun T : ℝ => C' * Real.log T) =o[atTop]
      fun T : ℝ => T / (2 * Real.pi) := by
    have h2 : (fun T : ℝ => C' * Real.log T) =o[atTop] id :=
      isLittleO_log_id_atTop.const_mul_left C'
    have hid : (id : ℝ → ℝ) =O[atTop] fun T => T / (2 * Real.pi) := by
      refine IsBigO.of_bound (2 * Real.pi) ?_
      filter_upwards [eventually_ge_atTop (0 : ℝ)] with T hT0
      simp only [Real.norm_eq_abs, abs_of_nonneg hT0, id]
      have : |T / (2 * Real.pi)| = T / (2 * Real.pi) :=
        abs_of_nonneg (div_nonneg hT0 hπ.le)
      rw [this, mul_div_cancel₀ _ hπ.ne']
    exact h2.trans_isBigO hid
  rw [tendsto_atTop_atTop]
  intro M
  have hEv : ∀ᶠ T : ℝ in atTop, M ≤ T / (2 * Real.pi) - C' * Real.log T := by
    have hhalf :
        ∀ᶠ T : ℝ in atTop, ‖C' * Real.log T‖ ≤ (1 / 2) * ‖T / (2 * Real.pi)‖ :=
      (isLittleO_iff.mp hlog_o) (by positivity : (0 : ℝ) < 1 / 2)
    have hTpos : ∀ᶠ T : ℝ in atTop, (0 : ℝ) ≤ T / (2 * Real.pi) :=
      hT.eventually_ge_atTop 0
    have hbig : ∀ᶠ T : ℝ in atTop, M ≤ (1 / 2) * (T / (2 * Real.pi)) :=
      ((tendsto_const_mul_atTop_of_pos (by positivity : (0 : ℝ) < (1 : ℝ) / 2)).mpr
          hT).eventually_ge_atTop M
    filter_upwards [hhalf, hTpos, hbig] with T h1 h2 h3
    have habs : ‖C' * Real.log T‖ ≤ (1 / 2) * (T / (2 * Real.pi)) := by
      calc ‖C' * Real.log T‖
          ≤ (1 / 2) * ‖T / (2 * Real.pi)‖ := h1
        _ = (1 / 2) * (T / (2 * Real.pi)) := by
              rw [Real.norm_eq_abs, abs_of_nonneg h2]
    have : T / (2 * Real.pi) - C' * Real.log T ≥
        T / (2 * Real.pi) - ‖C' * Real.log T‖ := by
      simp only [Real.norm_eq_abs]
      linarith [le_abs_self (C' * Real.log T), neg_le_abs (C' * Real.log T)]
    linarith
  exact eventually_atTop.1 hEv

theorem Ncount_dyadic_tendsto_atTop_of_rvmMain
    (h : ∃ C T₀ : ℝ, ∀ T ≥ T₀,
      |(Ncount T (2 * T) : ℝ) -
          T / (2 * Real.pi) * Real.log (T / (2 * Real.pi))| ≤ C * Real.log T) :
    Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop := by
  obtain ⟨C, T₀, hmain⟩ := h
  let C' : ℝ := |C| + 1
  have hC0 : 0 ≤ C' := add_nonneg (abs_nonneg _) zero_le_one
  have hlin := tendsto_linear_sub_log_atTop (C' := C') hC0
  rw [tendsto_atTop_atTop]
  intro M
  obtain ⟨T₁, hT₁⟩ := (tendsto_atTop_atTop.1 hlin) M
  refine ⟨max T₀ (max T₁ (max (2 * Real.pi * Real.exp 1) (Real.exp 1))),
    fun T hTle => ?_⟩
  have hT0 : T₀ ≤ T := (le_max_left _ _).trans hTle
  have hT1 : T₁ ≤ T :=
    ((le_max_left _ _).trans (le_max_right T₀ _)).trans hTle
  have hTpie : 2 * Real.pi * Real.exp 1 ≤ T :=
    (((le_max_left _ _).trans (le_max_right T₁ _)).trans (le_max_right T₀ _)).trans hTle
  have hTe : Real.exp 1 ≤ T :=
    (((le_max_right _ _).trans (le_max_right T₁ _)).trans (le_max_right T₀ _)).trans hTle
  have hπ : (0 : ℝ) < 2 * Real.pi := by positivity
  have harg_pos : (0 : ℝ) < T / (2 * Real.pi) :=
    div_pos (lt_of_lt_of_le (Real.exp_pos 1) hTe) hπ
  have hlogπ : (1 : ℝ) ≤ Real.log (T / (2 * Real.pi)) := by
    refine (Real.le_log_iff_exp_le harg_pos).2 ?_
    exact (le_div_iff₀ hπ).2 (by simpa [mul_comm] using hTpie)
  have hlogT : (1 : ℝ) ≤ Real.log T :=
    (Real.le_log_iff_exp_le (lt_of_lt_of_le (Real.exp_pos 1) hTe)).2 hTe
  have hlogT0 : (0 : ℝ) ≤ Real.log T := zero_le_one.trans hlogT
  have hmain_ge :
      T / (2 * Real.pi) ≤
        T / (2 * Real.pi) * Real.log (T / (2 * Real.pi)) := by
    nlinarith [harg_pos.le, hlogπ]
  have herr := abs_le.mp (hmain T hT0)
  have hCbound : C * Real.log T ≤ C' * Real.log T :=
    mul_le_mul_of_nonneg_right (le_trans (le_abs_self C) (by simp [C'])) hlogT0
  have hNlower :
      T / (2 * Real.pi) * Real.log (T / (2 * Real.pi)) - C' * Real.log T ≤
        (Ncount T (2 * T) : ℝ) := by
    linarith [herr.1, hCbound]
  have hlinT : M ≤ T / (2 * Real.pi) - C' * Real.log T := hT₁ T hT1
  linarith [hmain_ge, hNlower, hlinT]

/-! ## Contour-shaped rate packaging → WeilResidueRates (reduction only) -/

theorem WeilResidueRates.of_contour_rates {lam : ℝ}
    (R₁ R₂ NII B : ℝ → ℝ)
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1)
    (hN : Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop)
    (hR₁ : R₁ =o[atTop] fun T => (Ncount T (2 * T) : ℝ))
    (hR₂ : R₂ =o[atTop] fun T => (Ncount T (2 * T) : ℝ))
    (hNII : NII =o[atTop] fun T => (Ncount T (2 * T) : ℝ))
    (hB : Tendsto B atTop (𝓝 0))
    (hpack : ∀ᶠ T in atTop,
      ∃ trGh frGh : ℝ,
        0 ≤ B T ∧
          4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII T -
              B T * (4 + 2 * Real.sqrt frGh + B T) ≤
            (N0star T (2 * T) : ℝ) ∧
          |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁ T ∧
          frGh ≤ (1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂ T) :
    WeilResidueRates lam :=
  ⟨⟨R₁, R₂, NII, B, h1, h2, hN, hR₁, hR₂, hNII, hB, hpack⟩⟩

theorem WeilResidueRates.of_flat_contour {lam : ℝ}
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1)
    (hN : Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop)
    (hpack : ∀ᶠ T in atTop,
      ∃ frGh : ℝ,
        4 * (Ncount T (2 * T) : ℝ) - frGh - 2 * (Ncount T (2 * T) : ℝ) ≤
            (N0star T (2 * T) : ℝ) ∧
          frGh ≤ (1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ)) :
    WeilResidueRates lam := by
  refine WeilResidueRates.of_contour_rates (fun _ => 0) (fun _ => 0) (fun _ => 0)
    (fun _ => 0) h1 h2 hN ?_ ?_ ?_ tendsto_const_nhds ?_
  · simp
  · simp
  · simp
  · filter_upwards [hpack] with T ht
    obtain ⟨frGh, h0, hfr⟩ := ht
    refine ⟨(Ncount T (2 * T) : ℝ), frGh, le_rfl, ?_, by simp, ?_⟩
    · simpa using h0
    · linarith

/-- Classical-input assembly once RvM + traces + contour rates exist.

GAP: none of the three analytic discharges is closed by this packaging. -/
theorem InventClassicalMainInputs.of_weil_ef_contour {lam : ℝ}
    (hrvm : InventRvMLike) (htr : InventTracesLike lam)
    (hW : WeilResidueRates lam) :
    InventClassicalMainInputs lam :=
  InventClassicalMainInputs.of_weil_herr hrvm htr hW

theorem Ncount_tendsto_of_InventRvMLike_main (h : InventRvMLike) :
    Tendsto (fun T => (Ncount T (2 * T) : ℝ)) atTop atTop :=
  Ncount_dyadic_tendsto_atTop_of_rvmMain h.main

end
