/-
FractiSI invent — traces / block residual scaffolding (Challenge-only).
NO import of Anthropic Zeta23.

Closes algebraic residual rearrangements that feed InventTracesAt.
Analytic discharge of trGh / frGh bounds remains invent (Weil EF · prime side).
-/
import InventMainEstimate
import InventAnalytic

open Real

noncomputable section

/-- Nonnegative residual bound used in N0star_lower_H. -/
theorem residual_nonneg_of_parts {B R₁ R₂ NII N : ℝ}
    (hB : 0 ≤ B) (hR₁ : 0 ≤ R₁) (hR₂ : 0 ≤ R₂) (hNII : 0 ≤ NII)
    (_hN : 0 ≤ N) :
    0 ≤
      4 * R₁ + R₂ + 3 * NII +
        B * (4 + 2 * Real.sqrt ((1 + 1 / 3) * N + R₂) + B) := by
  have hsq : 0 ≤ Real.sqrt ((1 + 1 / 3) * N + R₂) := Real.sqrt_nonneg _
  positivity

/-- Package InventTracesAt from explicit numeric witnesses. -/
theorem InventTracesAt.of_witnesses
    (lam N0 N trGh frGh B R₁ R₂ NII : ℝ)
    (hB : 0 ≤ B)
    (h0 : 4 * trGh - frGh - 2 * N - 3 * NII - B * (4 + 2 * Real.sqrt frGh + B) ≤ N0)
    (htr : |trGh - N| ≤ R₁)
    (hfr : frGh ≤ (1 / lam + lam / 3) * N + R₂) :
    InventTracesAt lam N0 N :=
  ⟨trGh, frGh, B, R₁, R₂, NII, hB, h0, htr, hfr⟩

/-- Hfun packaging exists whenever InventTracesAt holds. -/
theorem Hfun_pack_of_InventTracesAt {lam N0 N : ℝ} (h : InventTracesAt lam N0 N) :
    ∃ err : ℝ, Hfun lam * N - err ≤ N0 :=
  exists_Hfun_pack_of_tracesAt h

end
