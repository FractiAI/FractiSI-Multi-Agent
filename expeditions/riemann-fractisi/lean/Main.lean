import RiemannExpedition

/-!
# Riemann Expedition · build check

Thin executable: imports the library and prints a status line.
Does **not** claim the Riemann hypothesis.
-/

def main : IO Unit := do
  IO.println "riemann-expedition · scaffold OK"
  IO.println s!"phase0 lemmas proved: {RiemannExpedition.Phase0.provedLemmaCount}"
  IO.println s!"phaseN lemmas proved: {RiemannExpedition.PhaseN.provedLemmaCount}"
  IO.println s!"phaseN marker: {RiemannExpedition.PhaseN.phaseMarker}"
  IO.println s!"RH claim status: {RiemannExpedition.Honesty.rhClaimStatus}"
