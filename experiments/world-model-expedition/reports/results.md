# Shared Rhyming World Models Expedition · Results

**Document ID:** `WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18`
**Runtime:** 62.6 ms · **Runs:** 300

## Honesty

- Do not assume FractiSI wins — results are measured.
- NOT_EXECUTABLE architectures are not fabricated.
- CIE is secondary; raw metrics are primary.
- Synthetic fixture Level 2 evidence ≠ real-world embodied validation.
- FractiSI adapter is structural Tiny-Footprint-shaped (shared+delta+selective), not a claim of full platform+GPU parity.

## Scientific conclusions (data-driven)

| Hypothesis | Verdict |
|---|---|
| Shared world as coordination primitive | **PARTIALLY_SUPPORTED** |
| FractiSI-specific implementation advantage | **INCONCLUSIVE** |

### Q1 shared vs independent (mean successScore)
```
{
  "independent": 0,
  "shared_text": 0.8,
  "shared_structured": 0.9466666666666668,
  "fractisi_selective": 0.9466666666666668
}
```
### Q2 structured vs text
```
{
  "shared_text": 0.8,
  "shared_structured": 0.9466666666666668
}
```
### Q3 FractiSI vs shared structured
```
{
  "shared_structured": 0.9466666666666668,
  "fractisi": 0.9466666666666668,
  "fractisi_deltas": 0.9466666666666668,
  "fractisi_selective": 0.9466666666666668
}
```

## Grid summary (mean successScore by world × condition)

| World | Condition | successScore mean | taskSuccess | CIE mean | dupRatio | msgs |
|---|---|---:|---:|---:|---:|---:|
| knowledge | independent | 0.000 | 0.000 | 0.390 | 1.654 | 5.0 |
| knowledge | shared_text | 1.000 | 1.000 | 0.920 | 2.933 | 15.0 |
| knowledge | shared_structured | 1.000 | 1.000 | 0.923 | 1.000 | 5.0 |
| knowledge | fractisi | 1.000 | 1.000 | 0.923 | 1.000 | 5.0 |
| knowledge | fractisi_deltas | 1.000 | 1.000 | 0.923 | 2.395 | 5.0 |
| knowledge | fractisi_selective | 1.000 | 1.000 | 0.905 | 1.000 | 5.0 |
| dynamic | independent | 0.000 | 0.000 | 0.300 | 5.000 | 5.0 |
| dynamic | shared_text | 0.000 | 0.000 | 0.495 | 1.005 | 8.0 |
| dynamic | shared_structured | 0.800 | 0.800 | 0.728 | 1.000 | 13.0 |
| dynamic | fractisi | 0.800 | 0.800 | 0.728 | 1.000 | 13.0 |
| dynamic | fractisi_deltas | 0.800 | 0.800 | 0.728 | 1.662 | 13.0 |
| dynamic | fractisi_selective | 0.800 | 0.800 | 0.713 | 1.000 | 13.0 |
| planning | independent | 0.000 | 0.000 | 0.400 | 1.015 | 5.0 |
| planning | shared_text | 1.000 | 0.000 | 0.917 | 2.370 | 15.0 |
| planning | shared_structured | 1.000 | 1.000 | 0.904 | 1.000 | 10.0 |
| planning | fractisi | 1.000 | 1.000 | 0.904 | 1.000 | 10.0 |
| planning | fractisi_deltas | 1.000 | 1.000 | 0.904 | 1.704 | 10.0 |
| planning | fractisi_selective | 1.000 | 1.000 | 0.890 | 1.000 | 10.0 |
| adversarial | independent | 0.000 | 0.000 | 0.360 | 1.566 | 5.0 |
| adversarial | shared_text | 1.000 | 1.000 | 0.912 | 1.877 | 9.6 |
| adversarial | shared_structured | 0.933 | 0.800 | 0.862 | 1.000 | 4.8 |
| adversarial | fractisi | 0.933 | 0.800 | 0.862 | 1.000 | 4.8 |
| adversarial | fractisi_deltas | 0.933 | 0.800 | 0.844 | 2.019 | 4.8 |
| adversarial | fractisi_selective | 0.933 | 0.800 | 0.845 | 1.000 | 4.8 |
| relational | independent | 0.000 | 0.000 | 0.385 | 1.012 | 3.0 |
| relational | shared_text | 1.000 | 1.000 | 0.918 | 2.017 | 7.0 |
| relational | shared_structured | 1.000 | 1.000 | 0.912 | 1.000 | 3.0 |
| relational | fractisi | 1.000 | 1.000 | 0.912 | 1.000 | 3.0 |
| relational | fractisi_deltas | 1.000 | 1.000 | 0.912 | 1.704 | 3.0 |
| relational | fractisi_selective | 1.000 | 1.000 | 0.895 | 1.000 | 3.0 |

