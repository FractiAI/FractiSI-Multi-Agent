# FractiSI Research Expedition 002 · Beyond Memory Savings

**Testing Whether FractiSI Multi-Agent Improves Speed, Accuracy, Convergence, Discovery, and Collective Problem-Solving**

**Preliminary Experimental Abstract / Technical Paper · Version 1.0 · 5 November 2026**  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Document ID:** `WP-FRACTISI-EXPEDITION-002-BEYOND-MEMORY-EGS-2026-11-05`  
**Registry ID:** `synthobs-fractisi-expedition-002-beyond-memory-2026-11`  
**Expedition:** FractiSI Research Expedition 002 · Infinite Octave adjacency  
**Product:** FractiSI Multi-Agent · kit [`FractiAI/FractiSI-Multi-Agent`](https://github.com/FractiAI/FractiSI-Multi-Agent)  
**Suite:** `research/synthobs-fractisi-expedition-002-beyond-memory/`  
**Engine spine:** Tiny Gateway · Rhyming Templates · nested vectors · selective reconstruction  

---

## Honesty boundary

| Tier | Claims | Does not claim |
|---|---|---|
| Architecture | Shared world once + agent deltas + relationship-guided reconstruct is implementable as a lab harness | That every multi-agent framework already ships this |
| Empirical (this suite) | Structured-state resource microbench vs full copies; constrained multi-hop discovery under fixed retrieval budget | Live GPU HBM RSS; production LangGraph/AutoGen bake-off; LLM reasoning superiority |
| Product | FractiSI Multi-Agent is the commercial surface for shared-world concurrency | CapEx guarantee; universal selective-reconstruction latency win |
| Brochure program map | Eight application families are research priorities | That every brochure concurrency figure is independently receipted in this suite |

**Evidence classification:** digital architectural lab + product research expedition. Application companion — **not** ENGINE_SHELF. Not an LLM-agent trial.

---

## Abstract

Multi-agent AI systems increasingly require populations of specialized agents to work from overlapping information about the same changing environment. Conventional implementations can duplicate substantial portions of shared context, increasing memory requirements, data movement, synchronization overhead, and infrastructure costs. Efficient storage alone does not establish that an agent population can reason, coordinate, or solve problems better.

**FractiSI Multi-Agent** investigates an alternative architecture in which shared information is represented once, agent-specific changes are maintained as deltas, and task-relevant information can be selectively reconstructed through structured relationships. The broader architecture incorporates Rhyming Templates, nested vectors, multiscale organization, and dynamic reconstruction.

**Central research question:** Can reorganizing shared information enable a population of agents to produce more useful collective intelligence per unit of infrastructure?

Expedition 002 expands from a resource microbenchmark into a controlled multi-agent architectural test of discovery and collective problem-solving under a fixed information-access budget.

---

## 1. Preliminary resource experiment (E1)

A structured-state benchmark compared three configurations: independent full-world copies, a conventional shared-world representation with agent-specific overrides, and a FractiSI-style shared world with agent-specific deltas.

Parameters: 2,000 shared records · eight agent-specific overrides per agent · 100 queries per agent · populations of 10, 50, 100, and 250 agents.

**Suite receipt (seed 20261105):**

| Metric | Result |
|---|---|
| Duplication-related peak cut vs full-copy (100–250 agents) | **≥95%** (suite large-N band; full sweep ~89.6–99.2%) |
| Timed structured-state workload vs full-copy | **~37×–62×** faster in this Node harness |
| Selective / shared-delta vs conventional shared lookup | Mixed; can be **slower** on some sizes |
| Result identity across three implementations | Identical query hit counts |

**Interpretation.** Shared-world implementations eliminate most of the duplication tax versus independent full copies. Conventional shared state captures much of that basic efficiency — so resource savings alone cannot be claimed as uniquely FractiSI. Selective reconstruction is not a universal latency win.

---

## 2. Collective-capability experiment (E2)

A second controlled experiment tested discovery and collective problem-solving.

Design: 100 operational scenarios, each containing a deliberately distributed six-hop relationship chain. Both architectures received the same underlying information and the same fixed retrieval/context budget (40 records for flat skim).

- **Conventional baseline:** flat shared-world retrieval over a noise-first corpus.  
- **FractiSI-style:** relationship-guided reconstruction following explicit next-hop edges.

**Suite receipt:**

| Metric | Conventional flat | FractiSI relationship-guided |
|---|---:|---:|
| Scenarios | 100 | 100 |
| Complete hidden chains discovered | **0** | **100** |
| Correct solutions | **0** | **100** |
| Mean information-processing ops | 40 | 6 |
| Ops reduction | — | **~85%** |
| Modeled coordination rounds (6-hop) | 6 | 3 (~**50%** fewer) |

**Interpretation.** Under this constrained information topology, relationship-guided reconstruction recovered distributed relationships the flat skim missed within the same budget. That is a capability difference, not only a storage difference.

**Critical qualification.** Agents followed controlled computational procedures — not independently reasoning language models. Results do **not** establish that LLM-based FractiSI agents outperform conventional LLM multi-agent systems.

---

## 3. Findings ladder

| # | Finding | Status |
|---|---|---|
| 1 | Resource efficiency vs full-copy duplication | **Demonstrated** (suite) |
| 2 | Conventional shared state captures much basic efficiency | **Demonstrated** |
| 3 | Selective reconstruction alone is not universally faster | **Demonstrated** (mixed / slower possible) |
| 4 | Distributed relationship discovery under fixed budget | **Preliminary positive** (100/100 vs 0/100) |
| 5 | Distributed anomaly / multi-record condition recovery | **Preliminary positive** (same scaffold) |
| 6 | Collective solution completion from discovered chain | **Preliminary positive** (100/100 vs 0/100) |
| 7 | Faster architectural convergence (propagation rounds) | **Preliminary positive** (~50% fewer rounds) — not LLM dialogue turns |
| 8 | Superior LLM collective intelligence | **Not demonstrated** |

---

## 4. What remains

The decisive next experiment replaces controlled computational agents with actual LLM agents while preserving structure: same model, prompts, tools, information, roles, token budget, and infrastructure budget — only the information architecture changes.

Primary outcomes: time to verified correct decision · relationships discovered · distributed anomalies · solution quality · coordination conflicts · useful tasks completed · cost per successful task.

---

## 5. Reproduce

```bash
node research/synthobs-fractisi-expedition-002-beyond-memory/scripts/run_empirical_pipeline.mjs
```

Receipts: `research/synthobs-fractisi-expedition-002-beyond-memory/data/empirical_report.{json,md}`

Product kit: https://github.com/FractiAI/FractiSI-Multi-Agent  
Live paper surface: `/library/papers/fractisi-expedition-002-beyond-memory/` on fractisi.vercel.app  

---

## Document ID

`WP-FRACTISI-EXPEDITION-002-BEYOND-MEMORY-EGS-2026-11-05` · SynthOBS Autonomous Agent · Syntheverse Sandbox · FractiSI Research Expedition 002 · → ∞^∞
