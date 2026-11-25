/-
FractiSI invent — prime-side / Chebyshev-trace scaffolding (Challenge-only).
NO import of Anthropic Zeta23.

Closed here from Mathlib + InventAnalytic cheb1* + InventTraces + InventWeil:
  · Chebyshev envelopes: ψ / Σ Λ² / Σ Λ/√n as prime-side trace skeletons
  · paper-shaped majorants feeding frGh ≤ TraceCoeff λ · N + R₂ shape
  · TestC2 / paperFT support majorants on weighted prime sums
  · residualFamily packaging from Chebyshev O-rates that are o(N)
  · InventTracesAt / InventTracesLike reductions from Chebyshev envelopes
  · of_traces_residual / of_weil_herr assembly when analytic witnesses exist

Classical target (comments only — not claimed):
  InventTracesLike λ from Weil EF · prime Chebyshev control of trGh ≈ N, frGh ≪ c(λ)·N.
GAP: full Weil explicit-formula contour (zero tsum = arch + prime + poles) and the
identification of spectral (trGh, frGh) with Chebyshev envelopes remain invent beyond
Mathlib. Do **not** treat Solution 17/17 or InventClassicalMainInputs as discharged.
-/
import InventTraces
import InventWeil
import InventAnalytic
import Mathlib.NumberTheory.Chebyshev
import Mathlib.NumberTheory.ArithmeticFunction.VonMangoldt

open Real Filter Asymptotics Topology Finset Complex
open ArithmeticFunction hiding log id
open Chebyshev
open scoped BigOperators

noncomputable section

/-! ## Chebyshev envelopes (prime-side trace skeletons)

These are the Mathlib-visible prime sums that classical Weil EF would feed into
`trGh` / `frGh` once the contour invent closes. Bounds come from InventAnalytic
`cheb1a`–`cheb1d`. -/

/-- Prime-side Chebyshev ψ-trace: Σ_{n≤x} Λ(n). -/
def primePsiTrace (x : ℝ) : ℝ := ψ x

/-- Frobenius-type second moment: Σ_{n≤x} Λ(n)² (cheb1d skeleton). -/
def primeFrobeniusMoment (x : ℝ) : ℝ :=
  ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n ^ 2

/-- Abel-weighted prime sum: Σ_{n≤x} Λ(n)/√n (cheb1b skeleton). -/
def primeWeightedTrace (x : ℝ) : ℝ :=
  ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / Real.sqrt n

/-- Log-weighted Abel sum: Σ_{n≤x} Λ(n)/(√n log n) (cheb1c skeleton). -/
def primeLogWeightedTrace (x : ℝ) : ℝ :=
  ∑ n ∈ Ioc 0 ⌊x⌋₊, Λ n / (Real.sqrt n * Real.log n)

theorem primePsiTrace_eq_psi (x : ℝ) : primePsiTrace x = ψ x := rfl

theorem primePsiTrace_nonneg (x : ℝ) : 0 ≤ primePsiTrace x :=
  psi_nonneg x

theorem primeFrobeniusMoment_nonneg (x : ℝ) : 0 ≤ primeFrobeniusMoment x :=
  Finset.sum_nonneg fun _ _ => sq_nonneg _

theorem primeWeightedTrace_nonneg (x : ℝ) : 0 ≤ primeWeightedTrace x :=
  Finset.sum_nonneg fun _ _ =>
    div_nonneg vonMangoldt_nonneg (Real.sqrt_nonneg _)

/-! ### cheb1a–d → envelope majorants -/

/-- cheb1a: ψ x ≤ (log 4 + 4) · x. -/
theorem primePsiTrace_le {x : ℝ} (hx : 0 ≤ x) :
    primePsiTrace x ≤ (Real.log 4 + 4) * x := by
  simpa [primePsiTrace] using cheb1a_explicit hx

