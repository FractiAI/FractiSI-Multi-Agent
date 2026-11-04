# Source

All logic, in Node (`*.mjs`) and Python ([`tiny_footprint_labs/`](tiny_footprint_labs/README.md)). [`tests/`](../tests/README.md) mirrors this tree.

## Contents

| Path | What it is |
|---|---|
| [`analysis/`](analysis/README.md) | Reduces receipts to one summary; evaluates claims |
| [`benchmarks/`](benchmarks/README.md) | The deterministic and measured tiers |
| [`cli/`](cli/README.md) | The `tiny` command |
| [`core/`](core/README.md) | Bytes, statistics, randomness, hashing, formats and paths |
| [`docs_tools/`](docs_tools/README.md) | Helpers for the offline web docs |
| [`engine/`](engine/README.md) | Tiny Gateway: templates, vectors, broadcast, gateway |
| [`experiments/`](experiments/README.md) | The registered suite, one module per experiment |
| [`gates/`](gates/README.md) | Repository structure rules |
| [`labs/`](labs/README.md) | Adapters that run Python labs and report what actually ran |
| [`manuscript/`](manuscript/README.md) | Token catalog, hydration, the hard-coded-value gate |
| [`pipeline/`](pipeline/README.md) | The stage graph and the template binding |
| [`reporting/`](reporting/README.md) | The customer report, suite report and results page |
| [`sdk/`](sdk/README.md) | The public facade |
| [`share/`](share/README.md) | The opt-in share path |
| [`tiny_footprint_labs/`](tiny_footprint_labs/README.md) | Python labs and figures |
| [`verification/`](verification/README.md) | Re-derives each artifact and compares it with disk |
| [`workloads/`](workloads/README.md) | The reference demo workload |

## Licensing note

The engine, experiments and labs here were moved from the research suite and remain under its [MIT license](../research/synthobs-tiny-gateway-rhyming-templates/LICENSE), copyright FractiAI / SynthOBS. The repository has no root license: `package.json` says `UNLICENSED`, and choosing one is the owner's decision.
