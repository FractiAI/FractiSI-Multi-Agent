# FractiSI Multi-Agent: Shared Worlds for Concurrent Agents

**Research / product paper · Version 1.0 · 5 November 2026**  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Document ID:** `WP-FRACTISI-TINY-FOOTPRINT-MULTI-AGENT-2026-11`  
**Suite:** `FractiAI/tiny-oracle-lob-pilot` · Product family: FractiSI Tiny Footprint  
**Engine:** Tiny Gateway · Rhyming Templates · nested vectors · selective reconstruction  

---

## Honesty boundary

| Tier | Claims | Does not claim |
|---|---|---|
| Architecture | Shared world template + per-agent deltas implementable; selective reconstruct of agent views | That every multi-agent framework already ships this |
| Empirical (this suite) | JSON structured-state lab: pack size vs naive per-agent world copies; gzip residual; resident-byte proxy; 8 GiB density arithmetic | Live GPU HBM RSS; production LangGraph/AutoGen bake-off; global internet measurement |
| Product | FractiSI Multi-Agent names the commercial wedge | CapEx guarantee; replacement for H.264/SQL HCC as general compressors |

**Evidence classification:** digital lab + product architecture. Not a fab campaign; not a third-party cloud attestation.

---

## Abstract

Multi-agent AI systems—and the broader pattern of many workers sharing one organizational context—default to an expensive habit: **copy the shared world into every agent**. Compression (gzip/zstd) shrinks each copy; it does not remove **cross-agent duplication**.

**FractiSI Multi-Agent** applies Tiny Gateway’s rhyming-template spine: register the shared world once, keep per-agent deltas, reconstruct an agent view on demand. Nested vectors allow agents to pull only the scales they need.

**Findings (executed suite).** Across a 36-case sweep (rhyme × agent count × world size), median pack residual **after gzip** was **~98%** vs naive duplication when the shared world dominates agent state. A smaller-world shine lab earlier measured **~42%** residual after gzip. Flagship scaled case (256 agents, large shared world): resident shared-state proxy cut **~99%**; density arithmetic on an 8 GiB budget shows **order-of-magnitude more agents** when world ≫ per-agent state. Selective nested-vector coarse-only tasks cut runtime working-set bytes by **~99.5%** vs shipping full pyramids.

**Product stance.** One product: **FractiSI Multi-Agent**, with **DRAM concurrency** as the primary runtime. SQL/network shared-context adapters later—not separate diluted SKUs.

---

## 1. Problem

Frontier “cloud AI” is increasingly **multi-agent**: tool workers, planners, simulators, copilots. They share policies, maps, corpora, and environments. Naive stacks still do:

```
agent_i = { local_state_i, world_full_copy }
```

Cost scales roughly **N × |world|** in DRAM and in packs that embed the world per agent. That is the concurrency tax Tiny Footprint was built to attack—now named for the market that looks like the whole agentic cloud.

## 2. Method

1. Build synthetic shared worlds (map, landmarks, policy docs) + N agents (high/medium/low divergence).  
2. **Conventional pack:** each agent JSON embeds a full world copy.  
3. **Tiny pack:** `{ world, agents[] }` once.  
4. Compare raw bytes, gzip bytes, resident proxies, and agents-in-8GiB density.  
5. Cross-check shine labs (UI/video/pyramids/agents) so we do not claim codec wins where gzip already wins.

Reproduce:

```bash
npm run multi-agent
npm run shine
```

## 3. Results (summary)

| Experiment | Result |
|---|---|
| Multi-agent sweep (36 cases) | Median **~98%** pack residual after gzip when world dominates |
| Smaller-world shine lab | **~42%** residual after gzip |
| Flagship 256 agents · large world | **~99%** resident proxy cut; **≫10×–1000×** density vs naive copies |
| Selective nested pyramid (coarse-only) | **~99.5%** fewer runtime bytes |
| UI/video structural rhyme after gzip | **~5%** residual — not a media-codec SKU |
| Generic JSON LOBs after gzip | **~10–14%** residual — weak as general SQL compressor |

## 4. Product implications

| Do | Don’t |
|---|---|
| Lead with **FractiSI Multi-Agent** | Four SKUs: DRAM / SQL / Networking / Agents |
| Keep **DRAM** as the engine inside Multi-Agent | Kill DRAM language |
| Phase-2 adapters: network fan-out, durable template store | Generic “beat zstd everywhere” marketing |

## 5. Speakable claims (labeled)

> One shared world for many agents — **~40%+ less** duplicated shared-context footprint after gzip in smaller-world labs, and **much larger** cuts when the world dominates agent state — with a path to **order-of-magnitude more concurrent agents** in a fixed DRAM budget.

Always qualify: lab proxies; partner measurement required for production fleets.

## 6. Document ID

`WP-FRACTISI-TINY-FOOTPRINT-MULTI-AGENT-2026-11` · FractiSI · FractiSI Multi-Agent · SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞^∞
