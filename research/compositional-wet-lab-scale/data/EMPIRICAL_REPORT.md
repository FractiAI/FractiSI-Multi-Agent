# Compositional Wet-Lab Scale Proof — empirical report

Document: `WP-COMPOSITIONAL-WET-LAB-SCALE-2026-11-25`
Registry: `synthobs-compositional-wet-lab-scale-2026-11`
Seed: `20261125`
ENGINE_SHELF: **#57** pinned=`true`

## Summary

Pass **12/12** · suite `true`
ρ_CC = 0.1786 (10/56)

## Experiments

- **E1_cross_domain** Compositional chain identification: pass=`true`
- **E2_feed_forward** Compositional feed-forward adjacency: pass=`true`
- **E3_composition_layers** Five compositional proof layers: pass=`true`
- **E4_nested_dof** Nested degrees of freedom under programmable space: pass=`true`
- **E5_three_levels** Three-level proof honesty: pass=`true`
- **E6_novel_workload** Novel compositional workload discovery: pass=`true`
- **E7_honesty_boundary** Honesty boundary (Level III open · preprint flagged): pass=`true`
- **E8_level3_open_catalog** Level III open engineering catalog: pass=`true`
- **E9_compositional_workload** Compositional workload stage recognition: pass=`true`
- **E10_measured_digital_baseline** Measured digital latency/heap baseline: pass=`true`
- **E11_em_vs_digital_tiers** Historical EM fJ/MAC beside measured digital latency: pass=`true`
- **E12_volume_scaling** Soft Story volume scaling 1→256: pass=`true`

## Major-result shape

{
  "e1Rate": 0.875,
  "e2Rate": 1,
  "e9Rate": 1,
  "level3Proven": false,
  "digitalLatencyTier": "measured",
  "historicalEmFjPerMac": {
    "image": 6,
    "audio": 2.8
  },
  "volumeSequence": [
    1,
    2,
    4,
    8,
    16,
    32,
    64,
    128,
    256
  ],
  "rho_R": 0.17857142857142858
}


## Level III baselines (tiers)

- Digital latency: **measured** · available=`true`
- Digital heap: **measured** · available=`true`
- EM energy: **historical** · 6 / 2.8 fJ/MAC

Digital latency/heap are measured on this host. EM fJ/MAC is historical wet-lab literature. Side-by-side Soft Story anchors — not a claim that RF replaces GPUs.

