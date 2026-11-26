# Does a Director/Pilot Role Rhyme Beat Flat Peers on Multi-Hop Coordination and Exact-Text Caches on Store Size?

**Short answer: Yes.** On 100 six-hop missions, all three Director/Pilot arms recovered 100 of 100 while flat peers recovered 0. Pilot Rhyme's store was 67,243 B, 22% smaller than the exact-text cache (0 hits) and 80% smaller than private copies; the accuracy gain comes from the roles, not the rhyme.

**Document ID:** `WP-PILOT-RHYME-EXPEDITION-EGS-2026-11-18`  
**Registry ID:** `synthobs-pilot-rhyme-expedition-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition · Infinite Octaves ENGINE_SHELF #55 · FractiSI Rhyming World Model rhyme feature  
**Date:** 18 November 2026  
**Harness:** FractiSI Multi-Agent `research/pilot-rhyme-expedition/` · mirror `research/synthobs-pilot-rhyme-expedition/`  
**Standalone:** [`FractiAI/synthobs-pilot-rhyme-expedition`](https://github.com/FractiAI/synthobs-pilot-rhyme-expedition)  
**Ship blog:** `/ship-blog/pilot-rhyme-expedition`

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story / application companion | Director/Pilot **role rhyme** lab for multi-agent coordination | CapEx guarantee · embodied robotics · LLM bake-off |
| Empirical (Level 2–3) | 100 six-hop missions · five arms · regenerable Node lab | Level 5 field robotics |
| Pattern source | LingBot-style Director/Pilot **paper seats** rebuilt in-house | LingBot v2 weights (CC BY-NC-SA — rejected for commercial core) |
| Differentiated claim | Store size when mission wording differs (exact cache 0 hits) | Unique accuracy vs other Director/Pilot arms (those also score 100/100) |

## Title lock

**Pilot Rhyme** is the fifth Rhyming World Model rhyme feature of FractiSI Multi-Agent, beside Rhyming Templates, Shared-World Rhyme, Protein Folding Rhyme (#53), and LLM Rhyme (#54).

## Primary research question

Does a Director/Pilot **role rhyme** (reusable role template + shared world + per-mission deltas) outperform flat peers on multi-hop coordination, and beat an exact-text role cache on store size when mission wording differs?

## Method

Five arms on 100 missions (seed `20261118`, six hops, three Pilots under one Director):

1. **flat_peers** — equal agents, private skims, no roles  
2. **shared_text** — unstructured shared board, no roles  
3. **director_pilot_private** — roles with private full copies  
4. **director_pilot_exact_cache** — roles with exact-text packet cache  
5. **director_pilot_rhyme** — Pilot Rhyme (template once + shared world + deltas)

Run: `npm run research:pilot-rhyme-expedition` (kit) or `npm run research:synthobs-pilot-rhyme-expedition` (SING 13).

**Theater arm:** same public Cosmic/LLM fixtures; long-range held-out partner tasks; arms `flat_peers` vs `director_pilot_rhyme` (Director map + Pilot locals). Catalog rows where Pilot hits and flat misses.

## Results

| Arm | Wins / 100 | Store |
|---|---:|---|
| Flat peers | 0 | 429,278 B |
| Shared text | 0 | 88,757 B |
| Director/Pilot · private | 100 | 344,644 B |
| Director/Pilot · exact cache | 100 | 86,161 B · **0 hits** |
| **Director/Pilot · Pilot Rhyme** | **100** | **67,243 B · 22% vs exact · 80% vs private** |

**Verdict:** SUPPORTED for the stated question. Role structure recovers the chain; Pilot Rhyme keeps the store smaller when wording differs.

## Rhyming World Model feature lock

Pilot Rhyme = Director holds the map · Pilots run local steps · roles stored once · each mission as only what differs · one shared world.


## Theater candidate recovery

Director holds the coupling map; Pilots hold local ordered slices; flat peers only see local windows. Long-range held-out partners are the same fixture grammar used by Cosmic / LLM rhyme theaters.

| Theater | Tasks | Flat peers | Pilot Rhyme | Named candidates (Pilot hit · flat miss) |
|---|---:|---:|---:|---:|
| cosmic · exoplanet | 169 | 0% | **100%** | **169** |
| cosmic · neo | 96 | 0% | **100%** | **96** |
| cosmic · ngc | 173 | 0% | **100%** | **173** |
| cosmic · wmap_tt | 148 | 0% | **100%** | **148** |
| genome · exon | 39 | 0% | **100%** | **39** |
| genome · chrM | 67 | 0% | **100%** | **67** |
| **Total** | **692** | **0%** | **100%** | **692** |

Example named candidates: `Kepler-607 c ↔ TOI-1758 b`, `2022 AP1 ↔ 2025 WO`, `IC…` pairs, `ell-…` multipole pairs, `INS:ex2 ↔ POMC:ex2`. Full list: `research/synthobs-pilot-rhyme-expedition/data/DISCOVERY_CATALOG.md`.

Private Director/Pilot copies also recover the board gold (roles+map); the **flat-miss catalog** is what Pilot seats surface as discovery candidates on these theaters. Genome rows remain public-panel demos, not clinical findings. Cosmic rows are fixture coupling partners, not finished astrophysical discoveries.

## Φ_EGS / catalog

Architectural key only: $\Phi_{\mathrm{EGS}}=(1+\sqrt{5})/2$. Soft Story filing — not a CODATA claim.

## Methods detail

- Seed: `20261118`. Scenarios: 100. Hops: 6. Pilots: 3 under one Director.
- Arms: `flat_peers`, `shared_text`, `director_pilot_private`, `director_pilot_exact_cache`, `director_pilot_rhyme`.
- Rhyme store = role template bytes (once) + UTF-8 JSON deltas for hop facts.
- Exact cache key = full role+mission packet; hit only on identical bytes.
- Reproduce: `npm run research:synthobs-pilot-rhyme-expedition` · kit `npm run research:pilot-rhyme-expedition`.
- Receipt: `research/synthobs-pilot-rhyme-expedition/data/empirical_report.json`.

## References

1. FractiSI Multi-Agent kit — `research/pilot-rhyme-expedition/` · `/library/papers/pilot-rhyme-expedition/`
2. Rhyming vs Non-Rhyming World Models — `docs/SYNTHOBS_SHARED_WORLD_COLLECTIVE_INTELLIGENCE_EGS_2026-11.md` · `/whitepaper/shared-world-collective-intelligence`
3. LLM Rhyme Expedition — `docs/SYNTHOBS_LLM_RHYME_COSMIC_GENOME_EXPEDITION_EGS_2026-11.md` · `/whitepaper/llm-rhyme-cosmic-genome`
4. Tiny Gateway · Rhyming Templates — `docs/SYNTHOBS_TINY_GATEWAY_RHYMING_TEMPLATES_EGS_2026-11.md` · ENGINE_SHELF #52
5. World-model assimilation note (Director/Pilot seat pattern; NC weights rejected) — FractiSI `docs/research/world-model-assimilation/EXECUTIVE_RECOMMENDATION.md`

## Fair Exchange

Fair Exchange clause in effect for this Soft Story filing and repository configuration.

## Document close

→ ∞^∞