/-- cheb1d: Σ Λ² ≤ (log 4 + 4) · x · log x (x ≥ 1). -/
theorem primeFrobeniusMoment_le {x : ℝ} (hx : 1 ≤ x) :
    primeFrobeniusMoment x ≤ (Real.log 4 + 4) * x * Real.log x := by
  simpa [primeFrobeniusMoment] using cheb1d_explicit hx

/-- cheb1b: Σ Λ/√n ≤ (2 log 4 + 16) · √x (x ≥ 1). -/
theorem primeWeightedTrace_le {x : ℝ} (hx : 1 ≤ x) :
    primeWeightedTrace x ≤ (2 * Real.log 4 + 16) * Real.sqrt x := by
  simpa [primeWeightedTrace] using cheb1b_explicit hx

/-- cheb1b paper form: ≤ 3√x for large x. -/
theorem primeWeightedTrace_three {x : ℝ}
    (hx : max 1 ((48 / (3 - 2 * Real.log 4)) ^ 4) ≤ x) :
    primeWeightedTrace x ≤ 3 * Real.sqrt x := by
  simpa [primeWeightedTrace] using cheb1b_three_explicit hx

/-- cheb1c: Σ Λ/(√n log n) ≤ C · √x / log x (x ≥ 2). -/
theorem primeLogWeightedTrace_le {x : ℝ} (hx : 2 ≤ x) :
    primeLogWeightedTrace x ≤
      (4 * Real.log 4 + 40) * Real.sqrt x / Real.log x := by
  simpa [primeLogWeightedTrace] using cheb1c_explicit hx

/-! ## Spectral / Frobenius majorants toward frGh ≤ c(λ)·N + R₂ -/

/-- Chebyshev second-moment majorant rewritten as `C · x · log x`. -/
theorem primeFrobenius_isBigO_x_log :
    ∃ C : ℝ, ∀ x : ℝ, 2 ≤ x →
      primeFrobeniusMoment x ≤ C * x * Real.log x :=
  ⟨Real.log 4 + 4, fun x hx => primeFrobeniusMoment_le (by linarith)⟩

/-- Weighted prime sum is O(√x). -/
theorem primeWeighted_isBigO_sqrt :
    ∃ C : ℝ, ∀ x : ℝ, 1 ≤ x →
      primeWeightedTrace x ≤ C * Real.sqrt x :=
  ⟨2 * Real.log 4 + 16, fun _ hx => primeWeightedTrace_le hx⟩

/-- Concrete cheb1d slack: if `fr ≤ C · x · log x` and that majorant sits under
`TraceCoeff λ · N + R₂`, the InventTracesAt fr-bound holds. -/
theorem frGh_le_of_primeFrobenius_majorant
    {lam N fr R₂ C x : ℝ}
    (hfr : fr ≤ C * x * Real.log x)
    (hmaj : C * x * Real.log x ≤ TraceCoeff lam * N + R₂) :
    fr ≤ TraceCoeff lam * N + R₂ :=
  le_trans hfr hmaj

/-- Package InventTracesAt from exact trGh = N and a Chebyshev-controlled frGh. -/
theorem InventTracesAt.of_prime_chebyshev_envelope
    {lam N0 N frGh C x R₂ : ℝ}
    (h0 : 4 * N - frGh - 2 * N ≤ N0)
    (hfr : frGh ≤ C * x * Real.log x)
    (hmaj : C * x * Real.log x ≤ TraceCoeff lam * N + R₂) :
    InventTracesAt lam N0 N := by
  refine InventTracesAt.of_witnesses_coeff lam N0 N N frGh 0 0 R₂ 0
    le_rfl ?_ ?_ ?_
  · simpa using h0
  · simp
  · exact frGh_le_of_primeFrobenius_majorant hfr hmaj

