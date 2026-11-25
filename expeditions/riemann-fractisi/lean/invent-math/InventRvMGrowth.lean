/-
FractiSI invent — growth / Jensen / reflection scaffolding toward InventRvMLike.local_count.
NO import of Anthropic Zeta23. No sorry.

Closed here from Mathlib + ChallengeDeps + InventRvM packing:
  · FE prefactor nonvanishing + order transport ζ(1−w) ↔ ζ(w) in the open strip
  · Schwarz order symmetry + nontrivial-zero reflection ρ ↦ 1 − conj ρ
  · Ncount ≤ 2 · Nhalf via reflection
  · Re s ≥ 2 centre bounds (Dirichlet series)
  · Re s > 1 Dirichlet absolute O(1) bounds on {σ₀ ≤ Re}
  · analyticity of ζ on closed balls avoiding the pole
  · unit-window half-strip ⊂ closedBall(2+(t+½)i, √(5/2))
  · Jensen disc geometry (outer sphere Re≥0.2, ‖s−1‖≥1 for |t|≥4)
  · Mathlib Jensen `sum_divisor_le` packaged for ζ
  · `growthImpliesHalfCount` : ZetaRightStripGrowth → HalfCountLogBound
  · ZetaRightStripGrowth ⇒ RiemannVonMangoldtLocalCount / inventRvMLike.local_count

GAP (comments only): Tit86 strip polynomial growth (`ZetaRightStripGrowth` on
{0.15 ≤ Re}) needs incomplete-zeta / summation-by-parts not yet in Mathlib.
Re>1 growth is closed; the critical/strip edge is not. Do **not** discharge
InventRvMLike / Solution 17/17 without that growth step.
-/
import InventRvM
import Mathlib.Analysis.Complex.JensenFormula
import Mathlib.NumberTheory.Harmonic.ZetaAsymp
import Mathlib.NumberTheory.ZetaValues
import Mathlib.Analysis.Real.Pi.Bounds
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Complex
import Mathlib.Analysis.SpecialFunctions.Complex.Analytic
import Mathlib.Analysis.SpecialFunctions.Gamma.Basic
import Mathlib.Analysis.Calculus.Deriv.Star
import Mathlib.Analysis.Analytic.Uniqueness
import Mathlib.Analysis.Meromorphic.Divisor
import Mathlib.Analysis.SpecialFunctions.Pow.Real
import Mathlib.Analysis.Complex.Norm

open Complex Set Filter Topology Metric MeromorphicOn
open scoped BigOperators ComplexConjugate

noncomputable section

/-! ## Reflection ρ ↦ 1 − conj ρ -/

def reflectNontrivial (ρ : ℂ) : ℂ := 1 - conj ρ

@[simp] theorem reflectNontrivial_re (ρ : ℂ) : (reflectNontrivial ρ).re = 1 - ρ.re := by
  simp [reflectNontrivial]

@[simp] theorem reflectNontrivial_im (ρ : ℂ) : (reflectNontrivial ρ).im = ρ.im := by
  simp [reflectNontrivial]

@[simp] theorem reflectNontrivial_reflectNontrivial (ρ : ℂ) :
    reflectNontrivial (reflectNontrivial ρ) = ρ := by
  simp [reflectNontrivial]

theorem reflectNontrivial_injective : Function.Injective reflectNontrivial :=
  Function.LeftInverse.injective reflectNontrivial_reflectNontrivial

/-- Prefactor of `riemannZeta_one_sub`. -/
def zetaFEPrefactor (s : ℂ) : ℂ :=
  2 * (2 * (Real.pi : ℂ)) ^ (-s) * Complex.Gamma s * Complex.cos ((Real.pi : ℂ) * s / 2)

private theorem two_pi_ne_zero' : (2 * (Real.pi : ℂ)) ≠ 0 := by
  simp [mul_eq_zero, Real.pi_ne_zero]

private theorem not_re_neg_nat {s : ℂ} (h0 : 0 < s.re) (m : ℕ) : s ≠ -m := by
  intro h
  have : 0 < (-(m : ℂ)).re := by simpa [h] using h0
  simp [neg_re, natCast_re] at this
  exact (not_lt.mpr (Nat.cast_nonneg m)) this

