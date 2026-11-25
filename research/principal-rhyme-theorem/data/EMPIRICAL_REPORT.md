# Principal Rhyme Theorem — empirical report

Document: `WP-PRINCIPAL-RHYME-THEOREM-EGS-2026-11-25`
Registry: `synthobs-principal-rhyme-theorem-2026-11`
Seed: `20261125`
ENGINE_SHELF: **#55** pinned=`true`

## Summary

Pass **7/7** · suite `true`
ρ_R = 0.0857 (18/210)

## Experiments

- **E1_cross_domain** Cross-domain identification: pass=`true`
- **E2_rhyme_transfer** Rhyme transfer across domains: pass=`true`
- **E3_search_reduction** Search reduction (direct vs rhyme): pass=`true`
- **E4_reconstruction** Reconstruction from shared organization: pass=`true`
- **E5_nested_discovery** Nested rhyme discovery: pass=`true`
- **E6_novel_discovery** Novel rhyme discovery: pass=`true`
- **E7_predictive** Predictive validation: pass=`true`

## Major-result shape

{
  "e1Rate": 1,
  "e2Rate": 0.75,
  "e3RhymeHits": 7,
  "e3DirectHits": 4,
  "e7Lift": 6,
  "rho_R": 0.08571428571428572
}