/-- Same packaging with the explicit cheb1d constant and `frGh ≤ Σ Λ²`. -/
theorem InventTracesAt.of_primeFrobeniusMoment
    {lam N0 N x : ℝ} {frGh : ℝ}
    (hx : 1 ≤ x)
    (h0 : 4 * N - frGh - 2 * N ≤ N0)
    (hfr : frGh ≤ primeFrobeniusMoment x)
    (hmaj :
      (Real.log 4 + 4) * x * Real.log x ≤ TraceCoeff lam * N) :
    InventTracesAt lam N0 N := by
  have hC := primeFrobeniusMoment_le hx
  exact InventTracesAt.of_prime_chebyshev_envelope (R₂ := 0) h0
    (le_trans hfr hC) (by linarith)

/-- Full witness packaging: Chebyshev supplies R₂; spectral core supplies h0/htr. -/
theorem InventTracesAt.of_chebyshev_witnesses
    (lam N0 N trGh frGh B R₁ R₂ NII C x : ℝ)
    (hB : 0 ≤ B)
    (h0 : 4 * trGh - frGh - 2 * N - 3 * NII -
        B * (4 + 2 * Real.sqrt frGh + B) ≤ N0)
    (htr : |trGh - N| ≤ R₁)
    (hfr : frGh ≤ C * x * Real.log x)
    (hmaj : C * x * Real.log x ≤ TraceCoeff lam * N + R₂) :
    InventTracesAt lam N0 N :=
  InventTracesAt.of_witnesses_coeff lam N0 N trGh frGh B R₁ R₂ NII hB h0 htr
    (frGh_le_of_primeFrobenius_majorant hfr hmaj)

/-! ## TestC2 / paperFT → weighted prime-sum majorants

Classical Weil prime side against a compactly supported test weight `k` is bounded
by ‖k‖_∞ · Σ Λ(n)/√n on the support scale. Mathlib closes the majorant; the EF
identification of the zero tsum with this sum remains GAP. -/

/-- Formal prime-side Weil skeleton against a real weight (awareness def). -/
def primeWeilSum (k : ℝ → ℝ) (X : ℝ) : ℝ :=
  ∑ n ∈ Ioc 0 ⌊X⌋₊, Λ n / Real.sqrt n * k (Real.log n)

/-- Pointwise bound: |k| ≤ M ⇒ |primeWeilSum| ≤ M · primeWeightedTrace. -/
theorem abs_primeWeilSum_le
    {k : ℝ → ℝ} {X M : ℝ}
    (hM : ∀ t, |k t| ≤ M) :
    |primeWeilSum k X| ≤ M * primeWeightedTrace X := by
  have hnn : 0 ≤ M :=
    le_trans (abs_nonneg (k 0)) (hM 0)
  have habs :
      |∑ n ∈ Ioc 0 ⌊X⌋₊, Λ n / Real.sqrt n * k (Real.log n)| ≤
        ∑ n ∈ Ioc 0 ⌊X⌋₊, |Λ n / Real.sqrt n * k (Real.log n)| :=
    Finset.abs_sum_le_sum_abs _ _
  refine le_trans habs ?_
  have hterm : ∀ n ∈ Ioc 0 ⌊X⌋₊,
      |Λ n / Real.sqrt n * k (Real.log n)| ≤
        M * (Λ n / Real.sqrt n) := by
    intro n hn
    have hΛ : 0 ≤ Λ n := vonMangoldt_nonneg
    have hs : 0 ≤ Real.sqrt (n : ℝ) := Real.sqrt_nonneg _
    have hquot : 0 ≤ Λ n / Real.sqrt n := div_nonneg hΛ hs
    calc
      |Λ n / Real.sqrt n * k (Real.log n)|
          = |Λ n / Real.sqrt n| * |k (Real.log n)| := abs_mul _ _
      _ = (Λ n / Real.sqrt n) * |k (Real.log n)| := by
            rw [abs_of_nonneg hquot]
      _ ≤ (Λ n / Real.sqrt n) * M :=
            mul_le_mul_of_nonneg_left (hM _) hquot
      _ = M * (Λ n / Real.sqrt n) := mul_comm _ _
  have hsum := Finset.sum_le_sum hterm
  calc
    ∑ n ∈ Ioc 0 ⌊X⌋₊, |Λ n / Real.sqrt n * k (Real.log n)|
        ≤ ∑ n ∈ Ioc 0 ⌊X⌋₊, M * (Λ n / Real.sqrt n) := hsum
    _ = M * ∑ n ∈ Ioc 0 ⌊X⌋₊, Λ n / Real.sqrt n := by rw [Finset.mul_sum]
    _ = M * primeWeightedTrace X := by rfl

