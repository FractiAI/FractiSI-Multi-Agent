# Diverse Redundancy · Inbreeding Expedition

**Rhyming Expedition arm** of the FractiSI Rhyming World Model catalog.

**Question:** Do diverse copies hold a mission deeper than cloned (same-lineage) copies when failures share a common cause?

## Run

```bash
npm run research:synthobs-diverse-redundancy-inbreeding
# or:
node research/synthobs-diverse-redundancy-inbreeding-expedition/scripts/run_empirical_pipeline.mjs
```

## Fixtures (real public data)

| File | Source |
|---|---|
| `fixtures/backblaze_2019h1.json` | Backblaze Hard Drive Stats 2019 Q1–Q2 |
| `fixtures/yeast_paralog_essential.json` | SGD null phenotypes + Ensembl yeast paralogs |
| `fixtures/human_paralog_constraint.json` | gnomAD LOEUF + Ensembl human paralogs |

Rebuild fixtures (optional): download raw into `/tmp/expdata` then `node scripts/prepare_real_data.mjs`.

## Experiments

| ID | Leg |
|---|---|
| E1 | Correlated-copy depth simulator (clone vs diverse under β) |
| E2 | Backblaze same-model co-failure → β̂ |
| E3 | Plug measured β into depth model |
| E4 | Yeast paralog buffering (null inviable) |
| E5 | Human paralog × gnomAD LOEUF |

## Honesty

Soft Story / computational expedition. Depth model is nesting grammar, not a live agent fleet. Backblaze is drive hardware. Biology boards are Soft Story for agent diversity — not clinical genetics. **ENGINE_SHELF pin deferred.** Φ_EGS architectural key only.

→ ∞^∞

Standalone: https://github.com/FractiAI/synthobs-diverse-redundancy-inbreeding
