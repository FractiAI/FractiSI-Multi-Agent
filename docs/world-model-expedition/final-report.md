# Final Report v2.1 · Shared World Models + Live Open WMs

**Document ID:** `WP-SHARED-WORLD-COLLECTIVE-INTELLIGENCE-V2-EGS-2026-11-18`  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox

## Executive Summary (user-aware, not lukewarm)

We run what is available:

1. **FractiSI rhyme + shared world** on real E9 / Movebank traffic  
2. **Live open world-model family arms** on CPU — Dreamer-family RSSM, TD-MPC-lite, MuZero-lite (PyTorch + CartPole)

| Question | Verdict |
|---|---|
| Shared world coordination primitive | **PARTIALLY_SUPPORTED** |
| FractiSI rhyme vs exact/prefix on differing-words traffic | **PARTIALLY_SUPPORTED** |
| FractiSI vs live open Dreamer/TD-MPC/MuZero-family | **COMPLEMENTARY_DIFFERENTIATED** |

### Differentiated performance (weight the high-value work)

- **Open WMs excel** at single-agent latent predict/plan (best RSSM next-obs MSE ~2e-4). They have **no native share/merge**.  
- **FractiSI excel** at multi-agent shared world + rhyme on same-pattern/different-words traffic (E9/Movebank exactTextHits=0; rhyme beats exact-cache ~33–45%).  
- CartPole partial-obs: shared world return **200** vs independent **~14** — sharing is not a footnote.  
- Exact/prefix still win only when traffic is mostly identical bytes — not the hard multi-agent job.

**Headline:** Open Dreamer/TD-MPC/MuZero-family arms RUN here and own single-agent imagination/planning. They do not provide native multi-agent share/merge. FractiSI owns the shared-world job; use open WMs as predictors feeding a FractiSI shared substrate — not as replacements.

## What is still not on this VM

V-JEPA 2, Cosmos, Genie (closed), full DreamerV3-JAX mega stack, official TD-MPC2 checkpoint zoo — need GPU or large downloads. Family arms **are live**.

## Run

```bash
npm run research:world-model-expedition
# open WM lab alone:
python3 experiments/world-model-expedition/src/open_wms/run_open_wm_lab.py
```

→ ∞^∞
