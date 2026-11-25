# Riemann FractiSI · results report

**Status:** real ζ-23 FractiSI verification · RH **OPEN**  
**Harness:** `lean/timing/run-zeta23.mjs`  
**Receipt:** `lean/receipts/riemann-fractisi-zeta23-latest.json`

## Target

Anthropic [formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) — Mathlib `riemannZeta` Theorems A–E; Montgomery–Taylor window ≈ 0.6725. Baseline: [Anthropic Riemann post](https://www.anthropic.com/research/riemann-zeta) (~1.5 days · ~60 subagents · 41.6% → 67.2%).

## Measured

| Metric | Value |
|---|---|
| FractiSI wall clock (warm) | 14.66 s |
| Tasks / contributions / compositions | 4 / 4 / 1 |
| lake build Solution | pass |
| axiomsOk (17 theorems) | pass (propext, Classical.choice, Quot.sound only) |
| Cold cache + build | ≈ 612 s |

## Interpretation

This is coordinated **verification** of the published Mathlib formalization under FractiSI. It is not LLM rediscovery of the analytic argument, and 14.66 s is not claimed as beating Anthropic’s ~1.5 day discovery clock.
