# Tiny Gateway · runtime pointer

Workstation 0.1's engine is implemented in [`src/engine/`](../src/engine/README.md), and the experiments that exercise it are in [`src/experiments/`](../src/experiments/README.md).

| Concept | Location |
|---------|----------|
| Rhyming Templates | [`src/engine/rhyming/`](../src/engine/rhyming/README.md) |
| Nested vectors | [`src/engine/vectors/`](../src/engine/vectors/README.md) |
| Eight-node broadcast | [`src/engine/broadcast/`](../src/engine/broadcast/README.md) |
| Gateway | [`src/engine/gateway.mjs`](../src/engine/gateway.mjs) |
| Exactness checks | [`src/benchmarks/deterministic/exactness.mjs`](../src/benchmarks/deterministic/exactness.mjs) |
| Execution | [`src/experiments/suite.mjs`](../src/experiments/suite.mjs), [`src/labs/`](../src/labs/README.md) |

The research suite under [`research/`](../research/README.md) keeps its original import paths, which re-export these modules. There is one engine.
