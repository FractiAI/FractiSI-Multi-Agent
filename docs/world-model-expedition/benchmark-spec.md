# Benchmark Spec · Shared World Models Expedition

## Single command

```bash
npm run research:world-model-expedition
```

## Machine-readable outputs

| Artifact | Format |
|---|---|
| `experiments/world-model-expedition/results/raw/all_runs.jsonl` | JSONL episodes |
| `experiments/world-model-expedition/results/summary.json` | Aggregates + conclusions |
| `experiments/world-model-expedition/results/scaling.json` | N-agent curves |
| `experiments/world-model-expedition/results/grid_summary.json` | World × condition |

## Episode contract

Each OK episode returns raw metric families A–E, CIE secondary composite, adapter counters, and duplication stats when available. NOT_EXECUTABLE episodes return `{ status, reason }` only.

## Scaling grid

N ∈ {1,2,4,8,16,32} on knowledge world for independent, shared_text, shared_structured, fractisi_selective.

## Reproduction hook

Imports `runDiscoveryConvergenceBenchmark` from FractiSI Exp 002 (100×6-hop). This seed: flat 0/100 vs FractiSI 100/100, ops −85%, rounds −50%.

## CIE

Transparent secondary score. Raw metrics always reported first. Weights are not optimized for FractiSI.

→ ∞^∞