/-- Combine with cheb1b: |primeWeilSum| ≤ M · C · √X. -/
theorem abs_primeWeilSum_le_sqrt
    {k : ℝ → ℝ} {X M : ℝ}
    (hX : 1 ≤ X) (hM : ∀ t, |k t| ≤ M) :
    |primeWeilSum k X| ≤ M * (2 * Real.log 4 + 16) * Real.sqrt X := by
  have h1 := abs_primeWeilSum_le (X := X) (M := M) hM
  have h2 := primeWeightedTrace_le hX
  have hM0 : 0 ≤ M := le_trans (abs_nonneg (k 0)) (hM 0)
  nlinarith [Real.sqrt_nonneg X]

/-- TestC2 complex weight: real/imag parts bound the prime Weil skeleton.
Uses ‖paperFT‖ decay only as an awareness bridge (FT of the weight); the
prime-sum majorant itself uses the compact-support L^∞ envelope. -/
theorem TestC2.primeWeil_majorant
    {L : ℝ} {f : ℝ → ℂ} (_hf : TestC2 L f) {X M : ℝ}
    (hX : 1 ≤ X)
    (hM : ∀ t, ‖f t‖ ≤ M) :
    |primeWeilSum (fun t => (f t).re) X| ≤
        M * (2 * Real.log 4 + 16) * Real.sqrt X ∧
      |primeWeilSum (fun t => (f t).im) X| ≤
        M * (2 * Real.log 4 + 16) * Real.sqrt X := by
  have hre : ∀ t, |(f t).re| ≤ M := fun t =>
    (abs_re_le_norm (f t)).trans (hM t)
  have him : ∀ t, |(f t).im| ≤ M := fun t =>
    (abs_im_le_norm (f t)).trans (hM t)
  exact ⟨abs_primeWeilSum_le_sqrt hX hre, abs_primeWeilSum_le_sqrt hX him⟩

/-- paperFT L¹ bound specialized as an L^∞·meas(supp) envelope for TestC2
(feeds oscillatory-integral control once EF invent closes). -/
theorem TestC2.paperFT_L1_envelope {L : ℝ} {f : ℝ → ℂ} (hf : TestC2 L f)
    (z : ℂ) :
    ‖paperFT f z‖ ≤ Real.exp (|z.im| * (L / 2)) * ∫ u, ‖f u‖ :=
  hf.norm_paperFT_bound z

/-! ## residualFamily from Chebyshev O-rates

When Chebyshev envelopes supply R₁ / R₂ / NII that are little-o of N on dyadic
windows, InventTraces.residualFamily packages the §6 err =o[N] half used by
`InventClassicalMainInputs.of_traces_residual`. -/

/-- Chebyshev-sourced residual family (constant TraceCoeff). -/
def chebyshevResidualFamily (lam : ℝ) (N B R₁ R₂ NII : ℝ → ℝ) : ℝ → ℝ :=
  residualFamily (fun _ => TraceCoeff lam) N B R₁ R₂ NII

theorem chebyshevResidualFamily_eq (lam : ℝ) (N B R₁ R₂ NII : ℝ → ℝ) :
    chebyshevResidualFamily lam N B R₁ R₂ NII =
      residualFamily (fun _ => TraceCoeff lam) N B R₁ R₂ NII :=
  rfl

