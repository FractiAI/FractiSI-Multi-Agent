# Do Diverse Copies Hold a Mission Deeper Than Cloned Copies When Failures Share a Cause?

**Short answer: Yes.** On regenerable boards with a common-cause fraction β, five cloned copies at β = 0.2 and depth 6 keep only 0.262 survival while five diverse classes keep 0.997, and adding more clones does not raise the clone arm. Public Backblaze 2019 H1 same-model co-failures give β̂ ≈ 0.0469; at that measured β the clone arm still falls with depth while the diverse arm stays near 1.0. Length-stratified yeast and human paralog boards move the same way (Δ essential −0.0514; Δ LOEUF +0.0837). Soft Story / Rhyming Expedition arm; ENGINE_SHELF pin deferred.

**Document ID:** `WP-DIVERSE-REDUNDANCY-INBREEDING-EGS-2026-11-19`
**Registry ID:** `synthobs-diverse-redundancy-inbreeding-expedition-2026-11`
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox
**Classification:** Application companion · Soft Story / computational expedition · **Rhyming Expedition** arm · **not** Infinite Octaves ENGINE_SHELF
**Date:** 19 November 2026
**Harness:** `research/synthobs-diverse-redundancy-inbreeding-expedition/`
**FractiSI mirror:** https://fractisi.vercel.app/library/papers/diverse-redundancy-inbreeding/
**Peers:** Aware Attention Head (octave redundancy) · Pilot Rhyme · Shared-World Collective Intelligence · Tiny Gateway Rhyming Templates

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Expedition claim | Under a stated common-cause β, diverse copy *classes* keep mission survival deeper than cloned same-lineage copies on the depth simulator, and public hardware / paralog boards support the same direction | A proof that biology “invented” agent fleets, or that drive models equal agent models |
| Evidence tier | Regenerable Node lab · Backblaze Hard Drive Stats 2019 H1 · SGD yeast null phenotypes + Ensembl paralogs · gnomAD LOEUF + Ensembl human paralogs | Live multi-agent fleet telemetry · clinical genetics · fab process proof |
| Soft Story | Yeast/human paralog buffering and Backblaze same-model clustering are **Soft Story** boards for the agent-diversity rhyme | Wet-lab genetics advice · hard-drive reliability warranty · production SRE runbook |
| Pin status | ENGINE_SHELF pin **deferred** even though E1–E5 signal | A statement that the architecture is proven in production fleets |

## Abstract

Multi-agent systems often answer “how many copies?” by cloning the same lineage. When failures share a cause — one bad model revision, one shared dependency, one correlated outage — those clones die together, and adding more clones does not buy nesting depth. Biology and hardware reliability both already show a related shape: paralog families buffer loss better than singleton genes, and same-model drives fail together more than a random null predicts. This Rhyming Expedition arm asks whether **diverse copy classes** hold a mission deeper than **cloned copies** when a common-cause fraction β is present.

Five regenerable experiments answer yes on the locked fixtures. E1 is a depth simulator: at β = 0.2 and depth 6, clone-5 survival is 0.262 while diverse-5 is 0.997; clone-9 stays 0.262. E2 estimates β from Backblaze 2019 H1 same-model co-failures inside a seven-day window (β̂ ≈ 0.0469 over a shuffled null). E3 plugs that β into the depth model and still shows clone survival falling with depth while diverse survival stays near 1.0. E4 and E5 are Soft Story public biology boards: length-stratified yeast paralogs show lower essentiality (Δ = −0.0514), and human paralogs show higher LOEUF (Δ = +0.0837). The pin stays deferred: the rhyme is architectural and Soft Story, not a fleet telemetry proof.

## 1. Question

Do diverse copies hold a mission deeper than cloned (same-lineage) copies when failures share a common cause β?

## 2. Background

Aware Attention Head already showed that finite redundant copies give a long but finite octave horizon, and that unbounded depth needs copies that grow with depth. That paper treated copies as repairable mission replicas. It left open a second question: what happens when the copies are **inbred** — the same lineage under a shared failure mode — versus **diverse** classes that fail more independently?

Reliability engineering calls the shared mode a common-cause failure. Population genetics calls the same-lineage trap inbreeding depression. Drive fleets call it a model-year cluster. The Rhyming World Model files those as one Soft Story: cloning the same seat many times is not the same as holding several different seats.

## 3. Hypotheses

1. **H1.** Under β > 0, clone survival saturates with copy count while diverse-class survival keeps rising with class count.
2. **H2.** Public same-model hardware co-failures yield a positive β̂ against a shuffled null.
3. **H3.** Plugging measured β̂ into the depth model preserves the clone-cap / diverse-depth gap.
4. **H4.** Soft Story biology boards (yeast essentiality; human LOEUF) move in the buffering direction for paralog-bearing genes after length stratification.
5. **Falsifier.** If clone-n matches diverse-k at matched n = k for β > 0, or if β̂ ≤ 0, or if length-stratified biology deltas flip sign, the expedition signal fails.

