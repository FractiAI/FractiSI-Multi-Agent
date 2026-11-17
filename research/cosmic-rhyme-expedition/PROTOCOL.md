# Cosmic Rhyme Expedition — pre-registered protocol

**Written before result rows.** SynthOBS Autonomous Agent · Syntheverse Sandbox.  
**Document ID (paper):** `WP-COSMIC-RHYME-EXPEDITION-EGS-2026-11-17`  
**Seed:** `20261117`

## Naming lock

**Cosmos, not Universe.** This expedition interrogates the **observable relational layer** (catalogs, spectra, close approaches, deep-sky objects). It does **not** claim totality of existence.

## Central question

> Can the same relational-awareness method that revealed hidden structure in proteins (E9), knowledge (E10), and macroeconomic series (E11) reveal previously unrecognized super-patterns in the cosmos?

Not “What is the Universe doing?”  
Rather: **What becomes visible in the cosmos when observations are represented as relationships rather than as a sequence of measurements?**

## Experimental rhyme

| Domain | Linear | Relational | Fold / structure |
|---|---|---|---|
| Protein | sequence | couplings | fold |
| Knowledge | documents | source links | answer |
| Macroeconomy | series | teleconnections | structure |
| **Cosmos** | observations | cosmic relationships | **?** |

The `?` is the discovery target.

## Methodological bridge

E9–E12 establish LINEAR / FLAT / AWARE (and collab) across domains. This arm extends the same grammar to real public cosmic data without instructing the system to find known named structures (filaments, voids, dark-matter maps, radius valley as a labeled target, etc.).

## Data (public, regenerable fixtures)

| Layer | Source | Role |
|---|---|---|
| Exoplanets | NASA Exoplanet Archive `pscomppars` | Multi-parameter planetary systems |
| NEO close approaches | JPL SSD CAD API | Dynamical encounter observables |
| CMB TT spectrum | WMAP 9-year TT | Multipole sequence / spectral layer |
| Deep sky | OpenNGC | Heterogeneous object morphologies / positions |

Labels that **must not** be used as coupling *targets*: discovery-method names, common structure names (filament/void/…), human object-class marketing tags. They may appear in honesty / rediscovery audits after motifs are proposed.

## Arms (same materials)

| Arm | Representation |
|---|---|
| **LINEAR** | Local window in a one-dimensional ordering (RA-sorted, time-sorted, or multipole-ordered) |
| **FLAT** | Same objects / features dumped without a ranked relational map |
| **AWARE** | Explicit coupling board from measured multi-feature relationships on the same materials |

## Experiments

### C1 — Partner recovery (folding rhyme)

For each held-out query object, gold partner = strongest unlabeled coupling under the **train-fit** feature metric (cosine on z-scored continuous features; exclude trivial same-host / same-designation duplicates).

- Primary metric: exact top-partner recovery rate.  
- **H1:** AWARE − LINEAR ≥ +0.25 on ≥1 catalog layer; bootstrap CI excludes 0.  
- **H2:** AWARE − FLAT ≥ +0.10 on the same layer.

### C2 — Open motif discovery (telescope mode)

On the train split, mine recurring relational motifs = high-weight edge neighborhoods in the coupling graph that recur across objects. Do **not** seed with known structure names.

For each candidate motif:

1. Measure held-out enrichment (fraction of held-out edges matching motif signature).  
2. Compare to **label-shuffle null** (permute supplied audit labels) and **feature-permute null** (permute continuous features within columns).  
3. Keep motifs that beat both nulls after Benjamini–Hochberg FDR ≤ 0.10.

**Rediscovery audit (post-hoc, not a training target):** map surviving motifs to known named phenomena when obvious; label **rediscovery** vs **candidate novel**. Cosmic data decides survival; the model only proposes.

### C3 — Cross-layer spectral rhyme

Treat WMAP TT multipoles as a linear sequence. Compare LINEAR local multipole windows vs AWARE lag-coupling board for recovering held-out spectral partners (strongest lag correlation). Same H1/H2 shape as C1.

## Honesty boundary (locks)

- Application companion expedition — **not** ENGINE_SHELF, not a claim of new fundamental physics, not a Universe ontology.  
- Architecture / representation result: relational boards can expose structure hard to recover linearly from the **same** public observations.  
- Surviving motifs require held-out + null survival; rediscoveries are reported as rediscoveries.  
- No LLM bake-off required for C1–C3 architecture controls (deterministic / statistical). Optional LLM arms are secondary.

## Verdict rules

- **Positive expedition signal:** H1 holds on ≥2 of {exoplanets, NEO, NGC, WMAP} **or** ≥1 catalog H1 plus ≥1 FDR-surviving motif on held-out.  
- **Ship blog + library:** only if positive expedition signal.  
- Otherwise: keep protocol + receipts; report null / mixed result honestly without a feature blog.

→ ∞^∞
