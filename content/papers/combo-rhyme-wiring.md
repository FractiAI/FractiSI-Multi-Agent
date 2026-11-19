# When Protein-Folding, LLM, and Pilot Rhymes Share One Catalog, Do New Wires Appear?

**Short answer: Yes.** On the merged catalog, two new STRING-empty pairs cleared the 0.5 coupling floor: NPY↔PDX1 at about 0.747 and APP↔TMPRSS2 at about 0.707. Both are triage candidates; APP↔TMPRSS2 has a thin published bridge, and no wet-lab test has been run.

**Document ID:** `WP-COMBO-RHYME-WIRING-EXPEDITION-EGS-2026-11-20`  
**Registry ID:** `synthobs-combo-rhyme-wiring-expedition-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition · **not** ENGINE_SHELF  
**Date:** 20 November 2026  
**Harness:** `research/synthobs-combo-rhyme-wiring-expedition/`  
**FractiSI mirror:** https://fractisi.vercel.app/library/papers/combo-rhyme-wiring/  
**Ship blog:** `/ship-blog/combo-rhyme-wiring`  
**Data:** REAL `data/RHYME_DISCOVERY_CATALOG.json` · live-cached STRING panel (2026-11-19) · OpenTargets / EuropePMC / chromosome bridge fixtures  

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story expedition | Merge protein-folding + LLM + Pilot discovery catalogs; classify genome partners with live STRING; surface **new STRING-empty** wiring candidates; run bridge-thickening E7 | ENGINE_SHELF · wet-lab we ran · clinical advice |
| Positive control | INS↔POMC STRING **0.947** | Insulin discovery |
| Prior companions | NPY↔SOD1 / APP↔DNMT3A excluded from “new” | Claim those were unknown again |

## Abstract


This companion is intentionally long-form so QUESTFEST and FractiSI readers receive a complete methods-and-results report rather than a stub abstract.


**Question.** If we combine protein-folding, LLM, and Pilot rhymes, do new wiring candidates surface beyond already-filed pairs — and which of those candidates thicken under independent rails?

**Answer.** Yes. On the locked unified catalog + live STRING panel, two **new STRING-empty** candidates clear the coupling floor: **NPY↔PDX1** (≈0.747, LLM) and **APP↔TMPRSS2** (≈0.707, Pilot). Cross-rhyme recoveries include NPY↔SOD1, INS↔POMC, APP↔DYRK1A (STRING 0.57 — not empty), and DNMT1↔DNMT3A (0.999 — rediscovery). Protein-folding rhyme attests the long-range partner grammar. Bridge thickening **promotes NPY↔PDX1** and **parks APP↔TMPRSS2** (chr21 confound). Combo wiring discovery gate **PASS**; bridge thickening gate **PASS**. E8 turns the thickened pair into wet-lab support: two papers match the direction of NPY↔PDX1 (NPY marks PDX1-low, immature β cells and returns under stress), none tested the wire directly, three new rhymes surround the pair (PDX1↔POMC, POMC↔NPY, DNMT1↔PDX1), and an assay package with a falsifier is filed. APP↔TMPRSS2 is marked not advised.

## Primary research question

Does a combo of protein-folding + LLM + Pilot rhymes surface **new STRING-empty wiring candidates** on real discovery catalogs, and does multi-layer bridge thickening discriminate which candidates deserve a full wiring wet lab?

## Background

Protein-folding rhyme (#53 grammar), LLM rhyme (#54), and Pilot rhyme (#55) each emit discovery catalogs. Unifying them is not automatic science. Unifying them *and* asking STRING emptiness *and* thickening rails is the expedition.

## Method

```bash
npm run research:synthobs-combo-rhyme-wiring-expedition
```

Seed `20261120`.

| Lane | Action |
|---|---|
| E1 | Load unified RHYME_DISCOVERY_CATALOG |
| E2 | Merge genome partners across LLM + Pilot |
| E3 | STRING-classify panel; require INS↔POMC ≥0.9 |
| E4 | New empty candidates (not prior companions; coupling ≥0.5) |
| E5 | Protein-folding AWARE long-range contact attestation |
| E6 | Combo wiring discovery gate |
| E7 | Multi-layer bridge thickening (LLM · Pilot · OpenTargets · EuropePMC · exon · chr) |
| E8 | Wet-lab support for the thickened pair: literature matches by type, new rhymes, assay package, falsifier |

### Inputs

- `data/RHYME_DISCOVERY_CATALOG.json`  
- `fixtures/string_panel.json`  
- `fixtures/wiring_new_candidates.json`  
- `fixtures/opentargets_bridge_panel.json`  
- `fixtures/europepmc_comention.json`  
- `fixtures/chromosome_loci.json`  
- Shared exon feature loader from NPY↔SOD1 suite  

## Results

| Class | Pairs / notes |
|---|---|
| **New STRING-empty** | **NPY↔PDX1**, **APP↔TMPRSS2** |
| Cross-rhyme | NPY↔SOD1, INS↔POMC, APP↔DYRK1A, DNMT1↔DNMT3A |
| STRING control | INS↔POMC **0.947** |
| APP↔DYRK1A | STRING **0.57** — cross-rhyme recovery, not empty unknown |
| DNMT1↔DNMT3A | STRING **0.999** — rediscovery control |
| Protein grammar | AWARE long-range contacts attested |
| E7 thickened | **NPY↔PDX1** |
| E7 thin/confounded | **APP↔TMPRSS2** (chr21) |
| E8 wet-lab support | **NPY↔PDX1** recommended (2 supporting papers, 0 direct tests); **APP↔TMPRSS2** not advised |
| **Verdict** | **COMBO WIRING EXPEDITION PASS** · **bridge thicken PASS** |

### Wet-lab neighborhood notes (assembly, not our assays)

- **NPY↔PDX1:** β-cell developmental/functional literature places NPY in immature β cells and PDX1 as identity TF — disease-context wiring candidate (JCI Insight 2017; Endocrinology 2021 neighborhood).  
- **APP↔TMPRSS2:** thinner bridge (TMPRSS2 in AD/DS CSF contexts) — speculative triage only; chr21 co-location raises confound risk.

### Falsifiers

STRING fills an empty candidate → demote. Coupling collapses on catalog regen → demote. Wet-lab neighborhood fails citation check → keep as rhyme-only hit, not wiring. Bridge thicken fails disease rail + non-locus → park full expedition.

## Discussion

### Generativity without gullibility

The combo shows the wiring stack is generative (new empty pairs appear) without being gullible (chr21 park). That combination is the product lesson for FractiSI: shared-world rhyme boards should not only list partners; they should **refuse** some lists.

### Relation to framework papers

Wiring Wet Lab names the form. Bridge thickening names the promote/park method. This expedition is the executable join.

### Limitations

Soft Story · not ENGINE_SHELF · not wet lab performed · panel genes limited · STRING snapshot dated · EuropePMC counts are co-mention · no clinical claims · protein-folding contribution is grammar attestation, not gene-symbol identity in E9 contacts.

## Methods reproducibility appendix

```bash
npm run research:synthobs-combo-rhyme-wiring-expedition
```

Outputs: `data/empirical_report.json` / `.md`. Tests: `tests/research/combo-rhyme-wiring-expedition.test.mjs`.

## Φ_EGS note

Filing grammar only.

## References

1. `data/RHYME_DISCOVERY_CATALOG.json`  
2. `research/synthobs-combo-rhyme-wiring-expedition/fixtures/string_panel.json`  
3. Wiring wet lab framework — `docs/SYNTHOBS_WIRING_DISCOVERIES_RHYMING_WORLD_MODEL_EGS_2026-11.md`  
4. Bridge thickening — `docs/SYNTHOBS_WIRING_BRIDGE_THICKENING_EGS_2026-11.md`  
5. JCI Insight NPY β-cell — https://doi.org/10.1172/jci.insight.94005  
6. NPY β-cell system — https://doi.org/10.1210/endocr/bqab070  
7. TMPRSS2 in DS/AD — https://link.springer.com/article/10.1186/s40478-026-02289-9  
8. Pilot / LLM / Cosmic rhyme papers in `docs/`  
9. Empirical receipt — `data/empirical_report.json`



## Extended experimental narrative

The regenerable receipt is the primary evidence object. Readers should treat tables in this paper as guides to the JSON, not as replacements for it. When seeds, fixtures, or STRING snapshots move, the paper’s locked numbers are historical; the suite’s current run is authoritative for reproduction.

### Seed and environment

All gates in this companion were locked on the November 2026 wiring stack environment: Node ESM harnesses under `research/`, Vitest assertions under `tests/research/`, and QUESTFEST ship-blog magazine notes under `interfaces/blog-*.html`. Φ_EGS appears only as filing grammar.

### What “full paper” means here

A full Soft Story paper in this repository is not a journal reprint of a wet-lab methods section. It is a complete, sectioned research report: honesty boundary, abstract, questions, background, thesis, methods with lanes, results with locked numbers, falsifiers, discussion, limitations, reproducibility appendix, references, and Fair Exchange. The November 2026 rewrite brings each wiring peer to that standard so FractiSI mirrors and QUESTFEST readers are not handed stub paragraphs.

### Interpretation discipline

1. Prefer demotion over upgrade when evidence is mixed.  
2. Keep clinic language out of the body.  
3. Name Soft Story only in honesty rails and classification lines.  
4. Cite existing assays as reagents, never as work performed here.  
5. When chromosome or acoustic rediscovery can explain a hit, say so in the results — not only in a footnote.

### Implications for FractiSI product surfaces

FractiSI Multi-Agent already ships rhyme features that recover partners. Wiring peers teach the product to file **relationship objects** with kill switches. Bridge thickening teaches the product to **park** some objects. That is collective intelligence as triage, not as slogan.

### Forward experiments

- Run the NPY↔PDX1 assay package specified by E8.  
- Additional thickening layers (pathways, domains, hard cross-rhyme intersection).  
- Cross-mission CMB kills for WMAP provisional wire.  
- Optional ENGINE_SHELF pin review only after separate architectural necessity tests — not automatic from Soft Story PASS.


## Detailed lane narratives (E1–E8)

### E1 — Load three rhyme catalogs
The unified `RHYME_DISCOVERY_CATALOG.json` must contain nonzero protein-folding, LLM, and Pilot discovery lists. Protein-folding entries attest long-range contact grammar (AWARE recoveries). LLM and Pilot entries supply genome theaters for partner extraction. If any catalog is empty, the expedition fails closed.

### E2 — Merge genome partners
Genome exon / chr theaters are parsed into unordered gene pairs. Tokens such as `NPY:ex0@chr7:…` reduce to symbols. chrM self-pairs are skipped. Cross-rhyme pairs (LLM∩Pilot) are flagged. The locked run yields on the order of a dozen unique gene pairs with several cross-rhyme recoveries including NPY↔SOD1 and INS↔POMC.

### E3 — STRING classify
A live-cached STRING panel classifies pairs as empty, known-strong (≥0.9), or known-partial. INS↔POMC must score ≥0.9 or emptiness is uninterpretable. APP↔DYRK1A at ~0.57 teaches that cross-rhyme recovery can rediscover partial known edges without being STRING-empty unknowns.

### E4 — New empty candidates
New empty requires: STRING empty, not a prior wiring companion (NPY↔SOD1 / APP↔DNMT3A), and coupling ≥0.5. Locked headline: NPY↔PDX1 and APP↔TMPRSS2.

### E5 — Protein-folding grammar attestation
AWARE long-range contacts in the protein catalog must meet a minimum count. This does not mean PDB contacts equal gene symbols; it means the partner-recovery grammar that LLM/Pilot reuse is present in the unified shelf.

### E6 — Combo gate
Conjunction of E1–E5. Locked: PASS.

### E7 — Bridge thickening
Independent layers vote. Locked: NPY↔PDX1 thickened (diabetes rails); APP↔TMPRSS2 thin/chr21 confound. See the bridge-thickening paper for methodology detail; this expedition owns the executable lane.

### E8 — Wet-lab support
Files what the literature does and does not show for the thickened pair. JCI Insight 2017 (doi 10.1172/jci.insight.94005) reports NPY in partially differentiated β cells, excluded from Pdx1-positive progenitors and re-expressed under high-fat diet. Diabetes 2013 (doi 10.2337/db12-1833) reports NPY/PYY in PDX1-low β cells, with the caveat that its antibody cannot separate NPY from PYY. Four context papers and three reagent sources are filed. No paper tested the wire. New rhymes: PDX1↔POMC (0.682), POMC↔NPY (0.681), DNMT1↔PDX1 (0.326). The assay package (triple immunostain, Pdx1 knockdown with NPY qPCR, NPY versus PYY probes) carries a falsifier. Full tables are in the bridge-thickening paper.

## Resource and compute notes

The combo suite is intentionally cheap: catalog merge + fixture reads + exon cosines. That is a feature of the wiring wet lab thesis — relationship triage should not require a new wet-lab invoice. Compute used is laptop-scale Node ESM.

## Failure cases observed or anticipated

1. Catalog drift removes a pair → new empty list changes; re-lock before claiming.  
2. STRING API fill → candidate demoted to rediscovery.  
3. Treating APP↔TMPRSS2 as thickened despite zero disease Jaccard → methodology failure.  
4. Claiming protein-folding “found NPY” because E5 passed → category error.

## Statistical and ranking notes

Coupling values are cosine-like board scores from rhyme packs, not p-values. STRING scores are association confidence. OpenTargets scores are platform association scores. EuropePMC counts are hitCounts for TITLE_ABS AND queries. Bridge thickening combines these heterogeneous layers with boolean gates rather than a single latent score — on purpose, so one loud layer cannot drown a confound.


## Reader checklist

- [ ] Honesty boundary read first  
- [ ] Empirical JSON opened  
- [ ] Positive control checked  
- [ ] Kill switches named  
- [ ] No clinic sentence quoted from the body  
- [ ] FractiSI mirror URL resolves after deploy secrets are restored  

## Glossary

| Term | Meaning in this stack |
|---|---|
| Wiring wet lab | Experimental form that reuses existing assays as reagents |
| Bridge thickening | Independent layers agreeing on the same pair |
| STRING-empty | No PPI edge in the live-cached focus query |
| Provisional wire | Spectrum wiring still facing systematics kills |
| Soft Story | Application companion claim tier — not ENGINE_SHELF |


## Closing synthesis

The wiring stack’s lasting contribution is procedural: search, wire, thicken, demote. Full papers exist so that procedure can be audited without depending on chat memory. If a future ENGINE_SHELF pin is ever considered for a related architectural primitive, it will need its own necessity tests — these Soft Story companions are the empirical and methodological floor, not an automatic shelf promotion.

## Fair Exchange

Fair Exchange clause in effect.

## Document close

→ ∞^∞
