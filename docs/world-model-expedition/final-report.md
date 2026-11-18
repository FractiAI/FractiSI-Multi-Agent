# Final Report v2 · Shared World Models for Collective Intelligence

**Document ID:** `WP-SHARED-WORLD-COLLECTIVE-INTELLIGENCE-V2-EGS-2026-11-18`  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox

## Executive Summary

v1 under-tested rhyme and made FractiSI look like a tie against any shared blackboard. **v2 redesigns the expedition** around the real FractiSI rhyme engine plus pinned public fixtures (E9 PDB/Pfam, Movebank GPS).

| Question | Verdict |
|---|---|
| Shared world as coordination primitive | **PARTIALLY_SUPPORTED** |
| FractiSI rhyme vs non-rhyming exact/prefix/flat | **PARTIALLY_SUPPORTED** |
| FractiSI vs shared_structured on E9 **task** | edge=0 (parity) |

**Where rhyme excelled (measured):** R0_differing_bytes_vs_exact_cache, R1_rhyme_beats_conventional_full_copies, G_exp002_guided_discovery, P_e9_rhyme_bytes_vs_exact_cache, M_movebank_rhyme_bytes_vs_exact_cache

**Where rhyme did not dominate:** prefix reuse still beats rhyme when the shared system string is identical (R1: conventional 12004 · prefix 1241 · rhyme 3428 bytes). Shared structured matches FractiSI on E9 task success — the FractiSI edge is organizational reuse under **non-identical** text, not a monopoly on merging facts.

## Why this is more accurate than v1

1. Uses real `compareRhymeToCache` / `rhymeCohort` (four-pillar audit).  
2. Uses real E9 scenarios with **gold-leak-free** agent splits.  
3. Uses real Movebank GPS utterances.  
4. Separates **task success** from **byte/reuse** wins.  
5. Explicitly allows FractiSI to lose to prefix on identical strings.

## Headline numbers

- R0 differing words: exactTextHits=0; rhyme beats exact cache (~45% byte reduction vs cache).  
- E9 (16 real PDB/Pfam scenarios): independent task rate **0**; shared/rhyme task rate **1**; batched rhyme corpus 48 sessions, rhymeVersusCache ≈ **0.33147657337945285**.  
- Movebank: shared centroid succeeds; independent fails; rhymeVersusCache ≈ **0.36** with exactTextHits=0.  
- Exp 002: guided 100/100 vs flat 0/100.

## Scientific answers

**Is a persistent shared world a coordination primitive?**  
→ **PARTIALLY_SUPPORTED**

**Does FractiSI rhyme outperform non-rhyming models where organization rhymes but text differs?**  
→ **PARTIALLY_SUPPORTED** — Rhyme outperforms exact-cache / full copies where text differs but organization rhymes; may lose to prefix reuse when strings are identical. Task success vs shared_structured reported separately.

Evidence level: Level 2–3: real pinned public fixtures (Movebank, RCSB/Pfam E9) + regenerable process measurements. Not Level 5 embodied.

## Next expedition

Wire DreamerV3 / V-JEPA under the same WORLD interface; add E12 collab fixtures; optional live GPU arms without inventing scores.

→ ∞^∞
