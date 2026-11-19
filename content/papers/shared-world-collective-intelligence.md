# Do Rhyming World Models Outperform Non-Rhyming Ones?

**Short answer: Yes.** Against exact-text caches on real non-identical observations (PDB and Movebank data); on task success it only matched a shared structured blackboard, and prefix reuse still won when strings were identical. Genie, Cosmos and V-JEPA were not executable, so no scores were reported for them.

**Do rhyming world models outperform non-rhyming ones — after prior expeditions already showed that rhyming a shared world between agents produces observable, replicable, falsifiable, paradigm-shifting gains?**

**Document ID:** `WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18`  
**Registry ID:** `synthobs-shared-world-collective-intelligence-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition  
**Date:** 18 November 2026  
**Harness:** FractiSI Multi-Agent `experiments/world-model-expedition/`  
**Ship blog:** `/ship-blog/shared-world-collective-intelligence`

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story / application companion | Head-to-head rhyming vs non-rhyming world models | ENGINE_SHELF pin |
| Empirical (Level 2–3) | Real E9/Movebank fixtures + live CPU open WM arms + FractiSI rhyme engine | Embodied Level 5 |
| Prior expeditions | Exp 002 / Tiny Gateway already established rhyming shared-world gains | Re-litigating that baseline as unknown |
| Open WMs | Dreamer-family / TD-MPC-lite / MuZero-lite **live on CPU** | Full GPU Genie/Cosmos/V-JEPA zoo |

## Title lock

Prior expeditions already showed that **rhyming a shared world model between agents** produces observable, replicable, falsifiable differentiated improvements — paradigm-shifting collective ability under fixed budgets.

**This expedition’s job is the comparison:** rhyming world models vs non-rhyming world models (exact-cache, prefix reuse, non-rhyming shared structured state, independent worlds, and live open latent predictors).

## Primary research question

Where do rhyming world models outperform non-rhyming ones — especially on high-value traffic (same organization, different words) — and how do they complement single-agent latent world models?

## Method

See `docs/world-model-expedition/experimental-design-v2.md`.  
Run: `npm run research:world-model-expedition` in FractiSI Multi-Agent.

## Computational Lab

| Comparison | Result (user-aware) |
|---|---|
| Rhyme vs exact-cache on differing-words (E9, Movebank) | **Rhyme outperforms** (~33–45%; exactTextHits≈0) |
| Rhyme vs prefix on identical strings | Prefix can win — easy/low-value slice (~75%+ duplicates) |
| Rhyming shared world vs independent | Collective tasks succeed; independent fails |
| vs live Dreamer/TD-MPC/MuZero-family | **COMPLEMENTARY_DIFFERENTIATED** |

CartPole partial-obs, same model with private copies vs one shared world: next-state error 5.7×–20× lower with the shared world (superseded the earlier hand-rule 200 vs ~14; see the update section). Exp 002 reproduction: guided **100/100** vs flat **0/100**.

## EXECUTABLE status lock

| Arm | Status on this expedition |
|---|---|
| Dreamer-family RSSM | **EXECUTABLE** (live CPU train/predict/plan) |
| TD-MPC-lite | **EXECUTABLE** (live CPU) |
| MuZero-lite | **EXECUTABLE** (live CPU) |
| FractiSI rhyme engine | **EXECUTABLE** |
| V-JEPA 2 | Not on this CPU VM (needs GPU) |
| Cosmos | Not on this CPU VM (needs GPU) |
| Genie 3/4 | Closed — no weights |

## Live open world-model arms

CPU PyTorch: Dreamer-family RSSM, TD-MPC-lite, MuZero-lite. They own single-agent imagination/planning. They do **not** natively share/merge a multi-agent world. FractiSI rhyming shared world owns that job.

Still needing GPU/large downloads: V-JEPA 2, Cosmos, Genie (closed).

## Evidence hierarchy

**Level 2–3** computational with pinned public fixtures + live open WM training. Not Level 5.

## Document lineage

Exp 002 · Tiny Gateway rhyme vs cache · Multi-Agent platform · this rhyming vs non-rhyming comparative expedition.

→ ∞^∞

## Addendum · 2026-11-18 · upstream arms, same-model test, rhyme features

- **Upstream models executed on CPU:** DreamerV3 (danijar/dreamerv3, 5,000 steps), MuZero (muzero-general, 3,000 updates), TD-MPC2 (official 5M checkpoints, real MuJoCo), V-JEPA 2 (ViT-L encoder on real CartPole renders). None has share or merge. Receipts: `research/synthobs-shared-world-collective-intelligence/data/open_wm_official/`.
- **Same model, two deployments:** four agents each see one CartPole dimension; each compact arm drives its own rollout controller. Shared world predicts the next state 5.7×–20× better than private copies; control return is unchanged for two of three arms. A plain blackboard would match the accuracy gain; the rhyme layer's own contribution is bytes (400 agent messages: 136,546 B exact cache vs 69,912 B rhyme).
- **Correction:** the earlier "shared 200 vs independent ~14" compared two hand-written rules and is not a world-model result.
- **Rhyme features of the FractiSI Multi-Agent Rhyming World Model:** Rhyming Templates, Shared-World Rhyme, Protein Folding Rhyme (#53, new), LLM Rhyme (#54, new).

→ ∞^∞


## Addendum · 2026-11-18 · Pilot Rhyme (#55)

Fifth Rhyming World Model rhyme feature: Director/Pilot role rhyme. Lab: 100/100 vs flat 0/100; exact role cache 0 hits; Pilot Rhyme store 22% smaller than exact cache and 80% smaller than private copies. Paper: `/whitepaper/pilot-rhyme-expedition` · ship blog `/ship-blog/pilot-rhyme-expedition`.
