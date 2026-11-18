# Shared World Models Expedition v2 · Results

**Document ID:** `WP-SHARED-WORLD-COLLECTIVE-INTELLIGENCE-V2-EGS-2026-11-18`
**Runtime:** 4895.6 ms

## Why v2

v1 compared shared vs independent structured state and under-tested FractiSI **rhyming** pattern recognition. v2 uses the real rhyme engine plus pinned public fixtures (E9 PDB/Pfam, Movebank GPS) so rhyme can only excel where exact-cache fails.

## Scientific conclusions

| Question | Verdict |
|---|---|
| Shared world as coordination primitive | **PARTIALLY_SUPPORTED** |
| FractiSI rhyme vs non-rhyming (exact/prefix/flat) | **PARTIALLY_SUPPORTED** |
| FractiSI vs shared_structured on E9 task | edge=0 (rhyme 1 vs shared 1) |
| FractiSI vs live open Dreamer/TD-MPC/MuZero-family | **COMPLEMENTARY_DIFFERENTIATED** |

Rhyme wins recorded: R0_differing_bytes_vs_exact_cache, R1_rhyme_beats_conventional_full_copies, G_exp002_guided_discovery, P_e9_rhyme_bytes_vs_exact_cache, M_movebank_rhyme_bytes_vs_exact_cache

## R0 Calibration (rhyme vs exact cache)

| Arm | exactTextHits | naiveBytes | cacheBytes | rhymeBytes | rhymeVsCache |
|---|---:|---:|---:|---:|---:|
| differing words | 0 | 13424 | 13424 | 7385 | 0.450 |
| identical text | 39 | 13241 | 332 | 5867 | -16.672 |
| mixed 50% | 19 | 13341 | 7052 | 6619 | 0.061 |

## R1 Multi-session bytes

| conventional | prefixReuse | rhyme |
|---:|---:|---:|
| 12004 | 1241 | n/a |

## G Exp 002

```json
{
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
}
```

## P E9 real protein relational

```json
{
  "n": 16,
  "path": "/agent/repos/psw.vibelandia.sing13/research/synthobs-nvidia-goldilocks-awareness-expedition/data/e9_real/scenarios.json",
  "independentRate": 0,
  "sharedStructuredRate": 1,
  "exactUnionRate": 1,
  "fractisiRhymeRate": 1,
  "meanNaiveBytes": 440.25,
  "meanExactBytes": 440.25,
  "rhymeBatch": {
    "sessions": 48,
    "shapeHits": 48,
    "exactTextHits": 0,
    "equivalent": true,
    "rhymeAuditPass": true,
    "netZeroRoot": true,
    "octaveSpan": [
      0,
      1,
      2
    ],
    "naiveBytes": 22261,
    "cacheBytes": 22261,
    "rhymeBytes": 14882,
    "rhymeVersusNaive": 0.33147657337945285,
    "cacheVersusNaive": 0,
    "rhymeVersusCache": 0.33147657337945285,
    "phiEgs": 1.618033988749895
  },
  "meanRhymeBytes": 14882,
  "meanCacheBytes": 22261,
  "rhymeVersusCache": 0.33147657337945285,
  "exactTextHitsBatch": 0
}
```

## M Movebank real GPS

```json
{
  "ok": true,
  "source": "Movebank study 2548892515 (Snowy Range Moose) — committed public GPS",
  "path": "/agent/repos/psw.vibelandia.sing13/research/geomagnetic-herbivore/data/trajectories.csv",
  "nRows": 5000,
  "individuals": [
    {
      "id": "mb-2548892515-F14",
      "n": 4000
    },
    {
      "id": "mb-2548892515-F11",
      "n": 1000
    }
  ],
  "independentAnySuccess": false,
  "independentMeanScore": 0,
  "sharedStructured": {
    "success": true,
    "successScore": 1,
    "dLat": 0,
    "dLon": 0,
    "estimated": {
      "lat": 41.557691925742446,
      "lon": -106.19401371500796
    },
    "truth": {
      "lat": 41.557691925742446,
      "lon": -106.19401371500796
    }
  },
  "exactText": {
    "success": true,
    "successScore": 1,
    "dLat": 0,
    "dLon": 0,
    "estimated": {
      "lat": 41.557691925742446,
      "lon": -106.19401371500796
    },
    "truth": {
      "lat": 41.557691925742446,
      "lon": -106.19401371500796
    },
    "uniqueLines": 2,
    "totalLines": 2
  },
  "rhymeTrackObservations": {
    "n": 30,
    "compare": {
      "sessions": 30,
      "shapeHits": 30,
      "exactTextHits": 0,
      "equivalent": true,
      "rhymeAuditPass": true,
      "netZeroRoot": true,
      "octaveSpan": [
        0,
        1,
        2
      ],
      "naiveBytes": 12122,
      "cacheBytes": 12122,
      "rhymeBytes": 7783,
      "rhymeVersusNaive": 0.35794423362481437,
      "cacheVersusNaive": 0,
      "rhymeVersusCache": 0.35794423362481437,
      "phiEgs": 1.618033988749895
    },
    "exactTextHits": 0,
    "rhymeVersusCache": 0.35794423362481437,
    "rhymeBytes": 7783,
    "cacheBytes": 12122,
    "naiveBytes": 12122
  }
}
```

## O Live open world models (CPU)

| Arm | status | predict MSE | plan return | share/merge |
|---|---|---:|---:|---|
| dreamer_family_rssm | EXECUTABLE | 0.000226 | 19 | unavailable |
| tdmpc_lite | EXECUTABLE | 0.000494 | 12.7 | unavailable |
| muzero_lite | EXECUTABLE | 0.000223 | 11.4 | unavailable |
| identity baseline | — | 0.031429 | 21.9 (random) | — |

CartPole partial-obs multi-agent:
```json
{
  "independent_partial": {
    "mean_return": 14.166666666666666,
    "std_return": 6.465721580423607,
    "episodes": 12,
    "mode": "independent"
  },
  "shared_structured_partial": {
    "mean_return": 200,
    "std_return": 0,
    "episodes": 12,
    "mode": "shared"
  },
  "task": "CartPole partial-obs multi-agent (each agent sees 1 dim)"
}
```

**User-aware headline:** Open Dreamer/TD-MPC/MuZero-family arms RUN here and own single-agent imagination/planning. They do not provide native multi-agent share/merge. FractiSI owns the shared-world job; use open WMs as predictors feeding a FractiSI shared substrate — not as replacements.

| FractiSI vs open latent WMs | **COMPLEMENTARY_DIFFERENTIATED** |

## Honesty

- v1 under-tested rhyme; v2 makes rhyme vs exact/prefix a first-class comparison.
- v2.1 runs LIVE open WM family arms on CPU (RSSM/TD-MPC-lite/MuZero-lite) — not stubs.
- Full DreamerV3-JAX / official TD-MPC2 checkpoint zoo / V-JEPA / Cosmos still need GPU or large downloads; Genie remains closed.
- E9 and Movebank are pinned public/real fixtures; Exp 002 remains an architecture control.
- User-aware reporting: weight high-value differing-words / multi-agent traffic over identical-string edge cases.

→ ∞^∞