/-- Rates from Chebyshev envelopes that are o(N) ⇒ residualFamily =o[N]. -/
theorem chebyshevResidualFamily_isLittleO {lam : ℝ} {N B R₁ R₂ NII : ℝ → ℝ}
    {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hc : ∀ᶠ _T : ℝ in atTop,
      (0 : ℝ) ≤ TraceCoeff lam ∧ TraceCoeff lam ≤ K) :
    chebyshevResidualFamily lam N B R₁ R₂ NII =o[atTop] N := by
  have hc' : ∀ᶠ T : ℝ in atTop,
      (0 : ℝ) ≤ (fun _ : ℝ => TraceCoeff lam) T ∧
        (fun _ : ℝ => TraceCoeff lam) T ≤ K := hc
  simpa [chebyshevResidualFamily] using
    (residualFamily_isLittleO (N := N) (R₁ := R₁) (R₂ := R₂) (NII := NII)
      (B := B) (c := fun _ : ℝ => TraceCoeff lam) (K := K)
      hN hR₁ hR₂ hNII hB hc')

/-- On the invent λ-window, TraceCoeff is nonnegative and ≤ 3. -/
theorem TraceCoeff_window_bound {lam : ℝ}
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1) :
    0 ≤ TraceCoeff lam ∧ TraceCoeff lam ≤ 3 := by
  refine ⟨?_, ?_⟩
  · have hpos : (0 : ℝ) < lam := lt_of_lt_of_le (by norm_num : (0 : ℝ) < 1 / 2) h1
    exact TraceCoeff_nonneg hpos
  · simpa [TraceCoeff] using c_lam_le_three h1 h2

/-- λ-window specialization of chebyshev residual little-o. -/
theorem chebyshevResidualFamily_isLittleO_window {lam : ℝ}
    {N B R₁ R₂ NII : ℝ → ℝ}
    (h1 : (1 : ℝ) / 2 ≤ lam) (h2 : lam < 1)
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0)) :
    chebyshevResidualFamily lam N B R₁ R₂ NII =o[atTop] N :=
  chebyshevResidualFamily_isLittleO hN hR₁ hR₂ hNII hB
    (Eventually.of_forall fun _ => TraceCoeff_window_bound h1 h2)

/-- Flat Chebyshev residual (B = R₁ = R₂ = NII = 0) is identically 0. -/
theorem chebyshevResidualFamily_zero (lam : ℝ) (N : ℝ → ℝ) :
    chebyshevResidualFamily lam N (fun _ => 0) (fun _ => 0) (fun _ => 0)
        (fun _ => 0) =o[atTop] N :=
  residualFamily_zero_isLittleO (fun _ => TraceCoeff lam) N

/-! ## InventTracesLike from Chebyshev envelope families

Reduction only: once an eventual family of Chebyshev-controlled witnesses exists,
`InventTracesLike` packages. Producing that family from Weil EF remains GAP. -/

/-- Build InventTracesLike from an eventual Chebyshev-envelope witness family. -/
theorem InventTracesLike.of_chebyshev_eventually {lam : ℝ}
    (h : ∀ᶠ T in atTop,
      ∃ trGh frGh B R₁ R₂ NII C x : ℝ,
        0 ≤ B ∧
          4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII -
              B * (4 + 2 * Real.sqrt frGh + B) ≤ (N0star T (2 * T) : ℝ) ∧
          |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁ ∧
          frGh ≤ C * x * Real.log x ∧
          C * x * Real.log x ≤
            TraceCoeff lam * (Ncount T (2 * T) : ℝ) + R₂) :
    InventTracesLike lam := by
  refine InventTracesLike.of_eventually_family ?_
  filter_upwards [h] with T ht
  obtain ⟨trGh, frGh, B, R₁, R₂, NII, C, x, hB, h0, htr, hfr, hmaj⟩ := ht
  exact ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr,
    frGh_le_of_primeFrobenius_majorant hfr hmaj⟩

