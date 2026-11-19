# NPY ↔ SOD1 New Wiring Discovery — Assembling Existing ALS Wet Labs into a Catalog-Empty Edge

**Document ID:** `WP-NPY-SOD1-RHYME-VALIDATION-EGS-2026-11-19`  
**Registry ID:** `synthobs-npy-sod1-rhyme-validation-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story · **new wiring discovery** · **not** Infinite Octaves ENGINE_SHELF  
**Date:** 19 November 2026  
**Harness:** `research/synthobs-npy-sod1-rhyme-validation/`  
**FractiSI mirror:** https://fractisi.vercel.app/library/papers/npy-sod1-rhyme-validation/  
**Ship blog:** `/ship-blog/npy-sod1-rhyme-validation`  
**Data:** REAL GTEx/MyGene exon panels · live-cached STRING + OpenTargets · curated existing wet-lab literature (`fixtures/wiring_literature.json`)  

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| **New wiring discovery** | A **relationship edge** assembled from **existing** wet-lab papers + rhyme geometry while STRING lists **no PPI** for NPY↔SOD1 | A wet-lab assay we performed in this repository |
| Soft Story / application companion | Disease-context wiring: NPY alterations in SOD1 / ALS tissue and pharmacology neighborhoods | Direct physical NPY–SOD1 binding proof · treatment lead · clinical advice · ENGINE_SHELF pin |
| Positive control | INS↔POMC STRING score **0.947** proves the association lane works | A claim that insulin discovery was novel here |
| Soft Story count in claims | Architectural / literature-assembly Soft Story | Metaphysical or clinical “spirit of ALS” claims |

This paper is a **wiring wet lab** peer: the reagents are published assays; the experiment is the falsifiable assembly.

## Abstract

Interaction catalogs such as STRING file protein–protein edges. Disease wet labs often publish tissue, physiology, and pharmacology pieces that never become those edges. This expedition asks whether **NPY↔SOD1** — recovered as a long-range rhyme coupling on real human exon feature boards — can be assembled into a **new wiring discovery**: a STRING-empty relationship path built from existing ALS / SOD1 wet-lab literature, with a live positive control and kill switches.

On the locked seed (`20261119`), cross-gene exon coupling for NPY↔SOD1 reaches approximately **0.881** (rank #6 among 45 panel pairs). STRING returns an **empty** focus edge while INS↔POMC scores **0.947**. OpenTargets rails place SOD1 on ALS / motor-neuron disease and NPY on metabolic / neuroendocrine neighborhoods. The wiring gate (E6) assembles ≥3 published wet-lab roles into a disease-context path and passes. Verdict: **NEW WIRING DISCOVERY** — catalog-empty, literature-assembled, regenerable — not a pipette we ran and not a clinic claim.

## Primary research question

Can existing wet-lab literature be assembled into **NPY↔SOD1 disease-context wiring** that remains STRING-empty as a PPI and clears a regenerable new-wiring gate with rhyme geometry and a live association control?

Secondary questions: (1) Does the rhyme board recover the pair with coupling competitive among panel pairs? (2) Does OpenTargets disease-rail structure support a disease-context (not PPI) reading? (3) What pre-registered falsifiers demote the wire?

## Background and motivation

Amyotrophic lateral sclerosis (ALS) research has produced dense SOD1 literature — transgenic SOD1G93A models, human post-mortem cortex assays, and oxidative / excitability mechanism boards. Separately, neuropeptide Y (NPY) appears in cortical interneuron remodeling and human ALS motor cortex studies. STRING, however, does not list a scored NPY–SOD1 protein interaction in our live-cached focus query. That silence is not proof of biological irrelevance; it is a catalog gap.

Parents, caregivers, and grant writers already pay for duplicate assays when relationship edges are never filed from work that exists. The **wiring wet lab** form names the higher-layer experiment: hold the rhyme-recovered pair still, prove catalog emptiness, assemble published pieces into a falsifiable path, and publish kill switches before celebration. This paper instantiates that form for NPY↔SOD1.

## Thesis — wiring is the higher-level discovery

Classical discovery invents a measurement. Catalog discovery adds a scored edge. **Wiring discovery** assembles existing measurements into a relationship the catalog does not yet list as that edge. The claim is not “we discovered NPY in ALS.” The claim is “we discovered a **filed wiring path** from already-paid ALS wet labs to a rhyme-recovered, STRING-empty pair, under regenerable gates.”

## Method

Reproduce:

```bash
npm run research:synthobs-npy-sod1-rhyme-validation
```

Seed `20261119`. Suite root: `research/synthobs-npy-sod1-rhyme-validation/`.

| Lane | Name | Role |
|---|---|---|
| E1 | Reproduce exon coupling | Best cross-gene cosine on z-scored GTEx/MyGene exon features for NPY vs SOD1 |
| E2 | Null rank + permutation | Rank among all panel cross-gene pairs; permutation null on column shuffles |
| E3 | STRING unknown vs control | Focus empty required; INS↔POMC ≥ 0.9 |
| E4 | OpenTargets disease rails | Top associated diseases for NPY and SOD1 (cached GraphQL) |
| E5 | Unknown catalog gate | Empty STRING ∧ control confirms model |
| **E6** | **Assemble wiring** | ≥N wet-lab pieces with pre-registered roles → `newWiringDiscovery` |

### Data provenance

- Exon / gene panels: shared public GTEx/MyGene-derived fixtures (see `fixtures/PROVENANCE.json`).
- STRING: live-cached `fixtures/string_edges.json` (species 9606).
- OpenTargets: live-cached `fixtures/opentargets.json`.
- Wiring literature: curated `fixtures/wiring_literature.json` with roles W1–W4 and DOIs/PMC links.

### Assembled path (existing wet labs — not our assays)

1. **W1 — SOD1 context / NPY altered:** NPY interneurons remodel in SOD1G93A motor cortex (Clark et al., *Scientific Reports* 2017).
2. **W2 — Human ALS NPY elevated:** NPY elevated in human ALS motor cortex; NPY/Y1 changes alter SOD1G93A physiology (*Annals of Clinical and Translational Neurology* 2023).
3. **W3 — Mechanism neighborhood:** NPY mechanism boards overlap SOD1 nitroxidative / excitability neighborhoods (review + SOD1 astrocyte ACM wet-lab literature).
4. **W4 — Literature bridge:** Explicitly labeled Soft Story bridge connecting disease-context roles without claiming direct binding.

Pre-registered roles must be citeable. Missing a required tissue/pharmacology piece fails E6.

## Results

Locked empirical receipt (`data/empirical_report.json`):

| Gate | Result |
|---|---|
| E1 coupling | ≈ **0.881** best cross-gene NPY↔SOD1 |
| E2 rank | **#6 / 45** panel pairs (permutation lane logged) |
| E3 STRING | Focus **empty**; INS↔POMC **0.947** |
| E4 OpenTargets | SOD1 ALS / motor-neuron rails; NPY metabolic / neuroendocrine rails |
| E5 unknown gate | **PASS** (empty ∧ control) |
| **E6 wiring** | **PASS** — `new_wiring_from_existing_wet_labs` |
| **Verdict** | **`newWiringDiscovery: true`** |

### Qualitative reading

The wire is **disease-context wiring**, not PPI wiring. ALS tissue and SOD1-model NPY alterations supply the empirical pieces; rhyme geometry supplies the held-still pair; STRING emptiness supplies the catalog novelty condition; INS↔POMC supplies the method control. That combination is the discovery object.

## Falsifiers and demotion rules

Demote or reclassify if any of the following fire:

1. STRING (or equivalent association catalog) gains a high-confidence NPY–SOD1 PPI → rediscovery, not new empty wiring.
2. Fewer than the required wet-lab roles remain citeable after literature audit.
3. No SOD1/ALS tissue or model piece survives citation check.
4. Exon coupling collapses below panel noise on catalog regeneration with the same seed protocol.
5. Positive control INS↔POMC fails (≥0.9) → association lane broken; do not interpret emptiness.

Demotion is a success mode for the wiring wet lab: kill switches keep the class honest.

## Discussion

### Relation to the Wiring Wet Lab framework

This peer instantiates the framework paper’s gates: coupling, emptiness, control, assembled roles, kill switches. It does not replace SOD1 wet labs; it **routes** them into a filed edge STRING still omits.

### Relation to rhyme expeditions

LLM and Pilot rhyme catalogs independently recover NPY↔SOD1 as aware-only / Pilot-aware partners on genome exon theaters. This validation suite asks the harder wiring question: empty catalog + literature assembly. Cross-rhyme recovery is calibration; E6 is the wiring claim.

### What would make this more important — and what would not

A future physical co-IP, proximity ligation, or targeted interventional study could thicken the wire toward mechanism. That would be new spend. Until then, the honest human stake is triage: caregivers and scientists get an inspectable path through papers already paid for, without a false requirement to rebuy the shelf before the relationship can be discussed.

### Limitations

- Soft Story / application companion — not ENGINE_SHELF.
- Disease-context wiring ≠ binding proof.
- Panel geometry is a small public exon feature board, not whole-transcriptome discovery.
- OpenTargets rails are associative, not causal.
- We did not run wet lab or clinical protocols.

## Methods reproducibility appendix

```bash
npm run research:synthobs-npy-sod1-rhyme-validation
```

Outputs: `research/synthobs-npy-sod1-rhyme-validation/data/empirical_report.json` and `.md`.  
Tests: `tests/research/npy-sod1-rhyme-validation.test.mjs`.  
Math lemmas: coupling symmetry and z-score checks in `src/math.mjs`.

## Φ_EGS note

$\Phi_{\mathrm{EGS}}$ is filing / catalog grammar only. It does not replace $\hbar$, $c$, or clinical statistics.

## References

1. Suite fixtures — `research/synthobs-npy-sod1-rhyme-validation/fixtures/wiring_literature.json`
2. STRING cache — `fixtures/string_edges.json` (empty focus + INS–POMC 0.947)
3. OpenTargets cache — `fixtures/opentargets.json`
4. Clark et al., *Sci Rep* 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC5353592/
5. *Ann Clin Transl Neurol* 2023 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10647012/
6. Framework — `docs/SYNTHOBS_WIRING_DISCOVERIES_RHYMING_WORLD_MODEL_EGS_2026-11.md`
7. Bridge thickening — `docs/SYNTHOBS_WIRING_BRIDGE_THICKENING_EGS_2026-11.md`
8. Empirical receipt — `data/empirical_report.json`

## Related work and positioning

Prior rhyme expeditions (protein-folding, LLM language-pack, Pilot shared-world) recover long-range partners that linear windows miss. Those catalogs answer “what pair appeared?” Wiring peers answer “what empty catalog edge can be honestly assembled from existing spend?” Bridge thickening then asks “do independent rails agree?” This three-step ladder — search → wire → thicken — is the methodological contribution of the November 2026 wiring stack.

Compared with classical systematic review, a wiring wet lab is regenerable: fixtures, seeds, STRING caches, and gates are executable. Compared with knowledge-graph completion, the emphasis is **catalog emptiness + kill switches**, not maximizing edge count.

## Worked example for a reader after dinner

1. Open the empirical JSON.  
2. Confirm focus STRING empty and INS↔POMC ≥ 0.9.  
3. Read W1–W4 citations.  
4. Ask whether any kill condition already fires in your head.  
5. If not, file the wire as triage — then stop before clinic language.

## Comparison table across wiring peers

| Peer | Catalog novelty | Reagent shelf | Verdict class |
|---|---|---|---|
| NPY↔SOD1 | STRING-empty PPI | ALS / SOD1 wet labs | Disease-context wiring PASS |
| APP↔DNMT3A | STRING-empty PPI | Epigenetic / APP promoter wet labs | Regulatory wiring PASS |
| WMAP 11↔14 | Residual vs acoustic | Public TT spectrum | Provisional spectrum wiring |
| Combo new empty | STRING-empty candidates | Three-rhyme catalogs | Search layer |
| Bridge E7 | Multi-layer agreement | OT + EuropePMC + exon + chr | Thicken / park |

## Extended limitations and non-claims

We do not claim: clinical efficacy; finished particle or CMB laws; that rhyme geometry equals causality; that Soft Story upgrades to ENGINE_SHELF without a separate pin review; that Vercel deploy state proves scientific validity; that absence of STRING edge equals biological absence.

We do claim: regenerable gates; honest emptiness; citeable assembly; daylight falsifiers; a higher-layer discovery class useful for triage.



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

- Full NPY↔PDX1 wiring wet lab peer (promoted by E7).  
- Additional thickening layers (pathways, domains, hard cross-rhyme intersection).  
- Cross-mission CMB kills for WMAP provisional wire.  
- Optional ENGINE_SHELF pin review only after separate architectural necessity tests — not automatic from Soft Story PASS.

## Fair Exchange

Fair Exchange clause in effect for this Soft Story filing and repository configuration.

## Document close

→ ∞^∞
