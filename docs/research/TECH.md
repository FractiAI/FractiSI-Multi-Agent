# Tiny Footprint · Technology (short)

> **Evidence note.** Byte counts on this page are serialized JSON, not memory. For live memory, latency and real-model results, see the [results and claim ledger](../benchmarks/RESULTS.md).

## Tiny Gateway

Architecture centered on **Rhyming Templates**: reusable organizational patterns across information, sessions, and workloads.

- **Rhyme** — same fields and the same kinds of values, even when the words differ. This is not an exact-text cache  
- **Shared representation** — store that organization once  
- **Nested vectors** — relationships across scales  
- **Compact differences** — session-specific state without full reprints  
- **Selective reconstruction** — rebuild only what the next operation needs  

On 40 sessions that share a shape and say different things, the rhyme stores 4,758 bytes and an exact-text cache stores 6,704. When all 40 sentences are identical, the cache stores 164 bytes and the rhyme stores 4,691. Those are JSON byte counts, not GPU memory.

## What we measure

- GPU allocation / peak device memory (local proxy lab)  
- Real local-GPU causal-LM prefill / generate / train-step with vs without Tiny Footprint (DirectML when available); this lab measures latency, not device-memory savings
- In-process representation reductions; exactness checks for B/D/F/G (C/E are structural/selective reductions)

## Honesty

Local GeForce results (often GDDR via DirectML or nvcuda) are **not** datacenter HBM silicon identity and **not** a hosted frontier-vendor bake-off. Production claims require matched workload validation.

Whitepaper: [TECH_PAPER.md](TECH_PAPER.md) · Implementation: [`src/engine/`](../../src/engine/README.md) · Reproducible study: [`docs/manuscript/`](../manuscript/README.md)  
Also: https://github.com/FractiAI/synthobs-tiny-gateway-rhyming-templates
