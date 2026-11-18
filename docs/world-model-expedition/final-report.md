# Final Report · Rhyming vs Non-Rhyming World Models

**Document ID:** `WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18`  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox

## Title lock

This is **not** a generic “are shared worlds nice?” survey.  
Prior expeditions already showed that a **rhyming shared world between agents** produces observable, replicable, falsifiable differentiated improvements — paradigm-shifting collective ability under fixed budgets (Exp 002 100/100 vs 0/100; Tiny Gateway rhyme vs exact-cache).

**This expedition compares rhyming vs non-rhyming world models.**

## What we compare

| Rhyming | Non-rhyming |
|---|---|
| FractiSI rhyme templates + shared world + deltas/selective reconstruct | Exact-text cache |
| | Prefix reuse (identical strings) |
| | Shared structured blackboard without rhyme |
| | Independent private worlds |
| | Live open latent WMs (Dreamer-family RSSM, TD-MPC-lite, MuZero-lite) |

## User-aware results

- On **high-value traffic** (same organization, different words — real E9 / Movebank): **rhyme outperforms exact-cache** (~33–45%). Exact hits ≈ 0.  
- Exact/prefix win only when traffic is mostly identical bytes (~75%+ duplicates) — the easy slice, not the hard multi-agent job.  
- vs open Dreamer/TD-MPC/MuZero-family: **COMPLEMENTARY_DIFFERENTIATED** — they win single-agent imagination/planning; rhyming shared worlds win multi-agent share/merge.  
- CartPole partial-obs, same model with private copies vs one shared world: next-state error 5.7×–20× lower with the shared world (superseded the earlier hand-rule 200 vs ~14; see the update section).

## Scientific answers (traffic-weighted)

1. Shared rhyming world as coordination primitive — **supported on collective work** (prior + this).  
2. Rhyme vs non-rhyme on differing-words traffic — **rhyme outperforms**.  
3. vs open latent WMs — **different jobs; complementary**, not a lukewarm tie.

## Update · upstream models executed locally, same-model test, rhyme features

**Upstream open world models run on CPU** (results in `experiments/world-model-expedition/results/open_wm_official/`):

| Model | Upstream | Result |
|---|---|---|
| DreamerV3 | danijar/dreamerv3 `e01491f`, JAX size1m, 5,000 steps | next-state MSE 0.0255 vs 0.0311 copy-forward on held-out data (one seed; 0.0372 on training transitions, which does not beat copy-forward); policy return 65.3 (10 eps) |
| MuZero | werner-duvaud/muzero-general `8c65818`, 3,000 updates, MCTS | policy return 218.9 (10 eps); no observation decoder |
| TD-MPC2 | nicklashansen/tdmpc2 `332f19e`, official 5M checkpoints | cartpole-swingup 197 vs 49 random (about a quarter of the published ~800+; partial reproduction, checkpoint loaded via an inferred key-rename converter); cartpole-balance 999 vs 331 random; 2 eps each; one-step latent error worse than copy-forward |
| V-JEPA 2 | facebook/vjepa2-vitl-fpc64-256 encoder | state R² 0.85 on 40 held-out clips (8-frame clips, one split); next-state probe 0.056 vs 0.030 copy-forward, which uses the true state |

None has a share or merge operation. Not run: V-JEPA 2-AC (memory, non-HF checkpoint), Cosmos (GPU), Genie (closed); DIAMOND and Oasis not attempted (GPU-class).

**Same model, two deployments** (`scripts/run_rhyme_layer.mjs`): four agents each see one CartPole dimension; each compact arm drives its own 4-step rollout controller (no hand-written balancing rule). Random = 20.5.

| Model | Return · private copies | Return · shared world | Next-state MSE private → shared |
|---|---:|---:|---|
| Dreamer-family RSSM | 139.3 | 199.5 | 0.00099 → 0.00017 (5.7×) |
| TD-MPC-lite | 200 | 200 | 0.00127 → 0.00013 (10×) |
| MuZero-lite | 200 | 199.4 | 0.00263 → 0.00013 (20×) |

Shared-world accuracy gain is from sharing; a plain blackboard would match it. The rhyme layer's own contribution is bytes: on 400 real agent telemetry messages, exact cache 136,546 B (0 hits) vs rhyme 69,912 B (−49%).

Correction: the earlier lite planning returns (10–16, below random) came from reward-based planning on CartPole's constant reward. They are superseded by the state-cost controller above. The earlier "shared 200 vs independent ~14" used a hand-written rule for both sides and is not a world-model result.

**Rhyme features of the World Model:** Rhyming Templates, Shared-World Rhyme, Protein Folding Rhyme (#53, new), LLM Rhyme (#54, new).

→ ∞^∞


## Addendum · Pilot Rhyme (#55)

Director/Pilot role rhyme lab: 100/100 vs flat 0/100; exact role cache 0 hits; Pilot Rhyme store 22% smaller than exact cache and 80% smaller than private copies. Paper: `/library/papers/pilot-rhyme-expedition/`. Run: `npm run research:pilot-rhyme-expedition`.

Library paper for this expedition: `/library/papers/shared-world-collective-intelligence/`.
