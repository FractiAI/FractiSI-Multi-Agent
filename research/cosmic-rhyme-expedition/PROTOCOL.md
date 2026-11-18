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

### C4 — Novel-physics candidate search (why C1–C3 were not enough)

C1–C3 answer whether the protein-folding rhyme (relational representation vs linear reading) travels on cosmic catalogs. That is the expedition focus. Separately, C4 searches for new-physics candidates: leftovers after known selection and known templates are removed. Survivors are reported as candidates for new physics under this protocol.

C4a exoplanets: residualize physics axes against disc_year/RA/Dec/distance; nulls = column shuffle + footprint scramble.
C4b WMAP TT: residualize log Cl against smooth log-ell continuum; null = residual shuffle; acoustic-peak lean → rediscovery.
C4c OpenNGC: size residual vs brightness; isotropic sky scramble.
C4d NEO: residualize against distance.

A candidate_novel_physics hit must beat nulls and must not sit in the locked known-template list. Candidate ≠ confirmed law.

### C5 — LLM / language-pack rhyme (E9–E11 packing on cosmic fixtures)

C1 answers the folding rhyme in feature space. C5 asks whether the **same rhyme appears when cosmic observations are packed as language** the way E9–E11 packed proteins / Hotpot / FRED for LLMs.

For each C1-style long-range partner task on exoplanets, NEOs, OpenNGC, and WMAP TT:

1. **LINEAR pack** — query + local RA/time/ℓ window feature lines only.  
2. **FLAT pack** — query + unstructured dump of train/local/distractor lines (no ranks).  
3. **AWARE pack** — query + `LEADING RELATIONAL CANDIDATE` + ranked `RELATIONAL AWARENESS BOARD` from measured couplings (no gold labels in the board construction).

**Default runner (CI):** pack-compliant reader — follows AWARE leading candidate / first local / first dump id. Proves the rhyme lives in the language pack without a network call.  
**Contrast:** lexical-blind reader (token overlap with query line; ignores board ranks).  
**Optional live LLM:** if `COSMIC_LLM_URL` + `COSMIC_LLM_KEY` are set, same packs may be sent to a model; not required for expedition signal. Same H1/H2 thresholds as C1. Token/char economics reported (H3-style).

C5 is secondary to C1–C4. Pack-compliant AWARE wins ≠ frontier model superiority ≠ novel physics.

**Legend (map of LLM rhymes → cosmic data):** `LLM_RHYME_LEGEND.md` and code export `LLM_RHYME_COSMIC_LEGEND` in `src/llm-rhyme.mjs`. Domain bridge E9/E10/E11 → exoplanet/neo/ngc/wmap_tt layers; pack arms LINEAR/FLAT/AWARE. Receipts include `c5.legend`.

## Honesty boundary (locks)

- Application companion expedition — **not** ENGINE_SHELF, not a claim of new fundamental physics, not a Universe ontology.  
- Architecture / representation result: relational boards can expose structure hard to recover linearly from the **same** public observations.  
- Surviving motifs require held-out + null survival; rediscoveries are reported as rediscoveries.  
- C1–C4 need no LLM. C5 default is language-pack / pack-compliant (deterministic). Live LLM is optional and not a bake-off claim.

## Verdict rules

- **Positive expedition signal:** H1 holds on ≥2 of {exoplanets, NEO, NGC, WMAP} **or** ≥1 catalog H1 plus ≥1 FDR-surviving motif on held-out.  
- **Ship blog + library:** only if positive expedition signal.  
- Otherwise: keep protocol + receipts; report null / mixed result honestly without a feature blog.

→ ∞^∞
