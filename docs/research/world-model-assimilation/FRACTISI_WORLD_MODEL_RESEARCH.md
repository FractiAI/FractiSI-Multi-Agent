# FractiSI World Model Research

**Document ID:** `fractisi-world-model-research-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Date:** 2026-11-08

## Honesty boundary

This document reports verified repository facts and public open-source research. It does not claim that FractiSI is a video world foundation model, that external benchmarks transfer to FractiSI workloads, or that Active Inference identity holds. Measured prototype results live in `EXPERIMENT_RESULTS.md`.

## Part I — Verified FractiSI architecture (code, not docs alone)

Inspection of `/tmp/fractisi-ma-kit` (FractiSI Multi-Agent 0.2) shows the architecture assessment doc dated 2026-11-06 is **partially stale**: Layers B–F are no longer missing.

### Actual dependency stack

```
core
  ↑
engine (Tiny Gateway) · labs
  ↑
platform (coordination · store · composition · git · deploy)
  ↑
experiments · sdk
  ↑
benchmarks · workloads
  ↑
analysis → manuscript → reporting / gates / testdrive
  ↑
pipeline · verification · cli
```

### Six product surfaces — verified status

| Named surface (product) | Research layer label | Status | Evidence |
|---|---|---|---|
| Tiny Footprint / Tiny Gateway | A | **Implemented** | `src/engine/gateway.mjs:createGateway`, `rhyming/codec.mjs`, `broadcast/eight-node.mjs`, `vectors/store.mjs` |
| Coordination | B | **Implemented** (in-process) | `src/platform/coordination.mjs`, `agents.mjs`, `ownership.mjs`, `conflicts.mjs` |
| Shared state | C | **Implemented** (local Maps / JSON) | `src/platform/store.mjs` — not distributed multi-host |
| Composition · rollback | D | **Mostly implemented** | `composition.mjs` state machine; rollback is **state-only** (no git revert / undeploy) |
| Git awareness | E | **Implemented** | `git.mjs` real `git`/`worktree` via `spawnSync` |
| Deploy (paid) | F | **Partial** | Vercel deploy + approval gate; no multi-cloud; rollback label-only |

### What exists vs what does not

**Exists:** shared templates + deltas + selective reconstruct; rhyme gate (four pillars from Net Zero); comparative A/B/C bench; Expedition 002 discovery; entitlements; CLI (`tiny`/`fractisi`).

**Partial:** composition semantics (path/interface heuristics, not AST merge); deploy undeploy; concurrent-agent capacity metering (numbers in `TIERS` unused by registry).

**Missing / proposed only:** live Cursor/Claude session adapters (normalize-only today); vLLM prefix-cache / RAG adapters; enterprise RBAC/multi-tenant enforcement; **predictive shared state** (this initiative’s prototype); authoritative vs predicted category separation in product API.

### Foundational design to preserve

1. One shared world registered once (Tiny Footprint).  
2. Agent-specific deltas + selective reconstruction.  
3. Holographic rhyme gate ≠ exact-text cache.  
4. Coordination → composition → optional approval-gated deploy.  
5. Community free (local + Git); Deploy paid (Team+).  
6. Named surfaces in product voice — not Layer A–F letter codes on customer surfaces.

## Part II — Open-source research targets

### 1. NVIDIA Cosmos

- **Repos:** https://github.com/nvidia-cosmos · current https://github.com/NVIDIA/cosmos  
- **What it is:** World Foundation Models — Predict / Transfer / Reason / Cosmos 3 MoT (reasoner + generator).  
- **World representation:** tokenized video (Cosmos Tokenizers); multimodal tokens.  
- **Transitions / prediction:** DiT Video2World; frame-replacement temporal conditioning.  
- **Actions:** action embedder MLP into DiT timestamp embeddings; Bridge-style EE deltas.  
- **Retain between steps:** temporal frame context / KV; reasoner CoT separate from motor policy.  
- **Reusable without full model:** action-as-conditioner; critic-over-rollouts; policy-head swap metaphor.  
- **FractiSI fit:** optional Physical-AI sidecar — **not** Tiny Footprint core. Tiny Gateway can still dedupe shared non-video context across agents that *call* Cosmos.  
- **Compute:** Predict2 ~32–56 GB VRAM class; pretrain is cluster-scale.

### 2. Meta V-JEPA 2 / 2.1 / 2-AC

- **Repo:** https://github.com/facebookresearch/vjepa2 (MIT code; Apache-2.0 weights on HF)  
- **Papers:** arXiv 2506.09985 · 2603.14482  
- **Retains:** latent video features \(z\), not pixels.  
- **Predicts:** masked target-encoder features; 2-AC predicts action-conditioned latents.  
- **Avoids unnecessary detail:** JEPA loss in representation space.  
- **FractiSI fit (strongest):** selective reconstruction + compact predictive exchange; CEM–MPC toward goal latent.  
- **Conversion boundary:** latent \(z\) ≠ FractiSI authoritative shared state. Must keep an explicit decode / commit boundary.

### 3. LingBot-World

- **v1:** https://github.com/Robbyant/lingbot-world — Apache-2.0, deprecated → v2  
- **v2:** https://github.com/Robbyant/lingbot-world-v2 — **CC BY-NC-SA 4.0** (non-commercial)  
- **Pilot / Director:** paper-described; **agentic harness not released** (issue #5).  
- **FractiSI fit:** rebuild Director (semantic steward) / Pilot (local executor) seats in coordination — do not adopt v2 weights for commercial product.

### 4. DreamerV3

- **Repo:** https://github.com/danijar/dreamerv3 — MIT  
- **Paper:** arXiv 2301.04104  
- **Core:** RSSM (deterministic recurrent + categorical stochastic); imagination actor-critic.  
- **FractiSI fit:** rebuild imagination rollouts over shared-world keys for alternative-future exploration. Single-GPU scale — closest compute class to Workstation.

### 5. Additional discovery (not padding)

| Project | Why included | Classification |
|---|---|---|
| **DIAMOND** (MIT) · arXiv 2405.12399 | EDM diffusion-as-dynamics; few-step imagination | Adapt pattern |
| **Jafar** (Apache-2.0) · Genie open reimpl | Latent Action Model + MaskGIT dynamics | Adapt pattern |

Skipped: IRIS (GPL-3.0 contagion), incomplete Open-Genie training path.

## Research conclusions

1. **Do not wrap WFMs** as FractiSI Multi-Agent. Preserve shared-world coordination as the product.  
2. **Rebuild** Dreamer-style imagination + V-JEPA-style CEM planning over Tiny Footprint state (prototype shipped).  
3. **Adapt** latent-action / selective-perception ideas; keep authoritative state explicit.  
4. **Optional-external** only for Cosmos / visual WFMs behind a provider interface.  
5. **Reject** LingBot-World v2 for commercial core (NC license + missing harness).  
6. Existing FractiSI coordination already outperforms naive predictive compose on useful-task completion at 16–32 agents in-process — predictive layer must **add** future exploration, not replace B–D.

## Sources

See `OPEN_SOURCE_LICENSE_AUDIT.md` and `WORLD_MODEL_CAPABILITY_CROSSWALK.md` for SPDX, URLs, and per-technique mapping.
