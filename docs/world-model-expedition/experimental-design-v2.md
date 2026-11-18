# Experimental Design · Rhyming vs Non-Rhyming World Models

**Date:** 18 November 2026  
**Why v2:** Prior expeditions already showed rhyming shared worlds produce falsifiable multi-agent gains. This design is the head-to-head: **rhyming vs non-rhyming world models** on real fixtures and live open latent WM arms.

## Design principle

FractiSI can only “excel” where:

1. observations **share organization** but are **not identical text**, and  
2. exact-text / prefix cache **gets ~0 hits**, and  
3. task success does not fall vs a competent shared structured merge.

If those conditions are absent, prefer null/negative outcomes over marketing.

## Conditions

| Arm | What it is |
|---|---|
| Independent | Private facts only |
| Exact-text cache | Collapse only identical JSON/text |
| Prefix reuse | Share identical system/prefix strings |
| Shared structured | Blackboard merge (non-rhyming) |
| FractiSI rhyme templates | Real `compareRhymeToCache` / `rhymeCohort` engine |
| FractiSI selective / Exp 002 guided | Relationship-guided discovery |

## Worlds / data (real where available)

| ID | Source | Reality |
|---|---|---|
| **R0** | `differingWordSessions` / `identicalTextSessions` / crossover | Calibration (process-real bytes; synthetic text) |
| **R1** | `conventionalStore` / `prefixReuseStore` / `rhymeCohort` | Process-real multi-session |
| **G** | Exp 002 `runDiscoveryConvergenceBenchmark` | Architecture control (synthetic graph) |
| **P** | E9 `scenarios.json` (RCSB PDB + Pfam) | **Real** protein relational fixtures |
| **M** | Movebank trajectories.csv (study 2548892515) | **Real** GPS collar data |

Dreamer/TD-MPC/MuZero-family: **EXECUTABLE** (live CPU lab). Genie closed; Cosmos/V-JEPA need GPU — not fabricated.

## E9 split (fair — no gold leak)

Gold pair is always `involving[0]` in this fixture. Private views **never** contain the `"43-50"` string:

- **query** agent: query residue number + local window  
- **partner** agent: ranked partner **residues** (numbers only)  
- **context** agent: MSA / distractor pairs without gold  

Independent → should fail. Shared merge of query + top partner → reconstruct gold.

## Primary metrics

Raw first: task success · exactTextHits · naive/cache/rhyme bytes · reconstruction exactness · discovery@budget.  
CIE remains secondary.

## Pass rules (do not assume FractiSI wins)

- R0: rhyme beats exact on differing words; exact wins/ties on identical text.  
- R1: rhyme may **lose** to prefix when the system string is identical — report that.  
- P/M: rhyme byte win requires exactTextHits≈0 on real utterances.  
- Shared-structured may still match FractiSI on **task** success — that is OK; differentiation is organizational reuse under non-identical text.

## Run

```bash
npm run research:world-model-expedition:v2
```

→ ∞^∞