theorem zetaFEPrefactor_ne_zero {s : ℂ} (h0 : 0 < s.re) (h1 : s.re < 1) :
    zetaFEPrefactor s ≠ 0 := by
  have hsne : ∀ m : ℕ, s ≠ -m := fun m => not_re_neg_nat h0 m
  have hcpow : (2 * (Real.pi : ℂ)) ^ (-s) ≠ 0 := by
    rw [Complex.cpow_def_of_ne_zero two_pi_ne_zero']
    exact Complex.exp_ne_zero _
  have hcos : Complex.cos ((Real.pi : ℂ) * s / 2) ≠ 0 := by
    intro hc
    rw [Complex.cos_eq_zero_iff] at hc
    obtain ⟨k, hk⟩ := hc
    have hπ : (Real.pi : ℂ) ≠ 0 := Complex.ofReal_ne_zero.mpr Real.pi_ne_zero
    have h2 : (Real.pi : ℂ) * s = (Real.pi : ℂ) * (2 * (k : ℂ) + 1) := by
      linear_combination (2 : ℂ) * hk
    have hs_eq : s = ((2 * k + 1 : ℤ) : ℂ) := by
      have h3 := mul_left_cancel₀ hπ h2
      rw [h3]; push_cast; ring
    rw [hs_eq, Complex.intCast_re] at h0 h1
    have h0' : (0 : ℤ) < 2 * k + 1 := by exact_mod_cast h0
    have h1' : (2 * k + 1 : ℤ) < 1 := by exact_mod_cast h1
    omega
  have hΓ : Complex.Gamma s ≠ 0 := Complex.Gamma_ne_zero hsne
  unfold zetaFEPrefactor
  exact mul_ne_zero (mul_ne_zero (mul_ne_zero two_ne_zero hcpow) hΓ) hcos

private theorem analyticAt_zetaFEPrefactor {s : ℂ} (h0 : 0 < s.re) :
    AnalyticAt ℂ zetaFEPrefactor s := by
  have h1 : AnalyticAt ℂ (fun z : ℂ => (2 * (Real.pi : ℂ)) ^ (-z)) s := by
    rw [analyticAt_iff_eventually_differentiableAt]
    filter_upwards with z
    exact (differentiableAt_id.neg).const_cpow (Or.inl two_pi_ne_zero')
  have h2 : AnalyticAt ℂ Complex.Gamma s := by
    rw [analyticAt_iff_eventually_differentiableAt]
    have hopen : IsOpen {z : ℂ | 0 < z.re} := isOpen_lt continuous_const Complex.continuous_re
    filter_upwards [hopen.mem_nhds h0] with z hz
    refine Complex.differentiableAt_Gamma z fun m hm => ?_
    have : 0 < (-(m : ℂ)).re := by simpa [hm] using hz
    simp [neg_re, natCast_re] at this
    exact (not_lt.mpr (Nat.cast_nonneg m)) this
  have h3 : AnalyticAt ℂ (fun z : ℂ => Complex.cos ((Real.pi : ℂ) * z / 2)) s := by
    have hlin : AnalyticAt ℂ (fun z : ℂ => (Real.pi : ℂ) * z / 2) s := by
      change AnalyticAt ℂ (fun z => ((Real.pi : ℂ) * z) * (2 : ℂ)⁻¹) s
      exact (analyticAt_const.mul analyticAt_id).mul analyticAt_const
    exact Complex.analyticAt_cos.comp hlin
  exact ((analyticAt_const.mul h1).mul h2).mul h3

/-- Order transport through the functional equation in the open strip. -/
theorem analyticOrderAt_zeta_one_sub {w : ℂ} (h0 : 0 < w.re) (h1 : w.re < 1) :
    analyticOrderAt riemannZeta (1 - w) = analyticOrderAt riemannZeta w := by
  have hopen : IsOpen {z : ℂ | 0 < z.re ∧ z.re < 1} :=
    (isOpen_lt continuous_const Complex.continuous_re).inter
      (isOpen_lt Complex.continuous_re continuous_const)
  have hev : (riemannZeta ∘ fun z : ℂ => 1 - z) =ᶠ[nhds w] (zetaFEPrefactor * riemannZeta) := by
    filter_upwards [hopen.mem_nhds ⟨h0, h1⟩] with z hz
    have hzne : ∀ n : ℕ, z ≠ -n := fun n => not_re_neg_nat hz.1 n
    have hzne1 : z ≠ 1 := by
      intro h; rw [h] at hz; simp at hz
    show riemannZeta (1 - z) = zetaFEPrefactor z * riemannZeta z
    rw [riemannZeta_one_sub hzne hzne1]
    unfold zetaFEPrefactor; ring
  have hg : AnalyticAt ℂ (fun z : ℂ => 1 - z) w := analyticAt_const.sub analyticAt_id
  have hg' : deriv (fun z : ℂ => 1 - z) w ≠ 0 := by
    have : deriv (fun z : ℂ => 1 - z) w = -1 := by
      rw [deriv_const_sub]; simp
    simp [this]
  have hEfac := analyticAt_zetaFEPrefactor h0
  have hEord : analyticOrderAt zetaFEPrefactor w = 0 :=
    hEfac.analyticOrderAt_eq_zero.mpr (zetaFEPrefactor_ne_zero h0 h1)
  have hζw : AnalyticAt ℂ riemannZeta w := by
    have hne1 : w ≠ 1 := by intro h; rw [h] at h1; simp at h1
    exact analyticOn_riemannZeta w (by simpa using hne1)
  calc analyticOrderAt riemannZeta (1 - w)
      = analyticOrderAt (riemannZeta ∘ fun z : ℂ => 1 - z) w := by
        rw [analyticOrderAt_comp_of_deriv_ne_zero hg hg']
    _ = analyticOrderAt (zetaFEPrefactor * riemannZeta) w := analyticOrderAt_congr hev
    _ = analyticOrderAt zetaFEPrefactor w + analyticOrderAt riemannZeta w :=
        analyticOrderAt_mul hEfac hζw
    _ = analyticOrderAt riemannZeta w := by rw [hEord, zero_add]

private theorem tendsto_conj_nhds (w : ℂ) :
    Tendsto (fun z => conj z) (nhds (conj w)) (nhds w) := by
  have h := continuous_conj.tendsto (conj w)
  rwa [conj_conj] at h

private theorem analyticAt_conj_conj {f : ℂ → ℂ} {w : ℂ} (hf : AnalyticAt ℂ f w) :
    AnalyticAt ℂ (fun z => conj (f (conj z))) (conj w) := by
  rw [analyticAt_iff_eventually_differentiableAt] at hf ⊢
  filter_upwards [(tendsto_conj_nhds w).eventually hf] with z hz
  have h2 := hz.conj_conj
  rw [conj_conj] at h2
  exact h2

theorem analyticOrderAt_conj_conj (f : ℂ → ℂ) (w : ℂ) :
    analyticOrderAt (fun z => conj (f (conj z))) (conj w) = analyticOrderAt f w := by
  by_cases hf : AnalyticAt ℂ f w
  · by_cases htop : analyticOrderAt f w = ⊤
    · rw [htop, analyticOrderAt_eq_top]
      filter_upwards [(tendsto_conj_nhds w).eventually (analyticOrderAt_eq_top.mp htop)] with z hz
      simp [hz]
    · obtain ⟨n, hn⟩ := ENat.ne_top_iff_exists.mp htop
      rw [← hn]
      rw [Eq.comm, hf.analyticOrderAt_eq_natCast] at hn
      obtain ⟨g, hg, hgne, hfg⟩ := hn
      rw [(analyticAt_conj_conj hf).analyticOrderAt_eq_natCast]
      refine ⟨fun z => conj (g (conj z)), analyticAt_conj_conj hg, by simpa using hgne, ?_⟩
      filter_upwards [(tendsto_conj_nhds w).eventually hfg] with z hz
      simp [hz, map_smul, map_pow, map_sub, conj_conj, smul_eq_mul]
  · have hf' : ¬AnalyticAt ℂ (fun z => conj (f (conj z))) (conj w) := by
      intro hcon
      apply hf
      have h2 := analyticAt_conj_conj hcon
      rw [conj_conj] at h2
      exact h2.congr (Eventually.of_forall fun _ => by simp [conj_conj])
    rw [analyticOrderAt_of_not_analyticAt hf, analyticOrderAt_of_not_analyticAt hf']

theorem analyticOrderAt_zeta_conj (w : ℂ) :
    analyticOrderAt riemannZeta (conj w) = analyticOrderAt riemannZeta w := by
  have hcong : (fun z => conj (riemannZeta (conj z))) =ᶠ[nhds (conj w)] riemannZeta := by
    filter_upwards with z
    rw [riemannZeta_conj, conj_conj]
  calc analyticOrderAt riemannZeta (conj w)
      = analyticOrderAt (fun z => conj (riemannZeta (conj z))) (conj w) :=
        (analyticOrderAt_congr hcong).symm
    _ = analyticOrderAt riemannZeta w := analyticOrderAt_conj_conj _ _

theorem isNontrivialZero_reflectNontrivial {ρ : ℂ} (h : IsNontrivialZero ρ) :
    IsNontrivialZero (reflectNontrivial ρ) := by
  obtain ⟨hzero, h0, h1⟩ := h
  have hρne : ∀ n : ℕ, ρ ≠ -n := fun n => not_re_neg_nat h0 n
  have hρne1 : ρ ≠ 1 := by intro hn; rw [hn] at h1; simp at h1
  have hrefl_eq : reflectNontrivial ρ = conj (1 - ρ) := by
    simp [reflectNontrivial, map_sub, map_one]
  refine ⟨?_, ?_, ?_⟩
  · rw [hrefl_eq, riemannZeta_conj, riemannZeta_one_sub hρne hρne1, hzero]
    simp
  · simp [reflectNontrivial]; linarith
  · simp [reflectNontrivial]; linarith

theorem zeroMult_reflectNontrivial {ρ : ℂ} (h : IsNontrivialZero ρ) :
    zeroMult (reflectNontrivial ρ) = zeroMult ρ := by
  obtain ⟨_, h0, h1⟩ := h
  have hrefl_eq : reflectNontrivial ρ = conj (1 - ρ) := by
    simp [reflectNontrivial, map_sub, map_one]
  unfold zeroMult
  rw [hrefl_eq, analyticOrderAt_zeta_conj, analyticOrderAt_zeta_one_sub h0 h1]

/-! ## Halving: Ncount ≤ 2 · Nhalf -/

def zerosInHalf (T₁ T₂ : ℝ) : Set ℂ :=
  zerosIn T₁ T₂ ∩ {ρ | (1 / 2 : ℝ) ≤ ρ.re}

theorem zerosInHalf_finite (T₁ T₂ : ℝ) : (zerosInHalf T₁ T₂).Finite :=
  (zerosIn_finite T₁ T₂).inter_of_left _

def Nhalf (T₁ T₂ : ℝ) : ℕ := ∑ᶠ ρ ∈ zerosInHalf T₁ T₂, zeroMult ρ

theorem reflectNontrivial_mem_zerosInHalf_of_lt {T₁ T₂ : ℝ} {ρ : ℂ}
    (h : ρ ∈ zerosIn T₁ T₂) (hlt : ρ.re < 1 / 2) :
    reflectNontrivial ρ ∈ zerosInHalf T₁ T₂ := by
  refine ⟨⟨isNontrivialZero_reflectNontrivial h.1,
    by simpa [reflectNontrivial_im] using h.2.1,
    by simpa [reflectNontrivial_im] using h.2.2⟩, ?_⟩
  simp [reflectNontrivial_re]
  linarith

theorem Ncount_le_two_mul_Nhalf (T₁ T₂ : ℝ) :
    Ncount T₁ T₂ ≤ 2 * Nhalf T₁ T₂ := by
  classical
  set A := zerosIn T₁ T₂ ∩ {ρ | ρ.re < (1 / 2 : ℝ)}
  set B := zerosInHalf T₁ T₂
  have hW := zerosIn_finite T₁ T₂
  have hA : A.Finite := hW.subset inter_subset_left
  have hB : B.Finite := zerosInHalf_finite T₁ T₂
  have hWAB : zerosIn T₁ T₂ = A ∪ B := by
    ext ρ
    simp only [A, B, zerosInHalf, mem_union, mem_inter_iff, mem_setOf]
    constructor
    · intro h
      rcases lt_or_ge ρ.re (1 / 2) with h' | h'
      · exact Or.inl ⟨h, h'⟩
      · exact Or.inr ⟨h, h'⟩
    · rintro (⟨h, _⟩ | ⟨h, _⟩) <;> exact h
  have hdisj : Disjoint A B := by
    rw [disjoint_left]
    rintro ρ ⟨_, h1⟩ ⟨_, h2⟩
    simp only [mem_setOf] at h1 h2
    linarith
  have hN : Ncount T₁ T₂ = ∑ᶠ ρ ∈ A, zeroMult ρ + ∑ᶠ ρ ∈ B, zeroMult ρ := by
    unfold Ncount
    rw [hWAB, finsum_mem_union hdisj hA hB]
  have himage : reflectNontrivial '' A ⊆ B := by
    rintro _ ⟨ρ, ⟨hρW, hlt⟩, rfl⟩
    exact reflectNontrivial_mem_zerosInHalf_of_lt hρW hlt
  have hAB : ∑ᶠ ρ ∈ A, zeroMult ρ ≤ ∑ᶠ ρ ∈ B, zeroMult ρ := by
    rw [finsum_mem_eq_finite_toFinset_sum _ hA, finsum_mem_eq_finite_toFinset_sum _ hB]
    have himg : hA.toFinset.image reflectNontrivial ⊆ hB.toFinset := by
      intro σ hσ
      obtain ⟨ρ, hρ, rfl⟩ := Finset.mem_image.mp hσ
      exact hB.mem_toFinset.2 (himage ⟨ρ, hA.mem_toFinset.1 hρ, rfl⟩)
    have hsumA :
        ∑ ρ ∈ hA.toFinset, zeroMult ρ =
          ∑ ρ ∈ hA.toFinset, zeroMult (reflectNontrivial ρ) :=
      Finset.sum_congr rfl fun ρ hρ =>
        (zeroMult_reflectNontrivial (hA.mem_toFinset.1 hρ).1.1).symm
    have hsumImg :
        ∑ ρ ∈ hA.toFinset, zeroMult (reflectNontrivial ρ) =
          ∑ σ ∈ hA.toFinset.image reflectNontrivial, zeroMult σ :=
      (Finset.sum_image fun _ _ _ _ h => reflectNontrivial_injective h).symm
    calc ∑ ρ ∈ hA.toFinset, zeroMult ρ
        = ∑ σ ∈ hA.toFinset.image reflectNontrivial, zeroMult σ := hsumA.trans hsumImg
      _ ≤ ∑ σ ∈ hB.toFinset, zeroMult σ :=
          Finset.sum_le_sum_of_subset_of_nonneg himg fun _ _ _ => Nat.zero_le _
  unfold Nhalf
  rw [hN]
  have hle : ∑ᶠ ρ ∈ A, zeroMult ρ + ∑ᶠ ρ ∈ B, zeroMult ρ ≤
      ∑ᶠ ρ ∈ B, zeroMult ρ + ∑ᶠ ρ ∈ B, zeroMult ρ :=
    add_le_add hAB le_rfl
  simpa [two_mul, B] using hle

theorem Ncount_unit_le_two_mul_Nhalf (t : ℝ) :
    Ncount t (t + 1) ≤ 2 * Nhalf t (t + 1) :=
  Ncount_le_two_mul_Nhalf t (t + 1)

/-! ## Re ≥ 2 centre bounds -/

theorem norm_riemannZeta_sub_one_le_of_two_le_re {s : ℂ} (hs : 2 ≤ s.re) :
    ‖riemannZeta s - 1‖ ≤ Real.pi ^ 2 / 6 - 1 := by
  have hs1 : 1 < s.re := by linarith
  set f : ℕ → ℂ := fun n => 1 / ((n : ℂ) + 1) ^ s
  have hsum : Summable f := by
    have h0 := Complex.summable_one_div_nat_cpow.mpr hs1
    have := (summable_nat_add_iff 1).mpr h0
    simpa [f] using this
  have hzeta : riemannZeta s = ∑' n, f n := zeta_eq_tsum_one_div_nat_add_one_cpow hs1
  have hf0 : f 0 = 1 := by simp [f]
  have hsplit : riemannZeta s - 1 = ∑' n, f (n + 1) := by
    rw [hzeta, hsum.tsum_eq_zero_add, hf0]; ring
  have hle : ∀ n : ℕ, ‖f (n + 1)‖ ≤ 1 / ((n : ℝ) + 2) ^ 2 := by
    intro n
    have hpos : 0 < n + 2 := by omega
    have hf1 : f (n + 1) = 1 / ((n + 2 : ℕ) : ℂ) ^ s := by
      simp only [f]; congr 2; push_cast; ring
    rw [hf1, norm_div, norm_one, Complex.norm_natCast_cpow_of_pos hpos]
    have hbase : (1 : ℝ) ≤ ((n + 2 : ℕ) : ℝ) := by exact_mod_cast hpos
    have hpow : ((n + 2 : ℕ) : ℝ) ^ (2 : ℝ) ≤ ((n + 2 : ℕ) : ℝ) ^ s.re :=
      Real.rpow_le_rpow_of_exponent_le hbase hs
    rw [Real.rpow_two] at hpow
    have h2pos : (0 : ℝ) < ((n + 2 : ℕ) : ℝ) ^ 2 := by positivity
    calc 1 / ((n + 2 : ℕ) : ℝ) ^ s.re ≤ 1 / ((n + 2 : ℕ) : ℝ) ^ 2 :=
          one_div_le_one_div_of_le h2pos hpow
      _ = 1 / ((n : ℝ) + 2) ^ 2 := by push_cast; ring
  have htwo : HasSum (fun n : ℕ => 1 / ((n : ℝ) + 2) ^ 2) (Real.pi ^ 2 / 6 - 1) := by
    have h := (hasSum_nat_add_iff' 2).mpr hasSum_zeta_two
    norm_num [Finset.sum_range_succ] at h
    exact h.congr_fun fun n => by ring
  rw [hsplit]
  have hsum' : Summable (fun n => f (n + 1)) := (summable_nat_add_iff 1).mpr hsum
  calc ‖∑' n, f (n + 1)‖ ≤ ∑' n, ‖f (n + 1)‖ := norm_tsum_le_tsum_norm hsum'.norm
    _ ≤ ∑' n : ℕ, 1 / ((n : ℝ) + 2) ^ 2 := hsum'.norm.tsum_le_tsum hle htwo.summable
    _ = Real.pi ^ 2 / 6 - 1 := htwo.tsum_eq

private theorem pi_sq_div_six_sub_one_lt_one : Real.pi ^ 2 / 6 - 1 < 1 := by
  have := Real.pi_lt_d2
  nlinarith [Real.pi_pos]

theorem two_sub_pi_sq_div_six_pos : 0 < 2 - Real.pi ^ 2 / 6 := by
  linarith [pi_sq_div_six_sub_one_lt_one]

theorem one_third_lt_two_sub_pi_sq_div_six : (1 / 3 : ℝ) < 2 - Real.pi ^ 2 / 6 := by
  have := Real.pi_lt_d2
  nlinarith [Real.pi_pos]

theorem norm_riemannZeta_ge_of_two_le_re {s : ℂ} (hs : 2 ≤ s.re) :
    2 - Real.pi ^ 2 / 6 ≤ ‖riemannZeta s‖ := by
  have h := norm_riemannZeta_sub_one_le_of_two_le_re hs
  have h' : ‖(1 : ℂ)‖ - ‖1 - riemannZeta s‖ ≤ ‖riemannZeta s‖ := by
    simpa using norm_sub_norm_le (1 : ℂ) (1 - riemannZeta s)
  rw [norm_sub_rev] at h'
  simp only [norm_one] at h'
  linarith

theorem zeta_lower_bound_two (t : ℝ) : (1 / 3 : ℝ) ≤ ‖riemannZeta (2 + t * I)‖ := by
  have h := norm_riemannZeta_ge_of_two_le_re (s := 2 + t * I) (by simp)
  linarith [one_third_lt_two_sub_pi_sq_div_six]

theorem riemannZeta_ne_zero_of_two_le_re {s : ℂ} (hs : 2 ≤ s.re) : riemannZeta s ≠ 0 :=
  riemannZeta_ne_zero_of_one_le_re (by linarith)

theorem norm_riemannZeta_le_of_two_le_re {s : ℂ} (hs : 2 ≤ s.re) :
    ‖riemannZeta s‖ ≤ Real.pi ^ 2 / 6 := by
  have h := norm_riemannZeta_sub_one_le_of_two_le_re hs
  have h' : ‖riemannZeta s‖ ≤ ‖riemannZeta s - 1‖ + ‖(1 : ℂ)‖ := by
    simpa using norm_le_norm_sub_add (riemannZeta s) (1 : ℂ)
  simp only [norm_one] at h'
  linarith

/-! ## Analyticity + half-window geometry -/

theorem analyticOnNhd_riemannZeta_of_notMem {S : Set ℂ} (hS : (1 : ℂ) ∉ S) :
    AnalyticOnNhd ℂ riemannZeta S := by
  have h : AnalyticOnNhd ℂ riemannZeta ({1}ᶜ : Set ℂ) :=
    DifferentiableOn.analyticOnNhd
      (fun s hs => (differentiableAt_riemannZeta hs).differentiableWithinAt)
      isOpen_compl_singleton
  exact h.mono (subset_compl_singleton_iff.mpr hS)

theorem zerosInHalf_unit_subset_ball (t : ℝ) :
    zerosInHalf t (t + 1) ⊆
      closedBall (2 + ((t + 1 / 2 : ℝ) : ℂ) * I) (Real.sqrt (5 / 2)) := by
  intro ρ hρ
  obtain ⟨⟨hρ0, him1, him2⟩, hreSet⟩ := hρ
  have hre : (1 / 2 : ℝ) ≤ ρ.re := by simpa using hreSet
  rw [mem_closedBall, dist_eq_norm]
  set c₀ : ℂ := 2 + ((t + 1 / 2 : ℝ) : ℂ) * I
  have hre' : (ρ - c₀).re = ρ.re - 2 := by simp [c₀]
  have him' : (ρ - c₀).im = ρ.im - (t + 1 / 2) := by simp [c₀]
  have hreAbs : |ρ.re - 2| ≤ (3 / 2 : ℝ) := by
    have : ρ.re ≤ 1 := hρ0.2.2.le
    rw [abs_of_nonpos (by linarith)]
    linarith
  have himAbs : |ρ.im - (t + 1 / 2)| ≤ (1 / 2 : ℝ) := by
    rw [abs_le]; constructor <;> linarith [him1, him2]
  have hnorm_sq : ‖ρ - c₀‖ ^ 2 ≤ (5 / 2 : ℝ) := by
    rw [Complex.sq_norm, Complex.normSq_apply, hre', him']
    have h1 : (ρ.re - 2) ^ 2 ≤ (3 / 2 : ℝ) ^ 2 := by
      rw [← sq_abs]
      exact (sq_le_sq₀ (abs_nonneg _) (by norm_num : (0 : ℝ) ≤ 3 / 2)).mpr hreAbs
    have h2 : (ρ.im - (t + 1 / 2)) ^ 2 ≤ (1 / 2 : ℝ) ^ 2 := by
      rw [← sq_abs]
      exact (sq_le_sq₀ (abs_nonneg _) (by norm_num : (0 : ℝ) ≤ 1 / 2)).mpr himAbs
    nlinarith
  have hnn : 0 ≤ ‖ρ - c₀‖ := norm_nonneg _
  have hsqrt : 0 ≤ Real.sqrt (5 / 2) := Real.sqrt_nonneg _
  have : ‖ρ - c₀‖ ^ 2 ≤ (Real.sqrt (5 / 2)) ^ 2 := by
    rwa [Real.sq_sqrt (by norm_num : (0 : ℝ) ≤ 5 / 2)]
  exact (sq_le_sq₀ hnn hsqrt).mp this


/-! ## Re > 1 Dirichlet absolute bounds (Mathlib-closed toward strip growth) -/

/-- Uniform O(1) on Re ≥ 2 (Dirichlet / Basel). Strongest strip-edge Mathlib bound in-tree. -/
theorem exists_norm_riemannZeta_bound_of_re_ge_two :
    ∃ C : ℝ, 0 < C ∧ ∀ s : ℂ, (2 : ℝ) ≤ s.re → ‖riemannZeta s‖ ≤ C :=
  ⟨Real.pi ^ 2 / 6, by have := Real.pi_pos; positivity,
    fun _ hs => norm_riemannZeta_le_of_two_le_re hs⟩

/-- Absolute majorant on {σ₀ ≤ Re} for σ₀ ≥ 2, via the Re≥2 centre bound. -/
theorem exists_norm_riemannZeta_bound_of_re_ge {σ₀ : ℝ} (hσ : 2 ≤ σ₀) :
    ∃ C : ℝ, 0 < C ∧ ∀ s : ℂ, σ₀ ≤ s.re → ‖riemannZeta s‖ ≤ C := by
  obtain ⟨C, hC, hbd⟩ := exists_norm_riemannZeta_bound_of_re_ge_two
  exact ⟨C, hC, fun s hs => hbd s (le_trans hσ hs)⟩

/-! ## Strip-growth hypothesis (Tit86 input) + Jensen packaging -/

/-- GAP carrier: polynomial growth on {0.15 ≤ Re, ‖s−1‖ ≥ 1}. Not Mathlib-closed. -/
def ZetaRightStripGrowth : Prop :=
  ∃ A C : ℝ, 0 < C ∧ ∀ s : ℂ, (0.15 : ℝ) ≤ s.re → 1 ≤ ‖s - 1‖ →
    ‖riemannZeta s‖ ≤ C * (|s.im| + 3) ^ A

/-- Intermediate: half-window log bound for |t| ≥ 4 (Jensen output shape). -/
def HalfCountLogBound : Prop :=
  ∃ A₁ : ℝ, 0 < A₁ ∧ ∀ t : ℝ, 4 ≤ |t| →
    (Nhalf t (t + 1) : ℝ) ≤ A₁ * Real.log (|t| + 3)

/-- Reflection + half-count log bound ⇒ classical local_count. -/
theorem RiemannVonMangoldtLocalCount_of_halfBound (hH : HalfCountLogBound) :
    RiemannVonMangoldtLocalCount := by
  obtain ⟨A₁, hA₁, hhalf⟩ := hH
  obtain ⟨M, hM⟩ := exists_uniform_Ncount_unit_on_Icc (-5) 5 (by norm_num)
  have hlog3 : 0 < Real.log 3 := Real.log_pos (by norm_num)
  set A₀ : ℝ := max 1 (max (2 * A₁) (M / Real.log 3))
  refine ⟨A₀, le_max_left _ _, fun t => ?_⟩
  have hA₀0 : 0 ≤ A₀ := le_trans (by norm_num : (0 : ℝ) ≤ 1) (le_max_left _ _)
  have hlogt := log_abs_add_three_pos t
  rcases le_or_gt 4 |t| with ht | ht
  · have h2 : (Ncount t (t + 1) : ℝ) ≤ 2 * (Nhalf t (t + 1) : ℝ) := by
      exact_mod_cast Ncount_unit_le_two_mul_Nhalf t
    have h3 : 2 * (Nhalf t (t + 1) : ℝ) ≤ 2 * A₁ * Real.log (|t| + 3) := by
      have := hhalf t ht
      nlinarith [hA₁.le]
    have h4 : 2 * A₁ ≤ A₀ :=
      (le_max_left (2 * A₁) (M / Real.log 3)).trans (le_max_right _ _)
    calc (Ncount t (t + 1) : ℝ) ≤ 2 * A₁ * Real.log (|t| + 3) := h2.trans h3
      _ ≤ A₀ * Real.log (|t| + 3) := mul_le_mul_of_nonneg_right h4 hlogt.le
  · have htIcc : t ∈ Icc (-5 : ℝ) 5 := by
      rw [mem_Icc]; constructor <;> linarith [abs_lt.mp ht]
    have hNt : (Ncount t (t + 1) : ℝ) ≤ M := by exact_mod_cast hM t htIcc
    have hML : (M : ℝ) ≤ A₀ * Real.log 3 := by
      have hA : M / Real.log 3 ≤ A₀ :=
        (le_max_right (2 * A₁) (M / Real.log 3)).trans (le_max_right _ _)
      have : (M : ℝ) = (M / Real.log 3) * Real.log 3 :=
        (div_mul_cancel₀ (M : ℝ) hlog3.ne').symm
      calc (M : ℝ) = (M / Real.log 3) * Real.log 3 := this
        _ ≤ A₀ * Real.log 3 := mul_le_mul_of_nonneg_right hA hlog3.le
    have hlog : Real.log 3 ≤ Real.log (|t| + 3) :=
      Real.log_le_log (by norm_num) (by linarith [abs_nonneg t])
    calc (Ncount t (t + 1) : ℝ) ≤ M := hNt
      _ ≤ A₀ * Real.log 3 := hML
      _ ≤ A₀ * Real.log (|t| + 3) := mul_le_mul_of_nonneg_left hlog hA₀0

/-- Jensen radii. -/
def jensenInnerRadius : ℝ := Real.sqrt (5 / 2)
def jensenOuterRadius : ℝ := 9 / 5

theorem jensenInner_pos : 0 < jensenInnerRadius := Real.sqrt_pos.2 (by norm_num)
theorem jensenOuter_pos : 0 < jensenOuterRadius := by unfold jensenOuterRadius; norm_num
theorem jensenInner_lt_outer : jensenInnerRadius < jensenOuterRadius := by
  unfold jensenInnerRadius jensenOuterRadius
  rw [Real.sqrt_lt (by norm_num) (by norm_num)]; norm_num

theorem jensenInner_abs : |jensenInnerRadius| = jensenInnerRadius := abs_of_pos jensenInner_pos
theorem jensenOuter_abs : |jensenOuterRadius| = jensenOuterRadius := abs_of_pos jensenOuter_pos

/-- Jensen disc centre for the unit window at `t`. -/
def jensenCenter (t : ℝ) : ℂ := 2 + ((t + 1 / 2 : ℝ) : ℂ) * I

@[simp] theorem jensenCenter_re (t : ℝ) : (jensenCenter t).re = 2 := by simp [jensenCenter]
@[simp] theorem jensenCenter_im (t : ℝ) : (jensenCenter t).im = t + 1 / 2 := by
  simp [jensenCenter]

theorem zerosInHalf_unit_subset_jensenInner (t : ℝ) :
    zerosInHalf t (t + 1) ⊆ closedBall (jensenCenter t) jensenInnerRadius := by
  simpa [jensenCenter, jensenInnerRadius] using zerosInHalf_unit_subset_ball t

private theorem abs_t_add_half_ge {t : ℝ} (ht : 4 ≤ |t|) : (7 / 2 : ℝ) ≤ |t + 1 / 2| := by
  cases le_total 0 t with
  | inl hpos =>
    have : |t| = t := abs_of_nonneg hpos
    rw [abs_of_nonneg (by linarith : 0 ≤ t + 1 / 2)]
    linarith [ht, this]
  | inr hneg =>
    have : |t| = -t := abs_of_nonpos hneg
    rw [abs_of_nonpos (by linarith : t + 1 / 2 ≤ 0)]
    linarith [ht, this]

theorem one_notMem_jensenOuterBall {t : ℝ} (ht : 4 ≤ |t|) :
    (1 : ℂ) ∉ closedBall (jensenCenter t) jensenOuterRadius := by
  intro h
  rw [mem_closedBall, dist_eq_norm, norm_sub_rev] at h
  have him : |t + 1 / 2| ≤ ‖jensenCenter t - 1‖ := by
    have : (jensenCenter t - 1).im = t + 1 / 2 := by simp [jensenCenter]
    simpa [this] using abs_im_le_norm (jensenCenter t - 1)
  have : (7 / 2 : ℝ) ≤ jensenOuterRadius :=
    (abs_t_add_half_ge ht).trans (him.trans h)
  unfold jensenOuterRadius at this
  norm_num at this

theorem analyticOnNhd_riemannZeta_jensenOuter {t : ℝ} (ht : 4 ≤ |t|) :
    AnalyticOnNhd ℂ riemannZeta (closedBall (jensenCenter t) |jensenOuterRadius|) := by
  rw [jensenOuter_abs]
  exact analyticOnNhd_riemannZeta_of_notMem (one_notMem_jensenOuterBall ht)

theorem mem_jensenOuterSphere_re_ge {t : ℝ} {z : ℂ}
    (hz : z ∈ sphere (jensenCenter t) |jensenOuterRadius|) :
    (0.15 : ℝ) ≤ z.re := by
  rw [jensenOuter_abs, mem_sphere_iff_norm] at hz
  have hre : |z.re - 2| ≤ jensenOuterRadius := by
    have := abs_re_le_norm (z - jensenCenter t)
    simp only [sub_re, jensenCenter_re] at this
    exact this.trans_eq hz
  rw [abs_le] at hre
  unfold jensenOuterRadius at hre
  linarith [hre.1]

theorem mem_jensenOuterSphere_dist_one {t : ℝ} (ht : 4 ≤ |t|) {z : ℂ}
    (hz : z ∈ sphere (jensenCenter t) |jensenOuterRadius|) :
    1 ≤ ‖z - 1‖ := by
  rw [jensenOuter_abs, mem_sphere_iff_norm] at hz
  have htri : ‖jensenCenter t - 1‖ - ‖z - jensenCenter t‖ ≤ ‖z - 1‖ := by
    have := norm_sub_norm_le (jensenCenter t - 1) (jensenCenter t - z)
    simpa [sub_sub_sub_cancel_left, norm_sub_rev] using this
  have hz' : ‖z - jensenCenter t‖ = jensenOuterRadius := hz
  have hc : (7 / 2 : ℝ) ≤ ‖jensenCenter t - 1‖ := by
    have him : |t + 1 / 2| ≤ ‖jensenCenter t - 1‖ := by
      have : (jensenCenter t - 1).im = t + 1 / 2 := by simp [jensenCenter]
      simpa [this] using abs_im_le_norm (jensenCenter t - 1)
    exact (abs_t_add_half_ge ht).trans him
  unfold jensenOuterRadius at hz'
  linarith [htri, hc, hz']

theorem mem_jensenOuterSphere_im_le {t : ℝ} {z : ℂ}
    (hz : z ∈ sphere (jensenCenter t) |jensenOuterRadius|) :
    |z.im| ≤ |t| + (23 / 10 : ℝ) := by
  rw [jensenOuter_abs, mem_sphere_iff_norm] at hz
  have himle : |z.im - (t + 1 / 2)| ≤ jensenOuterRadius := by
    have := abs_im_le_norm (z - jensenCenter t)
    simp only [sub_im, jensenCenter_im] at this
    exact this.trans_eq hz
  have htri : |z.im| ≤ |z.im - (t + 1 / 2)| + |t + 1 / 2| := by
    linarith [abs_sub_abs_le_abs_sub z.im (t + 1 / 2)]
  have htabs : |t + 1 / 2| ≤ |t| + (1 / 2 : ℝ) := by
    simpa using abs_add_le t (1 / 2 : ℝ)
  unfold jensenOuterRadius at himle
  linarith [htri, himle, htabs]

theorem norm_riemannZeta_jensenCenter_ge (t : ℝ) :
    (1 / 3 : ℝ) ≤ ‖riemannZeta (jensenCenter t)‖ := by
  simpa [jensenCenter] using zeta_lower_bound_two (t + 1 / 2)

theorem riemannZeta_jensenCenter_ne_zero (t : ℝ) : riemannZeta (jensenCenter t) ≠ 0 :=
  riemannZeta_ne_zero_of_two_le_re (by simp [jensenCenter])

theorem divisor_riemannZeta_eq_zeroMult {c : ℂ} {r : ℝ} {ρ : ℂ}
    (han : AnalyticOnNhd ℂ riemannZeta (closedBall c |r|))
    (hρ : ρ ∈ closedBall c |r|) (hρz : IsNontrivialZero ρ) :
    divisor riemannZeta (closedBall c |r|) ρ = (zeroMult ρ : ℤ) := by
  have hρ1 : ρ ≠ 1 := by
    intro heq
    have : (0 : ℝ) < ρ.re ∧ ρ.re < 1 := ⟨hρz.2.1, hρz.2.2⟩
    simp [heq] at this
  rw [AnalyticOnNhd.divisor_apply han hρ]
  have hnetop := analyticOrderAt_riemannZeta_ne_top hρ1
  unfold zeroMult
  obtain ⟨n, hn⟩ := ENat.ne_top_iff_exists.mp hnetop
  simp [← hn]

/-- Mathlib Jensen applied to ζ. -/
theorem riemannZeta_sum_divisor_le {c : ℂ} {r R M : ℝ}
    (hr : 0 < |r|) (hrR : |r| < |R|) (hM : 1 ≤ M)
    (han : AnalyticOnNhd ℂ riemannZeta (closedBall c |R|))
    (hne : riemannZeta c ≠ 0)
    (hbd : ∀ z ∈ sphere c |R|, ‖riemannZeta z‖ ≤ M) :
    ∑ᶠ u, divisor riemannZeta (closedBall c |r|) u ≤
      Real.log (M / ‖riemannZeta c‖) / Real.log (R / r) :=
  AnalyticOnNhd.sum_divisor_le hr hrR hM han hne hbd

/-- Half-window multiplicity ≤ Jensen ℤ-divisor sum on the inner disc. -/
theorem Nhalf_le_sum_divisor_jensen (t : ℝ)
    (han : AnalyticOnNhd ℂ riemannZeta
      (closedBall (jensenCenter t) |jensenInnerRadius|)) :
    (Nhalf t (t + 1) : ℤ) ≤
      ∑ᶠ u, divisor riemannZeta (closedBall (jensenCenter t) |jensenInnerRadius|) u := by
  classical
  set c := jensenCenter t
  set B := closedBall c |jensenInnerRadius|
  set W := zerosInHalf t (t + 1)
  have hWfin : W.Finite := zerosInHalf_finite t (t + 1)
  have hWsub : W ⊆ B := by
    intro ρ hρ
    simpa [B, jensenInner_abs] using zerosInHalf_unit_subset_jensenInner t hρ
  have hN : (Nhalf t (t + 1) : ℤ) = ∑ ρ ∈ hWfin.toFinset, (zeroMult ρ : ℤ) := by
    unfold Nhalf
    rw [finsum_mem_eq_finite_toFinset_sum _ hWfin]
    simp [Nat.cast_sum]
  have hdiv :
      ∑ ρ ∈ hWfin.toFinset, (zeroMult ρ : ℤ) =
        ∑ ρ ∈ hWfin.toFinset, divisor riemannZeta B ρ :=
    Finset.sum_congr rfl fun ρ hρ => by
      have hρW : ρ ∈ W := hWfin.mem_toFinset.1 hρ
      exact (divisor_riemannZeta_eq_zeroMult han (hWsub hρW) hρW.1.1).symm
  have hfinSupp : (Function.support (divisor riemannZeta B)).Finite :=
    (divisor riemannZeta B).finiteSupport (isCompact_closedBall _ _)
  have himg : hWfin.toFinset ⊆ hfinSupp.toFinset := by
    intro ρ hρ
    have hρW : ρ ∈ W := hWfin.mem_toFinset.1 hρ
    have hne : divisor riemannZeta B ρ ≠ 0 := by
      rw [divisor_riemannZeta_eq_zeroMult han (hWsub hρW) hρW.1.1]
      exact Nat.cast_ne_zero.mpr (ne_of_gt (Nat.lt_of_lt_of_le Nat.zero_lt_one
        (one_le_zeroMult hρW.1.1)))
    exact hfinSupp.mem_toFinset.2 (Function.mem_support.mpr hne)
  have hsumW :
      ∑ ρ ∈ hWfin.toFinset, divisor riemannZeta B ρ ≤
        ∑ u ∈ hfinSupp.toFinset, divisor riemannZeta B u :=
    Finset.sum_le_sum_of_subset_of_nonneg himg fun _ _ _ => han.divisor_nonneg _
  have hsumSupp :
      ∑ u ∈ hfinSupp.toFinset, divisor riemannZeta B u =
        ∑ᶠ u, divisor riemannZeta B u :=
    (finsum_eq_sum_of_support_subset (f := (divisor riemannZeta B : ℂ → ℤ))
      (fun u hu => hfinSupp.mem_toFinset.2 hu)).symm
  rw [hN, hdiv]
  exact hsumW.trans_eq hsumSupp

/-- Strip growth ⇒ half-count log bound via Jensen + geometry. -/
theorem growthImpliesHalfCount : ZetaRightStripGrowth → HalfCountLogBound := by
  intro hG
  obtain ⟨A, C, hC, hbd₀⟩ := hG
  set Aplus : ℝ := max A 0
  have hA0 : 0 ≤ Aplus := le_max_right _ _
  set K : ℝ := C * (2 : ℝ) ^ Aplus
  have hK : 0 < K := mul_pos hC (Real.rpow_pos_of_pos (by norm_num) _)
  have hr : 0 < |jensenInnerRadius| := by simpa [jensenInner_abs] using jensenInner_pos
  have hrR : |jensenInnerRadius| < |jensenOuterRadius| := by
    simpa [jensenInner_abs, jensenOuter_abs] using jensenInner_lt_outer
  have hκpos : 0 < Real.log (jensenOuterRadius / jensenInnerRadius) := by
    apply Real.log_pos
    exact (one_lt_div jensenInner_pos).mpr jensenInner_lt_outer
  set κ : ℝ := Real.log (jensenOuterRadius / jensenInnerRadius)
  have hlog7 : (1 : ℝ) ≤ Real.log 7 := by
    have he : Real.exp 1 ≤ 7 := by
      have := Real.exp_one_lt_d9
      norm_num at this ⊢; linarith
    have : Real.log (Real.exp 1) ≤ Real.log 7 :=
      Real.log_le_log (Real.exp_pos _) he
    rwa [Real.log_exp] at this
  set A₁ : ℝ := (Real.log 3 + Real.log (1 + K) + Aplus) / κ + 1
  have hA₁ : 0 < A₁ := by
    have hnum : 0 ≤ Real.log 3 + Real.log (1 + K) + Aplus :=
      add_nonneg (add_nonneg (Real.log_nonneg (by norm_num))
        (Real.log_nonneg (by linarith [hK] : (1 : ℝ) ≤ 1 + K))) hA0
    positivity
  refine ⟨A₁, hA₁, fun t ht => ?_⟩
  have han := analyticOnNhd_riemannZeta_jensenOuter ht
  have han_inner : AnalyticOnNhd ℂ riemannZeta
      (closedBall (jensenCenter t) |jensenInnerRadius|) :=
    han.mono (closedBall_subset_closedBall hrR.le)
  set M : ℝ := 1 + K * (|t| + 3) ^ Aplus
  have hM1 : 1 ≤ M := by
    have : 0 ≤ K * (|t| + 3) ^ Aplus :=
      mul_nonneg hK.le (Real.rpow_nonneg (by linarith [abs_nonneg t]) _)
    linarith
  have hbd : ∀ z ∈ sphere (jensenCenter t) |jensenOuterRadius|, ‖riemannZeta z‖ ≤ M := by
    intro z hz
    have hζ := hbd₀ z (mem_jensenOuterSphere_re_ge hz) (mem_jensenOuterSphere_dist_one ht hz)
    have him : |z.im| + 3 ≤ 2 * (|t| + 3) := by
      have := mem_jensenOuterSphere_im_le hz
      nlinarith [this, abs_nonneg t]
    have hbase : (1 : ℝ) ≤ |z.im| + 3 := by linarith [abs_nonneg z.im]
    have hpow : (|z.im| + 3) ^ A ≤ (|z.im| + 3) ^ Aplus :=
      Real.rpow_le_rpow_of_exponent_le hbase (le_max_left _ _)
    have hpow2 : (|z.im| + 3) ^ Aplus ≤ (2 * (|t| + 3)) ^ Aplus :=
      Real.rpow_le_rpow (by linarith [abs_nonneg z.im]) him hA0
    have h2 : (2 * (|t| + 3)) ^ Aplus = (2 : ℝ) ^ Aplus * (|t| + 3) ^ Aplus :=
      Real.mul_rpow (by norm_num) (by linarith [abs_nonneg t])
    have hbound : C * (|z.im| + 3) ^ A ≤ K * (|t| + 3) ^ Aplus := by
      calc C * (|z.im| + 3) ^ A ≤ C * (|z.im| + 3) ^ Aplus :=
            mul_le_mul_of_nonneg_left hpow hC.le
        _ ≤ C * ((2 : ℝ) ^ Aplus * (|t| + 3) ^ Aplus) := by
            rw [← h2]; exact mul_le_mul_of_nonneg_left hpow2 hC.le
        _ = K * (|t| + 3) ^ Aplus := by unfold K; ring
    exact (hζ.trans hbound).trans (by linarith)
  have hjensen := riemannZeta_sum_divisor_le (c := jensenCenter t)
    (r := jensenInnerRadius) (R := jensenOuterRadius) (M := M)
    hr hrR hM1 han (riemannZeta_jensenCenter_ne_zero t) hbd
  have hNℤ := Nhalf_le_sum_divisor_jensen t han_inner
  have hζc := norm_riemannZeta_jensenCenter_ge t
  have hMζ : M / ‖riemannZeta (jensenCenter t)‖ ≤ 3 * M := by
    have hpos : 0 < ‖riemannZeta (jensenCenter t)‖ :=
      lt_of_lt_of_le (by norm_num : (0 : ℝ) < 1 / 3) hζc
    have : 1 / ‖riemannZeta (jensenCenter t)‖ ≤ (3 : ℝ) := by
      have := (one_div_le_one_div hpos (by norm_num : (0 : ℝ) < 1 / 3)).mpr hζc
      simpa using this
    calc M / ‖riemannZeta (jensenCenter t)‖
        = M * (1 / ‖riemannZeta (jensenCenter t)‖) := div_eq_mul_one_div _ _
      _ ≤ M * 3 := mul_le_mul_of_nonneg_left this (by linarith)
      _ = 3 * M := by ring
  have hL : (1 : ℝ) ≤ (|t| + 3) ^ Aplus := by
    have : (1 : ℝ) ≤ |t| + 3 := by linarith [abs_nonneg t]
    simpa [Real.rpow_zero] using Real.one_le_rpow this hA0
  have hMbound : M ≤ (1 + K) * (|t| + 3) ^ Aplus := by
    unfold M; nlinarith [hK.le, hL]
  have hlogM : Real.log (M / ‖riemannZeta (jensenCenter t)‖) ≤
      Real.log 3 + Real.log (1 + K) + Aplus * Real.log (|t| + 3) := by
    have hpos_div : 0 < M / ‖riemannZeta (jensenCenter t)‖ := by
      have : 0 < ‖riemannZeta (jensenCenter t)‖ := lt_of_lt_of_le (by norm_num) hζc
      positivity
    have hle3 : Real.log (M / ‖riemannZeta (jensenCenter t)‖) ≤ Real.log (3 * M) :=
      Real.log_le_log hpos_div hMζ
    have h3M : Real.log (3 * M) = Real.log 3 + Real.log M :=
      Real.log_mul (by norm_num) (by linarith : M ≠ 0)
    have hposM : 0 < M := by linarith
    have hlogMb : Real.log M ≤ Real.log ((1 + K) * (|t| + 3) ^ Aplus) :=
      Real.log_le_log hposM hMbound
    have hsplit : Real.log ((1 + K) * (|t| + 3) ^ Aplus) =
        Real.log (1 + K) + Aplus * Real.log (|t| + 3) := by
      have h1K : 0 < 1 + K := by linarith
      have hLpos : 0 < (|t| + 3) ^ Aplus :=
        Real.rpow_pos_of_pos (by linarith [abs_nonneg t]) _
      rw [Real.log_mul h1K.ne' hLpos.ne', Real.log_rpow (by linarith [abs_nonneg t])]
    linarith [hle3.trans_eq h3M, hlogMb.trans_eq hsplit]
  have hsumℝ :
      ((∑ᶠ u, divisor riemannZeta
          (closedBall (jensenCenter t) |jensenInnerRadius|) u : ℤ) : ℝ) ≤
        Real.log (M / ‖riemannZeta (jensenCenter t)‖) / κ := by
    simpa [κ, jensenInner_abs, jensenOuter_abs] using hjensen
  have hN : (Nhalf t (t + 1) : ℝ) ≤
      Real.log (M / ‖riemannZeta (jensenCenter t)‖) / κ := by
    have : ((Nhalf t (t + 1) : ℤ) : ℝ) ≤
        ((∑ᶠ u, divisor riemannZeta
            (closedBall (jensenCenter t) |jensenInnerRadius|) u : ℤ) : ℝ) :=
      Int.cast_le.mpr hNℤ
    exact this.trans hsumℝ
  have hge1 : (1 : ℝ) ≤ Real.log (|t| + 3) :=
    le_trans hlog7 (Real.log_le_log (by norm_num) (by linarith [abs_nonneg t, ht]))
  have hnum : Real.log (M / ‖riemannZeta (jensenCenter t)‖) ≤
      (Real.log 3 + Real.log (1 + K) + Aplus) * Real.log (|t| + 3) := by
    have h1 : Real.log 3 + Real.log (1 + K) ≤
        (Real.log 3 + Real.log (1 + K)) * Real.log (|t| + 3) := by
      nlinarith [add_nonneg (Real.log_nonneg (by norm_num : (1 : ℝ) ≤ 3))
        (Real.log_nonneg (by linarith [hK] : (1 : ℝ) ≤ 1 + K)), hge1]
    have : Real.log 3 + Real.log (1 + K) + Aplus * Real.log (|t| + 3) ≤
        (Real.log 3 + Real.log (1 + K) + Aplus) * Real.log (|t| + 3) := by
      nlinarith [h1, hA0, (log_abs_add_three_pos t).le]
    exact hlogM.trans this
  have hfinal : Real.log (M / ‖riemannZeta (jensenCenter t)‖) / κ ≤
      A₁ * Real.log (|t| + 3) := by
    have hle : Real.log (M / ‖riemannZeta (jensenCenter t)‖) / κ ≤
        (Real.log 3 + Real.log (1 + K) + Aplus) * Real.log (|t| + 3) / κ :=
      div_le_div_of_nonneg_right hnum hκpos.le
    have hrearr :
        (Real.log 3 + Real.log (1 + K) + Aplus) * Real.log (|t| + 3) / κ =
          ((Real.log 3 + Real.log (1 + K) + Aplus) / κ) * Real.log (|t| + 3) := by
      ring
    have hcoef : (Real.log 3 + Real.log (1 + K) + Aplus) / κ ≤ A₁ := by
      unfold A₁; linarith
    have : ((Real.log 3 + Real.log (1 + K) + Aplus) / κ) * Real.log (|t| + 3) ≤
        A₁ * Real.log (|t| + 3) :=
      mul_le_mul_of_nonneg_right hcoef (log_abs_add_three_pos t).le
    exact hle.trans (hrearr.symm ▸ this)
  exact hN.trans hfinal

/-- Named invent step Prop (discharged by `growthImpliesHalfCount`). -/
def GrowthImpliesHalfCount : Prop := ZetaRightStripGrowth → HalfCountLogBound

theorem GrowthImpliesHalfCount.proof : GrowthImpliesHalfCount := growthImpliesHalfCount

/-- Awareness bridge: half-bound packaging discharges local_count shape. -/
theorem inventRvMLike_local_count_of_halfBound (hH : HalfCountLogBound) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t : ℝ,
      (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) :=
  RiemannVonMangoldtLocalCount_of_halfBound hH

/-- Composition: strip growth ⇒ InventRvMLike.local_count shape. -/
theorem inventRvMLike_local_count_of_growth (hG : ZetaRightStripGrowth) :
    ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t : ℝ,
      (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3) :=
  inventRvMLike_local_count_of_halfBound (growthImpliesHalfCount hG)

/-- Composition: strip growth ⇒ classical local_count Prop. -/
theorem RiemannVonMangoldtLocalCount_of_growth (hG : ZetaRightStripGrowth) :
    RiemannVonMangoldtLocalCount :=
  RiemannVonMangoldtLocalCount_of_halfBound (growthImpliesHalfCount hG)

/-- Path theorem retained for awareness naming. -/
theorem RiemannVonMangoldtLocalCount_of_growth_path
    (hPath : GrowthImpliesHalfCount) (hG : ZetaRightStripGrowth) :
    RiemannVonMangoldtLocalCount :=
  RiemannVonMangoldtLocalCount_of_halfBound (hPath hG)

end
