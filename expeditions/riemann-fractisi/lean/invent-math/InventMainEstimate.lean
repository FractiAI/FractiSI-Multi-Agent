/-
FractiSI invent — classical Prop packaging + §6 err =o[N] asymptotics → MainEstimateHfunN0star.
NO import of Anthropic Zeta23. No Lean axioms: Prop fields only.

Dependency: ChallengeDeps + InventMath + InventAnalytic (not InventEndgame — Endgame imports this).
ε-form reuse: InventMath.eps_form_of_isLittleO here; InventEndgame.glue_eps_of_littleO is the
Challenge-window specialization (do not re-prove).
-/
import ChallengeDeps
import InventMath
import InventAnalytic

open Filter Asymptotics Topology Real

noncomputable section

/-! ## Classical Prop inputs (RvM / traces / little-o package) -/

structure InventRvMLike : Prop where
  main : ∃ C T₀ : ℝ, ∀ T ≥ T₀,
    |(Ncount T (2 * T) : ℝ) -
        T / (2 * Real.pi) * Real.log (T / (2 * Real.pi))| ≤ C * Real.log T
  local_count : ∃ A₀ : ℝ, 1 ≤ A₀ ∧ ∀ t : ℝ,
    (Ncount t (t + 1) : ℝ) ≤ A₀ * Real.log (|t| + 3)

def InventTracesAt (lam N0 N : ℝ) : Prop :=
  ∃ (trGh frGh B R₁ R₂ NII : ℝ),
    0 ≤ B ∧
      4 * trGh - frGh - 2 * N - 3 * NII -
          B * (4 + 2 * Real.sqrt frGh + B) ≤ N0 ∧
      |trGh - N| ≤ R₁ ∧
      frGh ≤ (1 / lam + lam / 3) * N + R₂

structure InventTracesLike (lam : ℝ) : Prop where
  eventually : ∀ᶠ T in atTop,
    InventTracesAt lam (N0star T (2 * T) : ℝ) (Ncount T (2 * T) : ℝ)

def InventErrorLittleO (err : ℝ → ℝ) : Prop :=
  err =o[atTop] fun T => (Ncount T (2 * T) : ℝ)

structure InventClassicalMainInputs (lam : ℝ) : Prop where
  rvm : InventRvMLike
  traces : InventTracesLike lam
  herr : ∃ err : ℝ → ℝ,
    InventErrorLittleO err ∧
      ∀ᶠ T in atTop,
        ∃ (trGh frGh B R₁ R₂ NII : ℝ),
          0 ≤ B ∧
            4 * trGh - frGh - 2 * (Ncount T (2 * T) : ℝ) - 3 * NII -
                B * (4 + 2 * Real.sqrt frGh + B) ≤ (N0star T (2 * T) : ℝ) ∧
            |trGh - (Ncount T (2 * T) : ℝ)| ≤ R₁ ∧
            frGh ≤ (1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂ ∧
            err T =
              4 * R₁ + R₂ + 3 * NII +
                B *
                  (4 +
                    2 *
                      Real.sqrt
                        ((1 / lam + lam / 3) * (Ncount T (2 * T) : ℝ) + R₂) +
                    B)

theorem exists_Hfun_pack_of_tracesAt {lam N0 N : ℝ}
    (h : InventTracesAt lam N0 N) :
    ∃ err : ℝ, Hfun lam * N - err ≤ N0 := by
  obtain ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr⟩ := h
  exact ⟨_, N0star_lower_H (lam₁ := lam) hB h0 htr hfr⟩

theorem eps_form_of_classicalInputs {lam : ℝ}
    (h : InventClassicalMainInputs lam) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
      (Hfun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T) := by
  obtain ⟨err, herr_o, hpack⟩ := h.herr
  have hmain :
      ∀ᶠ T in atTop,
        Hfun lam * (Ncount T (2 * T) : ℝ) - err T ≤
          (N0star T (2 * T) : ℝ) := by
    filter_upwards [hpack] with T ht
    obtain ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr, herr_eq⟩ := ht
    have hH := N0star_lower_H (lam₁ := lam) hB h0 htr hfr
    simpa [herr_eq] using hH
  exact eps_form_of_isLittleO hmain
    (Eventually.of_forall fun _ => Nat.cast_nonneg _) herr_o

/-- λ-family H-estimate on dyadic windows — invent target feeding Theorem A. -/
def MainEstimateHfunN0star : Prop :=
  ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀,
      (Hfun lam - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)

theorem MainEstimateHfunN0star_of_classical
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 → InventClassicalMainInputs lam) :
    MainEstimateHfunN0star :=
  fun lam h1 h2 => eps_form_of_classicalInputs (h lam h1 h2)

/-! ## Zero-side little-o packaging (feeds MainEstimate via ε-form) -/

