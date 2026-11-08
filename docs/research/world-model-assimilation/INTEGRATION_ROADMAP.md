# Integration Roadmap

**Document ID:** `integration-roadmap-2026-11`  
**Product:** FractiSI Multi-Agent remains the flagship — no competing world-model product.

## Principles

- Smallest change for greatest benefit.  
- Preserve Community / Server / Cloud editions.  
- Local Workstation stays useful without GPUs.  
- GPU / WFM paths are optional external integrations.  
- Main branch stays stable; graduate via feature flags.

## Prioritized plan

### P0 — Done on research branch

| Item | Status |
|---|---|
| Architecture verification vs code | Done |
| Open-source research + license audit | Done |
| Predictive Shared World prototype | Done (`src/experiments/predictive-shared-state.mjs`) |
| Experiments 1–5 + baseline receipt | Done |
| Eight deliverable docs | Done |

### P1 — Next highest-value experiments (no product rewire yet)

| Item | Depends on | Complexity | Expected benefit |
|---|---|---|---|
| Drive imagine/compose from comparative-bench task graphs | P0 | Low | **Done** — see `C_PLUS_IMAGINE_RESULTS.md` |
| Latent-action codebook on unlabeled contribution diffs (Jafar pattern) | P0 | Med | Compress diffs agents exchange |
| CEM planner choosing compose order / rollback targets | P0 | Med | Better collective outcomes under conflict |
| Persist CandidateFutures in `.fractisi/` (still non-authoritative) | P0 | Low | Debuggability |

### P2 — Opt-in product integration

| Item | Edition | Notes |
|---|---|---|
| `features.predictiveSharedState` on `createPlatform` | Community+ | Local CPU OK |
| `features.predictiveComposeSelect` (C+imagine_select) | Community+ | Default **off**; measured lift at 32–100 agents |
| CLI: `fractisi imagine` / `fractisi futures` | Community+ | Explicit imagination |
| Composition hook: evaluate futures before integrate | Community+ | Keep approval |
| Docs + Test Drive beat (optional) | Site | Demonstrate, don’t overclaim |

### P3 — Optional external model providers

| Provider | Edition | Requires GPU? | Gate |
|---|---|---|---|
| V-JEPA2 encoder features as Optional tower | Team+ | Yes | Apache weights · operator BYOK/BYOW |
| Cosmos Predict/Reason sidecar | Enterprise/Cloud | Yes | OpenMDW/NVIDIA terms · never writes A |
| Visual grid / robotics demos | Cloud demos | Yes | Marketing + research lane |

### P4 — Explicitly later / avoid

| Item | Why |
|---|---|
| Replace Tiny Footprint with video WFM registry | Wrong product; destroys density thesis |
| Ship LingBot v2 weights | NC license |
| Auto-commit predictions to production deploy | Violates A/B/C separation |
| Claim CapEx/HBM from in-process labs | Honesty boundary |

## Edition matrix

| Capability | Community | Developer Pro | Team | Enterprise / Cloud |
|---|---|---|---|---|
| Tiny Footprint + Coordination + Git | ✓ | ✓ | ✓ | ✓ |
| Predictive perspectives (CPU) | ✓ (flag) | ✓ | ✓ | ✓ |
| Imagination / CEM (CPU) | ✓ (flag) | ✓ | ✓ | ✓ |
| External V-JEPA/Cosmos adapters | — | — | opt | ✓ |
| Deploy | — | — | ✓ paid | ✓ |

## Success metrics for graduation

1. Useful composed work ≥ existing arm C on comparative-bench tasks **or** clear new capability (future exploration) with no regression >5% useful work.  
2. Perspective bytes remain ≪ N full copies.  
3. Unapproved prediction → authoritative overwrite rate = **0** in tests.  
4. License audit still clean for shipped code paths.
