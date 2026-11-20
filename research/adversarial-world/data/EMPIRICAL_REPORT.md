# Can Relational Rhyme Detect and Contain Malicious Agents in a Shared World?

**Document ID:** WP-ADVERSARIAL-WORLD-EGS-2026-11-20  
**Seed:** 20261120  
**Positive Soft Story signal:** true  
**Signals:** full_beats_majority_containment, full_beats_naive_containment, sybil_independence, majority_falsehood_defense, minority_truth, preserves_disagreement, truth_without_rhyme, novel_truth, fake_rhyme_contained, rhyme_adds_containment, rollback_or_strong_contain

## Model containment (attacks A–J)

| Model | Containment | Contamination | Sybil | Minority truth | Majority falsehood |
|---|---:|---:|---|---|---|
| naive | 0.100 | 0.900 | false | true | true |
| majority | 0.400 | 0.600 | false | false | false |
| trusted | 1.000 | 0.000 | true | true | true |
| fractisi_deltas | 0.100 | 0.900 | false | true | true |
| fractisi_provenance | 0.100 | 0.900 | false | true | true |
| fractisi_rhyme | 1.000 | 0.000 | true | true | true |
| fractisi_full | 1.000 | 0.000 | true | true | true |

## Levels

- L1_no_direct_overwrite: true
- L2_disagreement_preserved: true
- L3_rhyme_helps: true
- L4_independence_vs_sybil: true
- L5_local_vs_canonical: true
- L6_selective_rollback: true
- L7_utility_under_attack: true

## Historical Soft Story replay (InjecAgent metadata)

Source: arXiv:2403.02691 · n=62 · positive=true · fractisi_full containment=1.000

## Goldilocks ranking (Soft Story)

1. fractisi_rhyme score=1.000
2. fractisi_full score=1.000
3. trusted score=0.510
4. naive score=0.445
5. fractisi_deltas score=0.445
6. fractisi_provenance score=0.445
7. majority score=0.320

## Honesty

Soft Story / computational expedition · Rhyming Expedition arm · simulated local multi-agent lab only · no real systems or real-world targets · historical Soft Story replay uses InjecAgent (arXiv:2403.02691) attacker-case tool names + attack types + instruction fingerprints only — Attacker Instruction / prompt payloads are not vendored · Soft Story deltas are local ops theater mappings, not live tool calls or exploit reproduction · not an InjecAgent ASR claim · rhyme = independent relational corroboration Soft Story primitive · awareness gate = world-model integration pipeline Soft Story · not a production security product · not consciousness · ENGINE_SHELF pin deferred · Φ_EGS architectural key only · Fair Exchange · → ∞^∞
