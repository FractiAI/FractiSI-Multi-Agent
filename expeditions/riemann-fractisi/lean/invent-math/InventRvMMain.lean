/-
FractiSI invent — Mathlib-only progress toward `InventRvMLike.main`.
NO import of Anthropic Zeta23. No sorry.

Target (not discharged):
  ∃ C T₀, ∀ T ≥ T₀,
    |Ncount T (2T) − (T/(2π)) log(T/(2π))| ≤ C log T
  and Ncount T (2T) → ∞ as T → ∞.

Closed here from Mathlib + ChallengeDeps + InventRvM packing:
  · `rvmMainTerm` matching InventRvMLike.main
  · main-term positivity and Tendsto atTop
  · classical secondary factor is Θ(T)
  · sandwich ↔ InventRvMLikeMain
  · InventRvMLikeMain ⇒ Tendsto dyadic Ncount atTop
  · GoodHeight density on every unit interval
  · short-window ≤ unit; edge O(log) under local_count
  · three-split additivity
  · ContourPackage + local_count ⇒ InventRvMLikeMain

GAP (Prop only): ContourPackage (argument principle / Γℝ residual);
local_count (strip growth). Do **not** fake-close Solution.
-/
import InventRvM
import Mathlib.Analysis.SpecificLimits.Basic
import Mathlib.Order.Interval.Set.Infinite
import Mathlib.Analysis.Real.Pi.Bounds
import Mathlib.Topology.Algebra.Order.Field

open Complex Set Filter Asymptotics Topology
open scoped Topology

noncomputable section

/-! ## Main term matching `InventRvMLike.main` -/

/-- Reference main term of `InventRvMLike.main` (no classical `2 log 2 − 1` secondary). -/
def rvmMainTerm (T : ℝ) : ℝ :=
  T / (2 * Real.pi) * Real.log (T / (2 * Real.pi))

theorem two_pi_pos' : (0 : ℝ) < 2 * Real.pi :=
  mul_pos two_pos Real.pi_pos

