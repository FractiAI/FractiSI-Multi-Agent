import RiemannExpedition.Honesty
import RiemannExpedition.CriticalLine
import RiemannExpedition.ProportionLadder
import RiemannExpedition.AgentCritical
import RiemannExpedition.AgentProportion

/-!
# Phase 0 — scaffold lemmas (must compile with no incomplete proofs)

Success for Phase 0 = `lake build` green on this module tree.
Agent payloads `AgentCritical` / `AgentProportion` are composed here.
-/

namespace RiemannExpedition.Phase0

open RiemannExpedition.CriticalLine
open RiemannExpedition.ProportionLadder
open RiemannExpedition.AgentCritical
open RiemannExpedition.AgentProportion

/-- Count of Phase-0 lemmas we treat as the timing baseline set. -/
def provedLemmaCount : Nat :=
  AgentCritical.provedLemmaCount + AgentProportion.provedLemmaCount + 2

/-- Bundle: critical-line half + off-line + finite sample (not RH). -/
theorem critical_line_bundle :
    OnCriticalLine half ∧
    ¬ OnCriticalLine offLine ∧
    FiniteSampleOnCriticalLine scaffoldZeros :=
  ⟨half_on_critical_line, offLine_not_on_critical_line, scaffoldZeros_all_on_critical_line⟩

/-- Bundle: proportion ladder ordering + Anthropic improvement arithmetic. -/
theorem proportion_bundle :
    levinsonBound < fiveTwelfthsBound ∧
    fiveTwelfthsBound < anthropic2026Bound ∧
    anthropic2026Bound < fullThousand ∧
    anthropicImprovement = 256 ∧
    MeetsLowerBound toyAnthropicSample anthropic2026Bound ∧
    ¬ MeetsLowerBound toyAnthropicSample fullThousand :=
  ⟨levinson_lt_fiveTwelfths, fiveTwelfths_lt_anthropic2026, anthropic2026_lt_fullThousand,
    anthropicImprovement_eq_256, toy_meets_anthropic_bound, toy_misses_fullThousand⟩

/-- Phase 0 integrity: honesty string is non-empty (kernel `decide` only). -/
theorem honesty_status_nonempty :
    RiemannExpedition.Honesty.rhClaimStatus.length > 0 := by decide

end RiemannExpedition.Phase0
