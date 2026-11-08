# C vs C+imagine — Experiment Results

**Document ID:** `c-plus-imagine-results-2026-11`  
**Receipt:** `output/data/world-model-assimilation/c-plus-imagine-latest.json`  
**Code:** `src/experiments/c-plus-imagine-bench.mjs`  
**Runner:** `npm run research:c-plus-imagine`

## Honesty boundary

Measured in-process Node simulation. Same `buildWorkload` seeds as `runComparativeBench` arm C. No external WFM weights. Imagination is category C (predicted); authoritative path state updates only with `approved: true`.

## Hypothesis

1. **C+imagine** (same hard claim gate as C, then CEM-ranked futures before compose) holds useful completions vs C without >5% regression.  
2. **C+imagine_select** (predictive maximal independent set *replaces* the hard claim abort) can match or beat C by choosing who proceeds from futures.  
3. Shared registry bytes remain far below N full task-list copies.

**Graduation rule:** Graduate toward `createPlatform` only if useful work does not regress >5% and future-exploration metrics are positive.

## Arms

| Arm | Behavior |
|---|---|
| **C** | Existing FractiSI coordination + composition (`armC_fractisi`) |
| **C+imagine** | Identical claim gate; imagine futures for admitted tasks; CEM-rank before compose; also attempt remainder |
| **C+imagine_select** | Claim all tasks; imagine all; predictive MIS keeps non-overlapping set; compose **only** kept (rejected stay predicted) |

## Measured results (5 runs / cell · seed base `20261106`)

| Agents | C useful (mean) | C+imagine useful | Δ imagine | C+imagine_select useful | Δ select | Select rejected futures | Shared vs conventional bytes |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 1.0 | 1.0 | 0 | 1.0 | 0 | 0 | −7.6%* |
| 4 | 4.0 | 4.0 | 0 | 4.0 | 0 | 0 | −74.6% |
| 16 | 14.0 | 14.0 | 0 | 14.0 | 0 | 2.0 | −93.7% |
| 32 | 24.4 | 24.4 | 0 | **25.8** | **+1.4** | 6.2 | −96.9% |
| 100 | 73.4 | 73.4 | 0 | **77.0** | **+3.6** | 23.0 | −99.0% |

\*At n=1 the shared registry JSON framing is slightly larger than one copy — expected; density wins appear as soon as n≥4.

### Conflicts (hard gate)

C and C+imagine report **identical** `mergeConflicts` at every agent count (0 / 0 / 2 / 7.6 / 26.6). The hard gate already removed overlapping claims before imagination ran, so CEM ranking could not change the admitted set — and did not change useful work (**Δ = 0**, zero regression).

### Future exploration (soft select)

At 32 and 100 agents, predictive MIS **rejects** overlapping futures (6.2 / 23.0 mean) and **keeps more useful compositions than C** (+1.4 / +3.6). No cell regresses >5%.

## Interpretation

1. Wiring imagination *after* the hard claim gate is safe but inert for useful-work — futures mirror an already-filtered set.  
2. Wiring imagination as the **selector** (C+imagine_select) is where Predictive Shared State earns its keep: more useful completed tasks at fleet scale by anticipating path conflicts before compose.  
3. Byte story remains Tiny Footprint’s: shared registry ≪ N copies; imagination adds a measured overhead (`imaginationBytes` in receipt) and must stay on-demand.  
4. **Graduation decision:** proceed to an **opt-in** `features.predictiveComposeSelect` behind `createPlatform` — default off; Community may enable for local labs. Do **not** replace arm C’s hard gate as the only path until more workloads (interface/semantic conflicts) are measured.

## Limitations

- Workload conflicts are path-overlap dominated (comparative-bench). Semantic/interface-only conflicts need a follow-up.  
- CEM uses hash latents (RSSM-lite), not trained predictors.  
- Useful-work gains at 100 agents (+3.6 on 73.4 ≈ +4.9%) are real but modest — still under a 5% regression ceiling the other way.

## Next experiment

Run C+imagine_select on workloads with higher `interdependFraction` and interface-marker conflicts; compare against arm C’s greedy remainder strategy on the same seeds.
