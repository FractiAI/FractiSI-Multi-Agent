# Riemann FractiSI · results report

**Status:** matched ablation shipped · RH **OPEN**  
**Harness:** `lean/timing/run-ablation.mjs`  
**Summary receipt:** `lean/receipts/riemann-fractisi-ablation-summary-5runs.json`

## Trial

Same frozen SHA-256 payload bytes for:

- `RiemannExpedition/AgentCritical.lean`
- `RiemannExpedition/AgentProportion.lean`
- `RiemannExpedition/Phase0.lean`
- `RiemannExpedition/PhaseN.lean`

| Arm | What happens inside the clock |
|---|---|
| no-kit | Sequential write of the four modules → hard gate |
| FractiSI | Four agents claim / contribute / compose / git-integrate → hard gate |

Hard gate = `lake build` green **and** code scan with no `sorry`, user `axiom`, or `native_decide` (comments/strings stripped).

## Five-run summary

| Metric | no-kit | FractiSI |
|---|---|---|
| Mean seconds | 1.294 | 10.844 |
| Stdev seconds | 0.066 | 4.664 |
| Hard gate | pass ×5 | pass ×5 |
| Tasks | 0 | 4 |
| Contributions | 0 | 4 |
| Compositions | 0 | 1 |

Mean delta (FractiSI − no-kit): **+9.55 s**.

## Interpretation

This is a real same-workload comparison of coordination path vs sequential write. It is **not** an LLM proof-search bake-off and **not** a 30 h vs 5.3 s efficiency claim (that lead remains withdrawn).

## Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd lean && node timing/run-ablation.mjs
```
