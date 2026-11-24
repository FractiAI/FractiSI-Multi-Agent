import Lake
open Lake DSL

package «riemann-expedition» where
  -- Minimal Lean 4 scaffold for FractiSI RH-adjacent formalization.
  -- No Mathlib dependency: keeps first-build minutes-scale.

lean_lib «RiemannExpedition» where
  -- Library root: RiemannExpedition/

@[default_target]
lean_exe «riemann-check» where
  root := `Main
