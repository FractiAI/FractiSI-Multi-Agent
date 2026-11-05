# Benchmarks harness

Runs the deterministic and measured tiers, and writes their receipts. The protocol comes from [`benchmarks/plan.json`](../../benchmarks/plan.json).

## Contents

| Path | What it is |
|---|---|
| [`deterministic/`](deterministic/README.md) | Byte accounting, identical on any machine |
| [`measured/`](measured/README.md) | Heap, RSS and latency in isolated processes |
| [`fingerprint.mjs`](fingerprint.mjs) | Source fingerprints bind a receipt to the code that produced it, so evidence cannot silently outlive a change to its producer. |
| [`host.mjs`](host.mjs) | The measuring host, without identifying it: no hostname, username or path, so measured receipts can be committed. |
| [`plan.mjs`](plan.mjs) | The benchmark plan is the contract: every grid, trial count and seed comes from `benchmarks/plan.json`, and a malformed plan stops the run instead of silently falling back to defaults. |
| [`runners.mjs`](runners.mjs) | Stage bodies behind the benchmark scripts: run a tier and write its receipts. |