/-- Ideal Chebyshev family: trGh = N, frGh ≤ TraceCoeff · N via a majorant. -/
theorem InventTracesLike.of_chebyshev_ideal_eventually {lam : ℝ}
    (h : ∀ᶠ T in atTop,
      ∃ frGh C x : ℝ,
        4 * (Ncount T (2 * T) : ℝ) - frGh - 2 * (Ncount T (2 * T) : ℝ) ≤
            (N0star T (2 * T) : ℝ) ∧
          frGh ≤ C * x * Real.log x ∧
          C * x * Real.log x ≤ TraceCoeff lam * (Ncount T (2 * T) : ℝ)) :
    InventTracesLike lam := by
  refine InventTracesLike.of_chebyshev_eventually ?_
  filter_upwards [h] with T ht
  obtain ⟨frGh, C, x, h0, hfr, hmaj⟩ := ht
  refine ⟨(Ncount T (2 * T) : ℝ), frGh, 0, 0, 0, 0, C, x, le_rfl, ?_, ?_, hfr, ?_⟩
  · simpa using h0
  · simp
  · linarith

/-! ## Classical-input assembly bridges

Wire Chebyshev residual families into the existing InventTraces /
InventWeil packaging theorems. Analytic discharge of the hypotheses remains GAP. -/

/-- `of_traces_residual` with the Chebyshev residual family spelling. -/
theorem InventClassicalMainInputs.of_chebyshev_traces_residual
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
      chebyshevResidualFamily lam (fun T => (Ncount T (2 * T) : ℝ)) B R₁ R₂ NII
        =o[atTop] fun T => (Ncount T (2 * T) : ℝ)) :
    InventClassicalMainInputs lam := by
  simpa [chebyshevResidualFamily] using
    InventClassicalMainInputs.of_traces_residual hrvm htr B R₁ R₂ NII trGh frGh
      hpack herr

/-- Assemble classical inputs from RvM + Chebyshev-traces + Weil residue rates.

GAP: discharging `InventTracesLike` and `WeilResidueRates` from the full Weil EF
contour + prime Chebyshev identification is not closed here (Solution 17/17 open). -/
theorem InventClassicalMainInputs.of_chebyshev_weil
    {lam : ℝ}
    (hrvm : InventRvMLike)
    (htr : InventTracesLike lam)
    (hW : WeilResidueRates lam) :
    InventClassicalMainInputs lam :=
  InventClassicalMainInputs.of_weil_herr hrvm htr hW

/-- Spectral witness shape matching `diagMoment` + Chebyshev fr envelope.
Awareness bridge: finite compressions (InventTraces) + prime Λ² (cheb1d). -/
theorem spectral_fr_le_chebyshev_diag
    {d : ℕ} (p q : Fin d → ℝ) {C x : ℝ}
    (_hp : ∀ i, 0 ≤ p i) (_hq : ∀ i, 0 ≤ q i)
    (hcomb : ∑ i, (p i + q i) ^ 2 ≤ C * x * Real.log x) :
    ∑ i, (p i + q i) ^ 2 ≤ C * x * Real.log x :=
  hcomb

/-! ## Named classical EF gap (not sorry'd)

The closed scaffolding above feeds `InventTracesAt` / `InventTracesLike` /
`residualFamily` / `of_traces_residual` / `of_weil_herr` once the analytic step
invents. What remains:

  GAP (classical Weil EF · prime side):
    · contour explicit formula: zero tsum = arch (Γ′/Γ) + prime (Λ-sums) + poles
    · identification trGh ≈ Ncount and frGh ≤ TraceCoeff λ · N + o(N) on dyadics
    · Tit86 local count for InventRvMLike
    · Ncount T (2T) → ∞ from classical RvM

Do **not** claim Solution 17/17 or unconditional MainEstimateHfunN0star. -/

/-- Prop alias: Chebyshev envelopes are ready; Weil EF discharge is not. -/
def ClassicalPrimeTraceScaffold (lam : ℝ) : Prop :=
  InventTracesLike lam

/-- Honesty marker: scaffold Prop is definitionally InventTracesLike;
closing it needs the GAP above, not a Mathlib rewrite. -/
theorem ClassicalPrimeTraceScaffold_iff (lam : ℝ) :
    ClassicalPrimeTraceScaffold lam ↔ InventTracesLike lam :=
  Iff.rfl

end
