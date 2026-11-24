/-!
# Honesty boundary (machine-readable)

Keep these strings stable; the timing harness and report outline cite them.
-/

namespace RiemannExpedition.Honesty

/-- Human-facing status string for the RH claim. -/
def rhClaimStatus : String :=
  "OPEN — Riemann hypothesis is not proved in this repository"

/-- What a green `lake build` means for this expedition. -/
def passMeans : String :=
  "lake build succeeds; Phase-0/N claimed modules contain no sorry; RH remains unproved; analytic ζ formalization may still be deferred"

/-- Explicit non-claim. -/
theorem we_do_not_claim_RH : True := trivial

end RiemannExpedition.Honesty
