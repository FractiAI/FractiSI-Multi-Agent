import RiemannExpedition.ProportionLadder

/-!
# Agent contribution · proportion-ladder samples

Written inside the ablation clock by the `lemma-proportion` agent (FractiSI arm)
or by sequential file write (no-kit arm). Same frozen payload bytes both arms.
-/

namespace RiemannExpedition.AgentProportion

open RiemannExpedition.ProportionLadder

/-- Levinson-scale toy sample (333/1000), non-vacuous (`total > 0`). -/
def toyLevinsonSample : FiniteZeroSample where
  total := 1000
  onLine := 333
  onLine_le_total := by decide

theorem toy_meets_levinson_bound :
    MeetsLowerBound toyLevinsonSample levinsonBound := by
  unfold MeetsLowerBound toyLevinsonSample levinsonBound
  decide

/-- Five-twelfths-scale toy sample (416/1000). -/
def toyFiveTwelfthsSample : FiniteZeroSample where
  total := 1000
  onLine := 416
  onLine_le_total := by decide

theorem toy_meets_fiveTwelfths_bound :
    MeetsLowerBound toyFiveTwelfthsSample fiveTwelfthsBound := by
  unfold MeetsLowerBound toyFiveTwelfthsSample fiveTwelfthsBound
  decide

/-- Weaker millesimal bounds are easier to meet (non-vacuous form). -/
theorem meets_of_le_bound (s : FiniteZeroSample) {b₁ b₂ : Millesimal}
    (hle : b₁ ≤ b₂) (h : MeetsLowerBound s b₂) : MeetsLowerBound s b₁ := by
  unfold MeetsLowerBound at *
  exact ⟨h.1, Nat.le_trans (Nat.mul_le_mul_right s.total hle) h.2⟩

theorem anthropic_sample_meets_fiveTwelfths :
    MeetsLowerBound toyAnthropicSample fiveTwelfthsBound :=
  meets_of_le_bound toyAnthropicSample
    (Nat.le_of_lt fiveTwelfths_lt_anthropic2026) toy_meets_anthropic_bound

theorem anthropic_sample_meets_levinson :
    MeetsLowerBound toyAnthropicSample levinsonBound :=
  meets_of_le_bound toyAnthropicSample
    (Nat.le_trans (Nat.le_of_lt levinson_lt_fiveTwelfths)
      (Nat.le_of_lt fiveTwelfths_lt_anthropic2026))
    toy_meets_anthropic_bound

def provedLemmaCount : Nat := 5

end RiemannExpedition.AgentProportion