## Scaling (knowledge world)

| N | Condition | success mean | dupRatio | msgs | latency ms |
|---:|---|---:|---:|---:|---:|
| 1 | independent | 0.000 | 1.194 | 2.0 | 0.02 |
| 1 | shared_text | 1.000 | 1.426 | 6.0 | 0.01 |
| 1 | shared_structured | 1.000 | 1.000 | 2.0 | 0.02 |
| 1 | fractisi_selective | 1.000 | 1.000 | 2.0 | 0.03 |
| 2 | independent | 0.000 | 1.194 | 2.0 | 0.02 |
| 2 | shared_text | 1.000 | 1.426 | 6.0 | 0.01 |
| 2 | shared_structured | 1.000 | 1.000 | 2.0 | 0.03 |
| 2 | fractisi_selective | 1.000 | 1.000 | 2.0 | 0.04 |
| 4 | independent | 0.000 | 1.323 | 4.0 | 0.04 |
| 4 | shared_text | 1.000 | 2.432 | 12.0 | 0.03 |
| 4 | shared_structured | 1.000 | 1.000 | 4.0 | 0.05 |
| 4 | fractisi_selective | 1.000 | 1.000 | 4.0 | 0.10 |
| 8 | independent | 0.000 | 1.585 | 8.0 | 0.06 |
| 8 | shared_text | 1.000 | 4.435 | 24.0 | 0.04 |
| 8 | shared_structured | 1.000 | 1.000 | 8.0 | 0.09 |
| 8 | fractisi_selective | 1.000 | 1.000 | 8.0 | 0.14 |
| 16 | independent | 0.000 | 3.171 | 16.0 | 0.24 |
| 16 | shared_text | 1.000 | 8.362 | 48.0 | 0.08 |
| 16 | shared_structured | 1.000 | 1.000 | 16.0 | 0.14 |
| 16 | fractisi_selective | 1.000 | 1.000 | 16.0 | 0.31 |
| 32 | independent | 0.000 | 6.341 | 32.0 | 0.17 |
| 32 | shared_text | 1.000 | 16.302 | 96.0 | 0.19 |
| 32 | shared_structured | 1.000 | 1.000 | 32.0 | 0.29 |
| 32 | fractisi_selective | 1.000 | 1.000 | 32.0 | 0.36 |

## NOT EXECUTABLE (no fabricated scores)

- **vjepa** (vjepa2): Weights exist but not integrated into this harness run; mark NOT EXECUTABLE for live multi-agent WORLD ops
- **dreamer** (dreamerv3): Open code exists; not wired into multi-agent shared-state harness in this seed run
- **cosmos** (nvidia_cosmos): Heavy NVIDIA GPU world simulator; visual WM ≠ shared blackboard; NOT EXECUTABLE in this CPU lab
- **genie** (deepmind_genie): Proprietary; no public weights for Genie 3/4 multi-agent shared env

## Existing FractiSI reproduction

```json
{
  "status": "OK",
  "source": "src/experiments/expedition-002-discovery.mjs",
  "result": {
    "id": "E2_discovery_collective",
    "pass": true,
    "scenarios": 100,
    "hops": 6,
    "flatBudget": 40,
    "flat": {
      "discoveries": 0,
      "solutions": 0,
      "meanOps": 40,
      "propagationRounds": 6
    },
    "fractisi": {
      "discoveries": 100,
      "solutions": 100,
      "meanOps": 6,
      "propagationRounds": 3
    },
    "opsReduction": 0.85,
    "roundsReduction": 0.5
  },
  "protocol": {
    "scenarios": 100,
    "hops": 6,
    "flatBudget": 40
  }
}
```

→ ∞^∞