## 4. Method

### 4.1 Depth simulator (E1)

Per nesting step, a clone group of size *n* survives with probability $(1-\beta)(1-\lambda^n)$ and is raised to depth *d*. A diverse arm with *k* classes treats each class as failing with $p = \beta + (1-\beta)\lambda$; the mission survives a step if at least one class survives. Sweep β ∈ {0, 0.05, 0.1, 0.2, 0.35, 0.5}, depths 1–9, and *n*, *k* ∈ {1, 3, 5, 9}. Headline lock: β = 0.2, depth = 6, *n* = *k* = 5 and 9. λ = 0.02.

### 4.2 Backblaze β̂ (E2)

Fixture: Backblaze Hard Drive Stats 2019 Q1–Q2 failures. Count same-model failure pairs inside a seven-day window. Compare to the mean of model-label shuffles. β̂ is the excess share of observed pairs over the null mean.

### 4.3 Plug-in (E3)

Re-run the depth table at β̂ from E2 for clone-5 / diverse-5 / clone-9 / diverse-9 across depths 3, 6, 9.

### 4.4 Yeast Soft Story (E4)

SGD null phenotypes + Ensembl yeast paralogs. Genes with ≥1 paralog vs none. Outcome: inviable (essential) rate. Stratify by protein-length tertile; report mean bin-wise Δ (paralog − no-paralog).

### 4.5 Human Soft Story (E5)

gnomAD LOEUF + Ensembl human paralogs. Same length stratification; report mean bin-wise Δ LOEUF (paralog − no-paralog). Higher LOEUF means more tolerant of loss — Soft Story for buffering, not a clinical claim.

### 4.6 Gates

Positive expedition signal when at least three of E1–E5 fire. ENGINE_SHELF pin stays deferred regardless.

## 5. Results

### 5.1 E1 · Depth simulator headline (β = 0.2, depth = 6)

| Arm | n = 5 | n = 9 |
|---|---:|---:|
| Clone | 0.2621 | 0.2621 |
| Diverse | 0.9972 | 1.0000 |

Clone survival caps: nine clones match five. Diverse classes keep near-perfect survival at the same depth.

### 5.2 E2 · Backblaze β̂

| Quantity | Value |
|---|---:|
| Observed same-model window pairs | 9,955 |
| Null mean | 9,488.05 |
| β̂ (excess share) | 0.0469 |

### 5.3 E3 · Plug-in at measured β

| Depth | Clone5 | Diverse5 | Clone9 | Diverse9 |
|---:|---:|---:|---:|---:|
| 3 | 0.8574 | 1.0000 | 0.8574 | 1.0000 |
| 6 | 0.7351 | 1.0000 | 0.7351 | 1.0000 |
| 9 | 0.6302 | 1.0000 | 0.6302 | 1.0000 |

Even at the modest measured β̂, clone survival falls with depth and does not improve from five to nine copies; diverse stays saturated.

### 5.4 E4 · Yeast paralog buffering

Length-stratified mean Δ essential (paralog − no-paralog) = **−0.0514** (signal). Paralog-bearing genes are less often essential inside each length bin.

### 5.5 E5 · Human LOEUF × paralog

Length-stratified mean Δ LOEUF (paralog − no-paralog) = **+0.0837** (signal). Paralog-bearing genes sit higher on LOEUF inside each length bin.

### 5.6 Verdict

Positive expedition signal on **E1, E2, E3, E4, E5**.

## 6. Qualifications

- The depth model is nesting grammar with a stated β and λ — not a calibrated fleet failure forecast.
- Backblaze measures spinning disks and SSDs; the Soft Story is common-cause clustering, not agent software.
- Yeast essentiality and human LOEUF are Soft Story boards for diversity buffering; they are not wet-lab genetics findings and not medical advice.
- Length stratification reduces one confound; residual confounders remain.
- ENGINE_SHELF pin is deferred until live agent rates lock.

## 7. Framework value

For the Rhyming World Model, this arm names a design rule: **redundancy without diversity is inbreeding**. Director/Pilot seats, rhyming templates, and octave mission copies should prefer diverse classes over identical clones when common-cause risk is real. The expedition ties that rule to a regenerable depth table and three public fixtures.

## 8. Invitation

Run `npm run research:synthobs-diverse-redundancy-inbreeding` in SING 13 (or the FractiSI kit mirror). Read beside Aware Attention Head (how many copies) and Pilot Rhyme (which seats hold the map). File follow-ups as Soft Story until fleet telemetry replaces β̂.

## Document control

| Field | Value |
|---|---|
| Document ID | WP-DIVERSE-REDUNDANCY-INBREEDING-EGS-2026-11-19 |
| Registry | synthobs-diverse-redundancy-inbreeding-expedition-2026-11 |
| Suite | research/synthobs-diverse-redundancy-inbreeding-expedition/ |
| Seed | 20261119 |
| Φ_EGS | Architectural key only · (1+√5)/2 |
| Fair Exchange | In effect |
| Close | → ∞^∞ |
