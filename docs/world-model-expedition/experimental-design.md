# Experimental Design · Shared World Models Expedition

**Document ID:** `WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18`  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox

## Research questions (kept separate)

1. Is a shared world better than independent world models?
2. Is structured shared state better than shared text/context?
3. Does FractiSI’s particular implementation outperform other shared-world architectures?

## Hypotheses

**Primary:** Agents become more capable collectively when they operate over a coherent shared world state rather than repeatedly reconstructing overlapping versions of the world independently.

**Secondary:** A shared world model can improve collective intelligence by reducing redundant reconstruction, preserving relational state, improving cross-agent consistency, accelerating convergence, and allowing differentiated agents to build on one another’s discoveries.

**Ultimate DV:** Useful collective intelligence per unit of compute, latency, memory, communication, and world-state reconstruction — **not** memory compression alone.

## Taxonomy (operational)

| Class | Meaning | In this harness |
|---|---|---|
| A Shared symbolic/structured | Blackboard / state graph / FractiSI | EXECUTABLE |
| B Latent predictive | Dreamer-family RSSM, TD-MPC-lite, MuZero-lite (live CPU); V-JEPA 2 | LIVE family arms on CPU; V-JEPA needs GPU |
| C Generative world simulators | Genie 3/4, Cosmos | NOT EXECUTABLE (closed or heavy GPU; visual ≠ shared blackboard) |
| D Hybrid | language + structured + latent | Future arm |

## Common WORLD interface

`observe, read_state, write_state, predict, simulate, share, fork, merge, materialize, reset`

Capability tags: `native | adapter | unavailable`. Unsupported ops throw — never silently fabricated.

## Ablations (Conditions 1–6)

1. Independent agents  
2. Shared text context  
3. Shared structured state  
4. FractiSI shared world  
5. FractiSI + agent deltas  
6. FractiSI + selective reconstruction  

## Worlds

- **A Knowledge** — chain A+B+C+D+E reconstruction  
- **B Dynamic** — temporal updates + contradictions  
- **C Planning** — specialized roles  
- **D Adversarial** — noise, failure, corruption  
- **Relational** — X↔Y↔Z↔W inference  

## Metrics

Raw families first: Coherence · Collective Intelligence · Coordination · Resource · Adaptation.  
CIE is **secondary** composite only.

## Statistical protocol

Seeds [1, 2, 3, 4, 5]. Report mean, median, stdev, 95% CI. No single best-run cherry-pick.

## Fairness

Held constant: seeds, world fixtures, agent counts per grid cell, Node runtime.  
Differed: world representation / share semantics.  
NOT EXECUTABLE models listed in results — no fabricated scores.

→ ∞^∞
