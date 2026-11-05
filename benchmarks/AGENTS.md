# Benchmarks

`plan.json` is the contract for every grid, trial count, seed and model revision. Changing it invalidates the measured receipts, so measure again with `node scripts/run_pipeline.mjs --from measured`. The plan has no fallback defaults by design.
