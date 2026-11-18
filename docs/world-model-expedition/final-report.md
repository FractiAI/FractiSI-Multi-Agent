# Final Report · Shared World Models for Collective Intelligence

**Document ID:** `WP-SHARED-WORLD-COLLECTIVE-INTELLIGENCE-EGS-2026-11-18`  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Runtime:** 62.6 ms · **Episodes:** 300

## Executive Summary

We built a fair, reproducible comparative harness for multi-agent world models. On synthetic fixtures (Level 2 evidence):

- **Shared world as coordination primitive:** **PARTIALLY_SUPPORTED**
- **FractiSI-specific implementation advantage:** **INCONCLUSIVE**

Independent agents fail live collective tasks that require merging complementary facts. Shared text and shared structured state succeed. FractiSI-shaped arms (shared + deltas + selective) match structured sharing on task success; selective reconstruction improves working-set discipline rather than inventing a new success cliff. Genie / Cosmos / V-JEPA / Dreamer are **NOT EXECUTABLE** in this seed — no fabricated scores. Exp 002 reproduction: **100/100 vs 0/100** guided vs flat, ops −85%.

## Research Question

Does FractiSI’s shared-world architecture provide measurable advantages over leading alternatives — and where does it lose — without assuming victory?

## Hypotheses

Primary: coherent shared world state beats independent reconstruction for collective capability.  
Secondary: shared world + deltas + selective reconstruction improves useful collective intelligence per resource unit.

## World Model Taxonomy

See `model-landscape.md` · Classes A–D. This harness executes Class A fully; B/C marked NOT EXECUTABLE when unwired.

## Competing Architectures

Executable: independent, shared_text, shared_structured, fractisi, fractisi_deltas, fractisi_selective.  
NOT EXECUTABLE: vjepa2, dreamerv3, nvidia_cosmos, deepmind_genie.

## Experimental Design

See `experimental-design.md`. Ablations 1–6 · Worlds A–D + relational · seeds [1, 2, 3, 4, 5].

## Benchmark Worlds

Knowledge · Dynamic · Planning · Adversarial · Relational.

## Metrics

Raw families A–E first; CIE secondary (`metrics.mjs`).

## Results

See `results.md` and `summary.json`. Headline means (successScore):

```json
{
  "independent": 0,
  "shared_text": 0.8,
  "shared_structured": 0.9466666666666668,
  "fractisi_selective": 0.9466666666666668
}
```

## Scaling Results

Independent and shared_text **duplicationRatio rises with N** (≈1.2→6.3 independent; ≈1.4→16.3 shared_text at N=32). Structured / FractiSI-selective stay near **1.0** unique-information discipline while preserving collective success.

## Relational Intelligence Results

Relational world (X near Y; Y moves with Z; Z controlled by W → X controlled by W): independent live success **0**; shared_text / structured / FractiSI arms **1.0**. Supports the claim that collective intelligence can reside in maintained relationships across agents.

## Multi-Agent Coordination Results

Planning world with specialized roles: independent **0** live success; shared conditions **1.0**.

## Resource Efficiency

Duplication stats show structured shared state dominates shared text as N grows. Selective reconstruction reduces per-agent materialize payload when agents read working sets; aggregator still materializes full shared state for collective answers.

## Failure Modes

See `failure-analysis.md`.

## Ablation Results

| Condition | Role |
|---|---|
| Independent | Baseline — fails live collective merge |
| Shared text | Succeeds; high duplication at scale |
| Shared structured | Succeeds; low duplication |
| FractiSI / +deltas / +selective | Succeeds; parity with structured on success; selective is working-set policy |

## Statistical Significance

5 seeds × grid cells; mean/median/stdev/95% CI in `summary.json`. FractiSI vs structured edge ≈ 0.000 (inconclusive).

## Where FractiSI Wins

- Shared-world family (including FractiSI-shaped arms) beats independent on live collective success across knowledge, planning, relational worlds.
- Exp 002 reproduction: relationship-guided discovery 100/100 vs flat 0/100 under fixed budget.
- With selective reconstruction, agent working sets stay thin while aggregator retains coherent shared state.

## Where Competitors Win

- On these fixtures FractiSI-shaped arms are ~parity with a competent shared_structured blackboard — no large unique win claimed for branding alone.
- Literature Class C generative WMs may win perceptual realism / video prediction when executable — not measured here.
- Exact caches may win byte-identical reuse vs rhyme when strings match exactly (Tiny Gateway honesty).
- Shared text can match task success on small N while remaining simpler to implement.

## Where Approaches Are Complementary

- Pixel WMs (Genie/Cosmos) may excel at perceptual prediction while structured shared worlds excel at cross-agent fact/relation merge — not interchangeable.
- Exact-text caches win on identical strings; rhyming/structured sharing wins when wording or agent slices differ.

## Threats to Validity

- Synthetic fixtures (Level 2), not embodied robots or production multi-host clusters.
- FractiSI adapter is Tiny-Footprint-shaped, not full Git/deploy platform load.
- No live Genie/Cosmos/V-JEPA rollouts in this seed.
- CIE weights are transparent heuristics.

## Where We Were Wrong

See `failure-analysis.md` — especially: FractiSI label ≠ automatic win over a competent shared blackboard; selective reconstruction ≠ higher collective success by itself.

## Scientific Conclusion

**What does the evidence say about the hypothesis that a persistent shared world model is a fundamental coordination primitive for multi-agent intelligence?**  
→ **PARTIALLY_SUPPORTED** (shared structured/text beat independent for live collective tasks; relational chain requires shared state).

**What does the evidence say about FractiSI’s specific implementation of that idea?**  
→ **INCONCLUSIVE** (parity with shared structured state on the fair grid; distinctive Exp 002 guided-discovery receipt still reproduces).

Evidence hierarchy: **Level 2**. Do not claim Level 5.

## Next Expedition

1. Wire executable Class B adapters (DreamerV3 / TD-MPC2 / V-JEPA 2-AC) under the same WORLD interface.  
2. Multi-host persistence + conflict CRDT arm.  
3. Blind human eval on held-out planning worlds.  
4. Energy/GPU meters when Class C becomes executable.

→ ∞^∞