/-- Trace / boundary error package feeding N0star_lower_H at each large T. -/
structure ZeroSideMainInputs where
  /-- Eventually: H(λ) * N − err ≤ N0star on dyadic windows. -/
  hmain :
    ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∃ err : ℝ → ℝ,
        (∀ᶠ T in atTop,
          Hfun lam * (Ncount T (2 * T) : ℝ) - err T ≤ N0star T (2 * T)) ∧
        err =o[atTop] fun T => (Ncount T (2 * T) : ℝ)

structure InventHfunLittleOPack : Prop where
  hmain :
    ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∃ err : ℝ → ℝ,
        (∀ᶠ T in atTop,
          Hfun lam * (Ncount T (2 * T) : ℝ) - err T ≤
            (N0star T (2 * T) : ℝ)) ∧
          InventErrorLittleO err

/-- Glue helper: eventually H₀·N − err ≤ lower + err =o N ⇒ ε-form.
Reuses InventMath.eps_form_of_isLittleO (Challenge specialization lives in
InventEndgame as glue_eps_of_littleO — do not re-prove). -/
theorem glue_eps_abs {H₀ : ℝ} {N lower err : ℝ → ℝ}
    (hmain : ∀ᶠ T in atTop, H₀ * N T - err T ≤ lower T)
    (hN : ∀ᶠ T in atTop, 0 ≤ N T) (herr : err =o[atTop] N) :
    ∀ ε > 0, ∃ T₀, ∀ T ≥ T₀, (H₀ - ε) * N T ≤ lower T :=
  eps_form_of_isLittleO hmain hN herr

/-- Zero-side packaging ⇒ MainEstimate via abstract ε-form. -/
theorem mainEstimateHfun_of_zeroSide (h : ZeroSideMainInputs) :
    MainEstimateHfunN0star := by
  intro lam h1 h2
  obtain ⟨err, hmain, herr⟩ := h.hmain lam h1 h2
  exact glue_eps_abs hmain (Eventually.of_forall fun _ => Nat.cast_nonneg _) herr

theorem MainEstimateHfunN0star_of_littleOPack (h : InventHfunLittleOPack) :
    MainEstimateHfunN0star :=
  mainEstimateHfun_of_zeroSide ⟨fun lam h1 h2 => by
    obtain ⟨err, hm, ho⟩ := h.hmain lam h1 h2
    exact ⟨err, hm, ho⟩⟩

/-- Unconditional main estimate from discharged zero-side inputs. -/
theorem main_estimate_Hfun_N0star_of (h : ZeroSideMainInputs) : MainEstimateHfunN0star :=
  mainEstimateHfun_of_zeroSide h

/-- Package a uniform λ-family into ZeroSideMainInputs. -/
theorem ZeroSideMainInputs.of_uniform
    (h : ∀ lam : ℝ, (1 : ℝ) / 2 ≤ lam → lam < 1 →
      ∃ err : ℝ → ℝ,
        (∀ᶠ T in atTop,
          Hfun lam * (Ncount T (2 * T) : ℝ) - err T ≤ N0star T (2 * T)) ∧
        err =o[atTop] fun T => (Ncount T (2 * T) : ℝ)) :
    ZeroSideMainInputs :=
  ⟨h⟩

/-! ## Abstract Asymptotics for the §6 error package

Explicit error of `N0star_lower_H`:
  err T = 4·R₁ T + R₂ T + 3·NII T + B T·(4 + 2√(c T·N T + R₂ T) + B T) + δ T·N T

Mild hypotheses: N → ∞; R₁, R₂, NII = o(N); B → 0; δ → 0;
eventually 0 ≤ c T ≤ K. Then err = o(N). -/

