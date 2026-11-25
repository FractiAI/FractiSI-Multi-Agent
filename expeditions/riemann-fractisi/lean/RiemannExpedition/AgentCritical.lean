import RiemannExpedition.CriticalLine

/-!
# Agent contribution · critical-line bundle

Written inside the ablation clock by the `lemma-critical` agent (FractiSI arm)
or by sequential file write (no-kit arm). Same frozen payload bytes both arms.
-/

namespace RiemannExpedition.AgentCritical

open RiemannExpedition.CriticalLine

/-- Nonempty finite sample of modeled critical-line points (not Hardy infinitude). -/
theorem finite_sample_nonempty_on_line :
    scaffoldZeros ≠ [] ∧ FiniteSampleOnCriticalLine scaffoldZeros :=
  ⟨by decide, scaffoldZeros_all_on_critical_line⟩

/-- Half is on the line; off-line point is not. -/
theorem half_vs_offLine :
    OnCriticalLine half ∧ ¬ OnCriticalLine offLine :=
  ⟨half_on_critical_line, offLine_not_on_critical_line⟩

/-- Count of theorems in this agent payload. -/
def provedLemmaCount : Nat := 2

end RiemannExpedition.AgentCritical
