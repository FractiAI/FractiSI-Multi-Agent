# The Golden Night — empirical report

Document: `WP-GOLDEN-NIGHT-99-GOLDILOCKS-PATH-2026-11-27`
Registry: `synthobs-golden-night-goldilocks-path-2026-11`
Series: FractiSI Frontier Expedition Series
Seed: `20261127`
ENGINE_SHELF pinned: `false`
Trials per strategy: **50000** · total **300000**

## Summary

Pass **8/8** · suite `true`

## Reference strategy table

| Strategy | Mean coherence | 10th percentile | Critical failure | Risk-adjusted |
|---|---:|---:|---:|---:|
| Intelligence-first | 0.741 | 0.730 | 40.02% | 0.646 |
| Infrastructure-first | 0.844 | 0.834 | 8.95% | 0.800 |
| Economy-first | 0.783 | 0.772 | 18.80% | 0.721 |
| Centralized-control | 0.807 | 0.798 | 99.49% | 0.520 |
| Incremental-upgrade | 0.840 | 0.831 | 4.01% | 0.810 |
| Goldilocks path | 0.928 | 0.921 | 2.96% | 0.912 |

## Experiments

- **E1** 99-octave Omni-Lattice catalog (11×9): pass=`true` · tier=`deterministic`
- **E2** Six competing transition strategies registered: pass=`true` · tier=`deterministic`
- **E3** Weighted geometric mean coherence operator: pass=`true` · tier=`deterministic`
- **E4** Goldilocks sequence has nine transition steps: pass=`true` · tier=`deterministic`
- **E5** Goldilocks path highest mean coherence in reference Monte Carlo: pass=`true` · tier=`simulated`
- **E6** Goldilocks path lowest critical-failure rate among six strategies: pass=`true` · tier=`simulated`
- **E7** Risk-adjusted coherence favors Goldilocks over incremental-upgrade: pass=`true` · tier=`simulated`
- **E8** Sensitivity: weakened Goldilocks loses risk-adjusted advantage: pass=`true` · tier=`simulated`

## Sensitivity

Weakened Goldilocks RA=`0.782` · incremental RA=`0.810` · advantageLost=`true`

## Honesty

- That present-day AI can perform an overnight physical civilization reflash
- That modeled Soft Story outcomes will occur in reality
- That universal SuperAI monetary issuance is currently operational policy
- That the Goldilocks path remains superior under every adversarial or degraded coordination regime

