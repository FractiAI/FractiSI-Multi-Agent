# Riemann Expedition · Lean 4.14 scaffold + matched ablation

Mathlib-free finite-sample ladder. RH stays **OPEN**.

## Matched trial (primary)

```bash
export PATH="$HOME/.elan/bin:$PATH"
lake build
node timing/run-ablation.mjs
```

| Arm | Meaning |
|---|---|
| no-kit | Sequential write of four agent modules + hard gate |
| FractiSI | Tasks → contributions → compose → git integrate + hard gate |

Hard gate: `lake build` + forbidden-token scan (`timing/hard-gate.mjs`).

## Legacy rebuild harness

```bash
node timing/run-expedition.mjs --phase N --tiny ../../../scripts/tiny.mjs
```

That path only times registry hooks + rebuild. Use `run-ablation.mjs` for the real comparison.

## Layout

```
RiemannExpedition/
  Honesty.lean
  CriticalLine.lean
  ProportionLadder.lean
  AgentCritical.lean      # written in-clock (ablation)
  AgentProportion.lean    # written in-clock (ablation)
  Phase0.lean             # written in-clock (ablation)
  PhaseN.lean             # written in-clock (ablation)
timing/
  run-ablation.mjs
  hard-gate.mjs
  run-expedition.mjs      # legacy
receipts/
```
