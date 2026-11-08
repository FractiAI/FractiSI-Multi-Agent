# Experiment Results

**Document ID:** `experiment-results-2026-11`  
**Suite:** `world_model_assimilation` v0.1.0  
**Receipt:** `output/data/world-model-assimilation/latest.json`  
**Wall time (suite):** ≈66 ms in-process

## Honesty boundary

Measured architectural lab on `createPredictiveSharedWorld`. No external WFM weights. Toy world = 4 module slots (alpha/beta/gamma/shared). Results generalize as **directional evidence**, not production SLA.

## Experiment 1 — Predictive context efficiency

| Metric | Measured |
|---|---|
| Conventional bytes (16 agents) | **7712** |
| Tiny Footprint bytes | **596** (−**92.3%**) |
| Predictive selective perspectives | **1472** (−**80.9%** vs conventional) |
| Imagination materialization (all futures) | **7756** (≈ conventional — futures are not free) |
| Reconstruction accuracy after approved commit | **1.0** |

**Finding:** Selective perspectives remain far smaller than N copies. Materializing every agent’s imagined future is expensive — keep category C ephemeral and on-demand. Tiny Footprint remains the density backbone.

## Experiment 2 — Multi-agent alternative futures

| Metric | Measured |
|---|---|
| Mean path conflicts (8 agents, half on `shared`) | **2** |
| Unapproved commit blocked | **100%** of runs |
| Approved commit success | **1.0** |
| Rollback success | **1.0** |
| Final correctness | **1.0** |

**Finding:** The A/B/C separation holds. Predictions never overwrote authoritative state without approval. Composition keeps non-overlapping futures and rejects the rest.

## Experiment 3 — Temporal continuity

| Metric | Measured |
|---|---|
| Steps | 40 |
| Context growth ratio (end/start bytes) | **≈1.01** |
| Lost-information events | **0** |
| Recovery after rollback interrupt | **1.0** |

**Finding:** Versioned authoritative history + rhyme-stable module schema prevented drift and supported interrupt/resume.

## Experiment 4 — Collective intelligence (useful work)

| Agents | Full-dup useful | FractiSI arm C useful (mean) | Predictive compose kept (mean) | Pred conflicts (mean) |
|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 1 | 0 |
| 4 | 0 | 4 | 3 | 1 |
| 16 | 0 | 14 | 4 | 4 |
| 32 | 0 | ≈26.7 | 4 | 4 |

**Finding (critical):** On this toy world, **existing FractiSI coordination produces more useful composed work at 16–32 agents** than one-shot predictive compose across colliding shared paths. Predictive Shared State adds **future exploration + approval discipline**, but must **compose with** Layers B–D — not replace them. The four module slots saturate predictive “kept” count; arm C’s path-batching continues to scale.

## Experiment 5 — Multimodal shared world (simulated)

| Metric | Measured |
|---|---|
| Kind | **measured_simulation** (grid stand-in — not Cosmos/V-JEPA pixels) |
| Conventional N×grid bytes (8 agents, 16×16) | **90064** |
| Shared grid + viewports | **14394** (−**84.0%**) |
| Mean conflicts on occupy-shared | **1** |

**Finding:** Multiple agents can share one spatial world representation without N full copies. Connecting a real WFM remains Optional-external; the packing principle holds.

## Failures and limitations

1. Toy world slot count caps predictive useful-work scaling — need richer path/task workloads (reuse comparative-bench task graphs inside imagine/compose).  
2. Latent dynamics are untrained hash-RSSM — fine for architecture tests, not prediction accuracy claims.  
3. Agent count 100 not informative until world cardinality grows.  
4. No GPU WFM latency/accuracy numbers — intentionally not downloaded.

## Recommendations driven by measurement

1. Graduate predictive API as **opt-in beside Gateway**, feeding Composition — do not swap out arm C.  
2. Default UX: perspectives cheap; imagination on explicit request.  
3. Next experiment: CEM planning over comparative-bench task graphs + latent-action codebook on unlabeled diffs (Jafar pattern).  
4. Keep reporting useful work **and** bytes — never bytes alone.

## Follow-on: C vs C+imagine

See [`C_PLUS_IMAGINE_RESULTS.md`](./C_PLUS_IMAGINE_RESULTS.md). Headline: hard-gated C+imagine matches C exactly; soft predictive select **improves** useful work at 32 (+1.4) and 100 (+3.6) agents with no >5% regression.