/-- Bracket of the B-perturbation is O(N) when c is eventually bounded and R₂ = o(N). -/
theorem err_bracket_isBigO {N R₂ B c : ℝ → ℝ} {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₂ : R₂ =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hc : ∀ᶠ T in atTop, 0 ≤ c T ∧ c T ≤ K) :
    (fun T => 4 + 2 * Real.sqrt (c T * N T + R₂ T) + B T) =O[atTop] N := by
  have hK : 0 ≤ K := by
    obtain ⟨T, hT⟩ := hc.exists
    exact hT.1.trans hT.2
  refine IsBigO.of_bound (7 + 2 * K) ?_
  have hN1 : ∀ᶠ T in atTop, 1 ≤ N T := hN.eventually_ge_atTop 1
  have hR₂1 : ∀ᶠ T in atTop, ‖R₂ T‖ ≤ 1 * ‖N T‖ := hR₂.def one_pos
  have hB1 : B =o[atTop] (fun _ => (1 : ℝ)) := (isLittleO_one_iff ℝ).2 hB
  have hBb : ∀ᶠ T in atTop, ‖B T‖ ≤ 1 * ‖(1 : ℝ)‖ := hB1.def one_pos
  filter_upwards [hN1, hR₂1, hBb, hc] with T h1 h2 h3 h4
  have hN0 : 0 ≤ N T := by linarith
  simp only [Real.norm_eq_abs, abs_of_nonneg hN0, one_mul] at h2
  simp only [norm_one, mul_one, Real.norm_eq_abs] at h3
  have hin : c T * N T + R₂ T ≤ ((K + 1) * N T) ^ 2 := by
    have : R₂ T ≤ N T := (le_abs_self _).trans h2
    have hclN : c T * N T ≤ K * N T := mul_le_mul_of_nonneg_right h4.2 hN0
    have hKN : 1 ≤ (K + 1) * N T := by nlinarith
    calc
      c T * N T + R₂ T ≤ (K + 1) * N T := by linarith
      _ ≤ (K + 1) * N T * ((K + 1) * N T) :=
        le_mul_of_one_le_right (mul_nonneg (by linarith) hN0) hKN
      _ = ((K + 1) * N T) ^ 2 := by ring
  have hs : Real.sqrt (c T * N T + R₂ T) ≤ (K + 1) * N T :=
    Real.sqrt_le_iff.mpr ⟨by positivity, hin⟩
  simp only [Real.norm_eq_abs, abs_of_nonneg hN0]
  refine abs_le.mpr ⟨?_, ?_⟩
  · nlinarith [Real.sqrt_nonneg (c T * N T + R₂ T), abs_le.mp h3]
  · nlinarith [abs_le.mp h3]

/-- B · (4 + 2√(c·N + R₂) + B) = o(N) when B → 0 and the bracket is O(N). -/
theorem err_B_term_isLittleO {N R₂ B c : ℝ → ℝ} {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₂ : R₂ =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hc : ∀ᶠ T in atTop, 0 ≤ c T ∧ c T ≤ K) :
    (fun T => B T * (4 + 2 * Real.sqrt (c T * N T + R₂ T) + B T)) =o[atTop] N := by
  have hB1 : B =o[atTop] (fun _ => (1 : ℝ)) := (isLittleO_one_iff ℝ).2 hB
  have hbr := err_bracket_isBigO (N := N) (R₂ := R₂) (B := B) (c := c) (K := K) hN hR₂ hB hc
  simpa using hB1.mul_isBigO hbr

/-- If δ → 0 then δ · N = o(N). -/
theorem isLittleO_delta_mul_N {N δ : ℝ → ℝ}
    (hδ : Tendsto δ atTop (𝓝 0)) :
    (fun T => δ T * N T) =o[atTop] N := by
  have h1 : δ =o[atTop] fun _ => (1 : ℝ) := (isLittleO_one_iff ℝ).2 hδ
  simpa using h1.mul_isBigO (isBigO_refl N atTop)

/-- §6 explicit error is o(N).

Hypotheses: `N → ∞`; `R₁, R₂, NII = o(N)`; `B → 0`; `δ → 0`;
eventually `0 ≤ c T ≤ K`. -/
theorem err_isLittleO {N R₁ R₂ NII B c δ : ℝ → ℝ} {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hδ : Tendsto δ atTop (𝓝 0))
    (hc : ∀ᶠ T in atTop, 0 ≤ c T ∧ c T ≤ K) :
    (fun T =>
      4 * R₁ T + R₂ T + 3 * NII T +
        B T * (4 + 2 * Real.sqrt (c T * N T + R₂ T) + B T) + δ T * N T) =o[atTop] N := by
  have hlast := err_B_term_isLittleO (N := N) (R₂ := R₂) (B := B) (c := c) (K := K) hN hR₂ hB hc
  have hδN := isLittleO_delta_mul_N (N := N) (δ := δ) hδ
  exact
    (((hR₁.const_mul_left 4).add hR₂).add (hNII.const_mul_left 3)).add hlast |>.add hδN

/-- Flat δ = 0 specialization (paper E1 without moment slack). -/
theorem err_isLittleO_of_zero_delta {N R₁ R₂ NII B c : ℝ → ℝ} {K : ℝ}
    (hN : Tendsto N atTop atTop)
    (hR₁ : R₁ =o[atTop] N) (hR₂ : R₂ =o[atTop] N) (hNII : NII =o[atTop] N)
    (hB : Tendsto B atTop (𝓝 0))
    (hc : ∀ᶠ T in atTop, 0 ≤ c T ∧ c T ≤ K) :
    (fun T =>
      4 * R₁ T + R₂ T + 3 * NII T +
        B T * (4 + 2 * Real.sqrt (c T * N T + R₂ T) + B T)) =o[atTop] N := by
  simpa using
    err_isLittleO (N := N) (R₁ := R₁) (R₂ := R₂) (NII := NII) (B := B) (c := c)
      (δ := fun _ => (0 : ℝ)) (K := K) hN hR₁ hR₂ hNII hB tendsto_const_nhds hc

end
