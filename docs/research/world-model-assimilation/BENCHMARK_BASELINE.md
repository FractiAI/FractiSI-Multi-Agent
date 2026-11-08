# Benchmark Baseline

**Document ID:** `benchmark-baseline-2026-11`  
**Receipt:** `output/data/world-model-assimilation/latest.json`  
**Runner:** `npm run research:world-model-assimilation`

## Honesty boundary

All figures below are **measured** in-process Node simulations unless marked otherwise. Hardware: Cloud Agent VM · Node 22. Not GPU WFM inference. Not CapEx. Variance reported as mean ± concepts via `stdev` in the JSON receipt.

## Existing FractiSI benchmarks reproduced first

### Comparative coordination bench

- **Source:** `src/platform/comparative-bench.mjs:runComparativeBench`  
- **Arms:** A conventional branches · B Tiny Footprint only · C FractiSI coordination+composition  
- **Agent counts:** 1, 4, 16, 32 · **runs:** 3 · identical seeds per cell  
- **Invocation:** suite `baseline_fractisi_comparative_bench`

This is the product’s established multi-agent usefulness baseline. Expedition 002 discovery (100/100 vs 0/100) and Tiny Footprint density benches remain authoritative for those claims (`docs/benchmarks/RESULTS.md`); this initiative does not replace them.

### Methodology locks

| Lock | Value |
|---|---|
| Tasks / models / hardware | Same in-process sim for all arms |
| Agent counts | 1, 4, 16, 32 (100 not run — module slot toy world saturates earlier; see E4) |
| Context limits | Toy shared world with 4 module slots |
| Separation | Measured vs simulated called out per experiment |

## Baseline observations (from receipt)

- Full-duplicate context bytes scale ~linearly with agents (482 → 15424 B for the toy world at 1→32).  
- Existing FractiSI arm C completes useful composed tasks that grow with agent count (≈1 → ≈27 at 32 in this seed set).  
- Tiny Footprint shared+delta packing remains the density winner for authoritative views.

## What this baseline is for

Every enhancement in `EXPERIMENT_RESULTS.md` is compared against:

1. Conventional N full copies  
2. Existing Tiny Footprint packing  
3. Existing FractiSI coordination useful-work counts  

An enhancement that saves memory but reduces useful collective performance is **not** automatically an improvement — E4 shows predictive compose alone loses to arm C at 16–32 agents on useful completions.