theorem rvmMainTerm_pos {T : ℝ} (hT : 2 * Real.pi < T) : 0 < rvmMainTerm T := by
  have hden : 0 < T / (2 * Real.pi) := div_pos (lt_trans two_pi_pos' hT) two_pi_pos'
  have hlog : 0 < Real.log (T / (2 * Real.pi)) :=
    Real.log_pos ((one_lt_div two_pi_pos').mpr hT)
  exact mul_pos (div_pos (lt_trans two_pi_pos' hT) two_pi_pos') hlog

theorem tendsto_rvmMainTerm_atTop : Tendsto rvmMainTerm atTop atTop := by
  have hπ : Tendsto (fun T : ℝ => T / (2 * Real.pi)) atTop atTop :=
    tendsto_id.atTop_div_const two_pi_pos'
  have hlog : Tendsto (fun T : ℝ => Real.log (T / (2 * Real.pi))) atTop atTop :=
    Real.tendsto_log_atTop.comp hπ
  convert hπ.atTop_mul_atTop₀ hlog using 1
  ext T; rfl

/-- Classical secondary factor `2 log 2 − 1`. -/
def rvmSecondaryFactor : ℝ := 2 * Real.log 2 - 1

theorem rvmSecondaryFactor_pos : 0 < rvmSecondaryFactor := by
  unfold rvmSecondaryFactor
  have h : (1 / 2 : ℝ) < Real.log 2 := by
    have : Real.exp (1 / 2) < (2 : ℝ) := by
      have hsq : Real.exp (1 / 2) ^ 2 = Real.exp 1 := by
        rw [← Real.exp_nat_mul]; norm_num
      have h4 : Real.exp 1 < 4 := lt_trans Real.exp_one_lt_d9 (by norm_num)
      nlinarith [Real.exp_pos (1 / 2 : ℝ), hsq, h4]
    exact (Real.lt_log_iff_exp_lt two_pos).mpr this
  linarith

theorem rvmMainTerm_sub_classical (T : ℝ) :
    T / (2 * Real.pi) * (Real.log (T / (2 * Real.pi)) + rvmSecondaryFactor) - rvmMainTerm T =
      T / (2 * Real.pi) * rvmSecondaryFactor := by
  unfold rvmMainTerm; ring

theorem abs_classical_minus_rvmMainTerm {T : ℝ} (hT : 0 ≤ T) :
    |T / (2 * Real.pi) * (Real.log (T / (2 * Real.pi)) + rvmSecondaryFactor) - rvmMainTerm T| =
      T / (2 * Real.pi) * rvmSecondaryFactor := by
  rw [rvmMainTerm_sub_classical,
    abs_of_nonneg (mul_nonneg (div_nonneg hT two_pi_pos'.le) rvmSecondaryFactor_pos.le)]

/-! ## Named Prop = InventRvMLike.main shape -/

def InventRvMLikeMain : Prop :=
  ∃ C T₀ : ℝ, ∀ T ≥ T₀,
    |(Ncount T (2 * T) : ℝ) - rvmMainTerm T| ≤ C * Real.log T

theorem inventRvMLikeMain_iff_statement :
    InventRvMLikeMain ↔
      ∃ C T₀ : ℝ, ∀ T ≥ T₀,
        |(Ncount T (2 * T) : ℝ) -
            T / (2 * Real.pi) * Real.log (T / (2 * Real.pi))| ≤ C * Real.log T := by
  simp only [InventRvMLikeMain, rvmMainTerm]

theorem inventRvMLike_main_sandwich_of (h : InventRvMLikeMain) :
    ∃ C T₀ : ℝ, ∀ T ≥ T₀,
      rvmMainTerm T - C * Real.log T ≤ (Ncount T (2 * T) : ℝ) ∧
        (Ncount T (2 * T) : ℝ) ≤ rvmMainTerm T + C * Real.log T := by
  obtain ⟨C, T₀, hC⟩ := h
  refine ⟨C, T₀, fun T hT => ?_⟩
  have hAbs := abs_le.mp (hC T hT)
  constructor <;> linarith

theorem inventRvMLikeMain_of_sandwich
    (h : ∃ C T₀ : ℝ, ∀ T ≥ T₀,
      rvmMainTerm T - C * Real.log T ≤ (Ncount T (2 * T) : ℝ) ∧
        (Ncount T (2 * T) : ℝ) ≤ rvmMainTerm T + C * Real.log T) :
    InventRvMLikeMain := by
  obtain ⟨C, T₀, hC⟩ := h
  refine ⟨C, T₀, fun T hT => ?_⟩
  have ⟨h1, h2⟩ := hC T hT
  exact abs_le.mpr ⟨by linarith, by linarith⟩

/-! ## main/log → ∞ -/

theorem tendsto_log_ratio_one :
    Tendsto (fun T : ℝ => Real.log (T / (2 * Real.pi)) / Real.log T) atTop (nhds 1) := by
  have hEv :
      (fun T : ℝ => Real.log (T / (2 * Real.pi)) / Real.log T) =ᶠ[atTop]
        fun T => 1 - Real.log (2 * Real.pi) / Real.log T := by
    filter_upwards [eventually_gt_atTop (max (2 * Real.pi) 1)] with T hTm
    have hTπ : 2 * Real.pi < T := lt_of_le_of_lt (le_max_left _ _) hTm
    have hT1 : (1 : ℝ) < T := lt_of_le_of_lt (le_max_right _ _) hTm
    rw [Real.log_div (lt_trans two_pi_pos' hTπ).ne' two_pi_pos'.ne', sub_div,
      div_self (Real.log_pos hT1).ne']
  have hlim :
      Tendsto (fun T : ℝ => 1 - Real.log (2 * Real.pi) / Real.log T) atTop (nhds 1) := by
    have h0 :
        Tendsto (fun T : ℝ => 1 - Real.log (2 * Real.pi) / Real.log T) atTop
          (nhds (1 - 0)) :=
      (tendsto_const_nhds (x := (1 : ℝ))).sub
        ((tendsto_const_nhds (x := Real.log (2 * Real.pi))).div_atTop Real.tendsto_log_atTop)
    simpa using h0
  exact Tendsto.congr' hEv.symm hlim

theorem tendsto_rvmMainTerm_div_log_atTop :
    Tendsto (fun T : ℝ => rvmMainTerm T / Real.log T) atTop atTop := by
  have hT : Tendsto (fun T : ℝ => T / (2 * Real.pi)) atTop atTop :=
    tendsto_id.atTop_div_const two_pi_pos'
  have hprod := hT.atTop_mul_pos (by norm_num : (0 : ℝ) < 1) tendsto_log_ratio_one
  have hEq :
      (fun T : ℝ => rvmMainTerm T / Real.log T) =ᶠ[atTop]
        fun T => (T / (2 * Real.pi)) * (Real.log (T / (2 * Real.pi)) / Real.log T) := by
    filter_upwards [eventually_gt_atTop (1 : ℝ)] with T hT1
    unfold rvmMainTerm
    field_simp [(Real.log_pos hT1).ne']
  exact Tendsto.congr' hEq.symm hprod

private theorem one_lt_exp_one : (1 : ℝ) < Real.exp 1 :=
  Real.one_lt_exp_iff.mpr zero_lt_one

/-! ## InventRvMLikeMain ⇒ dyadic Ncount → ∞ -/

theorem tendsto_Ncount_dyadic_of_InventRvMLikeMain (h : InventRvMLikeMain) :
    Tendsto (fun T : ℝ => (Ncount T (2 * T) : ℝ)) atTop atTop := by
  obtain ⟨C, T₀, hC⟩ := inventRvMLike_main_sandwich_of h
  have hhalf :
      ∀ᶠ T : ℝ in atTop, rvmMainTerm T / 2 ≤ (Ncount T (2 * T) : ℝ) := by
    filter_upwards [
      eventually_ge_atTop (max T₀ (Real.exp 1)),
      tendsto_rvmMainTerm_div_log_atTop.eventually_ge_atTop (2 * (|C| + 1))] with T hTb hTr
    have hT₀' : T₀ ≤ T := le_trans (le_max_left _ _) hTb
    have hTe : Real.exp 1 ≤ T := le_trans (le_max_right _ _) hTb
    have hlog0 : 0 < Real.log T := Real.log_pos (lt_of_lt_of_le one_lt_exp_one hTe)
    obtain ⟨hlo, _⟩ := hC T hT₀'
    have hbound : |C| * Real.log T ≤ rvmMainTerm T / 2 := by
      have hmul : 2 * (|C| + 1) * Real.log T ≤ rvmMainTerm T := by
        calc
          2 * (|C| + 1) * Real.log T
              = (2 * (|C| + 1)) * Real.log T := by ring
          _ ≤ (rvmMainTerm T / Real.log T) * Real.log T :=
            mul_le_mul_of_nonneg_right hTr hlog0.le
          _ = rvmMainTerm T := div_mul_cancel₀ _ hlog0.ne'
      have : (|C| + 1) * Real.log T ≤ rvmMainTerm T / 2 := by linarith
      exact le_trans (mul_le_mul_of_nonneg_right (by linarith [abs_nonneg C]) hlog0.le) this
    have : C * Real.log T ≤ |C| * Real.log T :=
      mul_le_mul_of_nonneg_right (le_abs_self _) hlog0.le
    linarith
  have hhalfTendsto : Tendsto (fun T : ℝ => rvmMainTerm T / 2) atTop atTop := by
    convert tendsto_rvmMainTerm_atTop.atTop_mul_const
        (by norm_num : (0 : ℝ) < (1 / 2 : ℝ)) using 1
    ext T; ring
  exact tendsto_atTop_mono' _ hhalf hhalfTendsto

/-! ## GoodHeight density (Mathlib discreteness) -/

/-- Ordinate with no nontrivial zero on the horizontal line Im = T. -/
def GoodHeight (T : ℝ) : Prop := ∀ ρ : ℂ, IsNontrivialZero ρ → ρ.im ≠ T

theorem badHeights_finite (a : ℝ) :
    {t : ℝ | ∃ ρ : ℂ, IsNontrivialZero ρ ∧ ρ.im = t ∧ t ∈ Icc a (a + 1)}.Finite := by
  let M : ℝ := max |a| |a + 1|
  have hfin := nontrivialZeros_im_le_finite M
  refine (hfin.image (fun ρ : ℂ => ρ.im)).subset ?_
  intro t ⟨ρ, hρ, him, ht⟩
  refine ⟨ρ, ⟨hρ, ?_⟩, him⟩
  have : |t| ≤ M := by
    rw [abs_le]
    constructor
    · have h1 : -M ≤ -|a| := neg_le_neg (le_max_left _ _)
      have h2 : -|a| ≤ a := neg_abs_le a
      linarith [ht.1]
    · have h1 : a + 1 ≤ |a + 1| := le_abs_self _
      have h2 : |a + 1| ≤ M := le_max_right _ _
      linarith [ht.2]
  simpa [him] using this

/-- Every unit interval contains a GoodHeight. -/
theorem exists_GoodHeight_on_unit (a : ℝ) :
    ∃ T ∈ Icc a (a + 1), GoodHeight T := by
  set bad : Set ℝ :=
    {t : ℝ | ∃ ρ : ℂ, IsNontrivialZero ρ ∧ ρ.im = t ∧ t ∈ Icc a (a + 1)}
  have hfin : bad.Finite := badHeights_finite a
  have hinf : (Icc a (a + 1) : Set ℝ).Infinite := Icc_infinite (by linarith)
  obtain ⟨T, hTIcc, hTbad⟩ := (hinf.sdiff hfin).nonempty
  refine ⟨T, hTIcc, ?_⟩
  intro ρ hρ hEq
  exact hTbad ⟨ρ, hρ, hEq, hTIcc⟩

theorem exists_GoodHeight_below (T : ℝ) :
    ∃ T₁ : ℝ, T - 1 ≤ T₁ ∧ T₁ ≤ T ∧ GoodHeight T₁ := by
  obtain ⟨T₁, hmem, hg⟩ := exists_GoodHeight_on_unit (T - 1)
  refine ⟨T₁, hmem.1, ?_, hg⟩
  linarith [hmem.2]

theorem exists_GoodHeight_above (T : ℝ) :
    ∃ T₂ : ℝ, 2 * T ≤ T₂ ∧ T₂ ≤ 2 * T + 1 ∧ GoodHeight T₂ := by
  obtain ⟨T₂, hmem, hg⟩ := exists_GoodHeight_on_unit (2 * T)
  exact ⟨T₂, hmem.1, hmem.2, hg⟩

/-! ## Short windows and edge control -/

theorem Ncount_le_unit_of_short {a b : ℝ} (_hle : a ≤ b) (hlen : b ≤ a + 1) :
    Ncount a b ≤ Ncount a (a + 1) :=
  Ncount_mono le_rfl hlen

theorem Ncount_short_le_log (h : RiemannVonMangoldtLocalCount)
    {a b : ℝ} (hle : a ≤ b) (hlen : b ≤ a + 1) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ (Ncount a b : ℝ) ≤ A₀ * Real.log (|a| + 3) := by
  obtain ⟨A₀, hA₀, hA⟩ := h
  refine ⟨A₀, hA₀, ?_⟩
  have : (Ncount a b : ℝ) ≤ (Ncount a (a + 1) : ℝ) := by
    exact_mod_cast Ncount_le_unit_of_short hle hlen
  exact this.trans (hA a)

/-! ## Three-split additivity -/

theorem Ncount_three_split {T₁ T T₂ : ℝ} (h1 : T₁ ≤ T) (h2 : T ≤ 2 * T) (h3 : 2 * T ≤ T₂) :
    Ncount T₁ T₂ = Ncount T₁ T + Ncount T (2 * T) + Ncount (2 * T) T₂ := by
  have e1 := Ncount_add (a := T₁) (b := T) (c := T₂) h1 (h2.trans h3)
  have e2 := Ncount_add (a := T) (b := 2 * T) (c := T₂) h2 h3
  omega

theorem Ncount_three_split_nonneg {T₁ T T₂ : ℝ} (h1 : T₁ ≤ T) (h3 : 2 * T ≤ T₂) (hT : 0 ≤ T) :
    Ncount T₁ T₂ = Ncount T₁ T + Ncount T (2 * T) + Ncount (2 * T) T₂ :=
  Ncount_three_split h1 (by nlinarith) h3

/-! ## Contour package (GAP) + GenericRvM arithmetic -/

/-- GAP: good-height window count matches `rvmMainTerm` up to O(log).
Needs argument principle + Γℝ residual (Tit86 9.3–9.4). -/
def ContourPackage : Prop :=
  ∃ C K a₀ : ℝ, 0 ≤ C ∧ 0 ≤ K ∧ 0 ≤ a₀ ∧
    ∀ T : ℝ, a₀ ≤ T →
      ∃ T₁ T₂ : ℝ,
        T - 1 ≤ T₁ ∧ T₁ ≤ T ∧ 2 * T ≤ T₂ ∧ T₂ ≤ 2 * T + 1 ∧
          GoodHeight T₁ ∧ GoodHeight T₂ ∧
            |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| ≤ C * Real.log (T + 3) + K

private theorem log_T_add_three_le {T : ℝ} (hT : 3 ≤ T) :
    Real.log (T + 3) ≤ 2 * Real.log T := by
  have hle : T + 3 ≤ T ^ 2 := by nlinarith
  calc
    Real.log (T + 3) ≤ Real.log (T ^ 2) := Real.log_le_log (by linarith) hle
    _ = 2 * Real.log T := by rw [Real.log_pow]; push_cast; ring

/-- GenericRvM bookkeeping: ContourPackage + local_count ⇒ InventRvMLikeMain. -/
theorem inventRvMLikeMain_of_contour_and_local
    (hC : ContourPackage) (hloc : RiemannVonMangoldtLocalCount) :
    InventRvMLikeMain := by
  obtain ⟨C, K, a₀, hC0, hK0, ha₀, hpack⟩ := hC
  obtain ⟨A₀, hA₀, hA⟩ := hloc
  have hA0n : 0 ≤ A₀ := le_trans (by norm_num : (0 : ℝ) ≤ 1) hA₀
  set C' : ℝ := 2 * C + 4 * A₀ + K + 1
  refine ⟨C', max (max a₀ 3) (Real.exp 1), fun T hTbound => ?_⟩
  have ha : a₀ ≤ T :=
    le_trans (le_trans (le_max_left a₀ 3) (le_max_left _ _)) hTbound
  have hT3 : (3 : ℝ) ≤ T :=
    le_trans (le_trans (le_max_right a₀ 3) (le_max_left _ _)) hTbound
  have hTe : Real.exp 1 ≤ T := le_trans (le_max_right _ _) hTbound
  have hT0 : (0 : ℝ) ≤ T := le_trans (by norm_num) hT3
  have hlog0 : 0 < Real.log T := Real.log_pos (lt_of_lt_of_le one_lt_exp_one hTe)
  obtain ⟨T₁, T₂, hT₁lo, hT₁hi, hT₂lo, hT₂hi, _hg1, _hg2, hNapprox⟩ := hpack T ha
  have hsplit := Ncount_three_split_nonneg (T₁ := T₁) (T := T) (T₂ := T₂) hT₁hi hT₂lo hT0
  have hedgeL : (Ncount T₁ T : ℝ) ≤ A₀ * Real.log (|T₁| + 3) := by
    have h1 : (Ncount T₁ T : ℝ) ≤ (Ncount T₁ (T₁ + 1) : ℝ) := by
      exact_mod_cast Ncount_le_unit_of_short hT₁hi (by linarith)
    exact h1.trans (hA T₁)
  have hedgeR : (Ncount (2 * T) T₂ : ℝ) ≤ A₀ * Real.log (|2 * T| + 3) := by
    have h1 : (Ncount (2 * T) T₂ : ℝ) ≤ (Ncount (2 * T) (2 * T + 1) : ℝ) := by
      exact_mod_cast Ncount_le_unit_of_short hT₂lo hT₂hi
    exact h1.trans (hA (2 * T))
  have hT₁pos : 0 ≤ T₁ := by linarith
  have hlogL : Real.log (|T₁| + 3) ≤ 2 * Real.log T := by
    rw [abs_of_nonneg hT₁pos]
    have : T₁ + 3 ≤ T + 3 := by linarith
    exact (Real.log_le_log (by linarith) this).trans (log_T_add_three_le hT3)
  have hlogR : Real.log (|2 * T| + 3) ≤ 2 * Real.log T := by
    rw [abs_of_nonneg (by nlinarith : (0 : ℝ) ≤ 2 * T)]
    have hle : 2 * T + 3 ≤ T ^ 2 := by nlinarith
    calc
      Real.log (2 * T + 3) ≤ Real.log (T ^ 2) := Real.log_le_log (by positivity) hle
      _ = 2 * Real.log T := by rw [Real.log_pow]; push_cast; ring
  have hlogMid : Real.log (T + 3) ≤ 2 * Real.log T := log_T_add_three_le hT3
  have hNeq :
      (Ncount T (2 * T) : ℝ) =
        (Ncount T₁ T₂ : ℝ) - (Ncount T₁ T : ℝ) - (Ncount (2 * T) T₂ : ℝ) := by
    have := congrArg (fun n : ℕ => (n : ℝ)) hsplit
    push_cast at this; linarith
  have htri :
      |(Ncount T (2 * T) : ℝ) - rvmMainTerm T| ≤
        |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| +
          (Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ) := by
    have hnn1 : 0 ≤ (Ncount T₁ T : ℝ) := Nat.cast_nonneg _
    have hnn2 : 0 ≤ (Ncount (2 * T) T₂ : ℝ) := Nat.cast_nonneg _
    rw [hNeq]
    calc
      |(Ncount T₁ T₂ : ℝ) - (Ncount T₁ T : ℝ) - (Ncount (2 * T) T₂ : ℝ) - rvmMainTerm T|
          =
            |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T -
              ((Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ))| := by ring_nf
      _ ≤ |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| +
            |(Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ)| := abs_sub _ _
      _ = |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| +
            ((Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ)) := by
          rw [abs_of_nonneg (add_nonneg hnn1 hnn2)]
      _ = |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| + (Ncount T₁ T : ℝ) +
            (Ncount (2 * T) T₂ : ℝ) := by ring
  have hEdges : (Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ) ≤ 4 * A₀ * Real.log T := by
    have hL : (Ncount T₁ T : ℝ) ≤ 2 * A₀ * Real.log T := by
      calc
        (Ncount T₁ T : ℝ) ≤ A₀ * Real.log (|T₁| + 3) := hedgeL
        _ ≤ A₀ * (2 * Real.log T) := mul_le_mul_of_nonneg_left hlogL hA0n
        _ = 2 * A₀ * Real.log T := by ring
    have hR : (Ncount (2 * T) T₂ : ℝ) ≤ 2 * A₀ * Real.log T := by
      calc
        (Ncount (2 * T) T₂ : ℝ) ≤ A₀ * Real.log (|2 * T| + 3) := hedgeR
        _ ≤ A₀ * (2 * Real.log T) := mul_le_mul_of_nonneg_left hlogR hA0n
        _ = 2 * A₀ * Real.log T := by ring
    linarith
  have hApprox : |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| ≤ (2 * C + K) * Real.log T := by
    have h1 : C * Real.log (T + 3) + K ≤ C * (2 * Real.log T) + K :=
      add_le_add (mul_le_mul_of_nonneg_left hlogMid hC0) le_rfl
    have hlog1 : (1 : ℝ) ≤ Real.log T :=
      (Real.le_log_iff_exp_le (lt_of_lt_of_le (by norm_num) hT3)).mpr hTe
    have hKlog : K ≤ K * Real.log T := by
      simpa using mul_le_mul_of_nonneg_left hlog1 hK0
    have h2 : C * (2 * Real.log T) + K ≤ 2 * C * Real.log T + K * Real.log T := by
      linarith [hKlog]
    calc
      |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| ≤ C * Real.log (T + 3) + K := hNapprox
      _ ≤ 2 * C * Real.log T + K * Real.log T := (h1.trans h2)
      _ = (2 * C + K) * Real.log T := by ring
  have hsum :
      |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| + (Ncount T₁ T : ℝ) + (Ncount (2 * T) T₂ : ℝ) ≤
        (2 * C + K) * Real.log T + 4 * A₀ * Real.log T := by
    have := add_le_add hApprox hEdges
    linarith
  calc
    |(Ncount T (2 * T) : ℝ) - rvmMainTerm T|
        ≤ |(Ncount T₁ T₂ : ℝ) - rvmMainTerm T| + (Ncount T₁ T : ℝ) +
            (Ncount (2 * T) T₂ : ℝ) := htri
    _ ≤ (2 * C + K) * Real.log T + 4 * A₀ * Real.log T := hsum
    _ = (2 * C + 4 * A₀ + K) * Real.log T := by ring
    _ ≤ C' * Real.log T := by
        unfold C'
        exact mul_le_mul_of_nonneg_right (by linarith) hlog0.le

/-- Awareness: InventRvMLikeMain + local_count packages `InventRvMLike`. -/
theorem inventRvMLike_of_main_and_local
    (hm : InventRvMLikeMain) (hl : RiemannVonMangoldtLocalCount) :
    InventRvMLike :=
  ⟨by simpa [InventRvMLikeMain, rvmMainTerm] using hm, hl⟩

end
