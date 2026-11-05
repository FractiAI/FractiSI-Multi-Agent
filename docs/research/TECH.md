# Tiny Footprint · Technology (short)

> **Evidence note.** Byte counts on this page are serialized JSON, not memory. For live memory, latency and real-model results, see the [results and claim ledger](../benchmarks/RESULTS.md).

## Tiny Gateway

Architecture centered on **Rhyming Templates**: reusable organizational patterns across information, sessions, and workloads. A **holographic rhyme** is motion grammar under Φ_EGS — **repeating · self-similar · self-correcting · recursive**. Schema-key match or exact-text identity alone is not a rhyme (a brick wall fails the audit).

- **Rhyme** — same organization across expressions, including when the words differ; four pillars required  
- **Shared representation** — store that organization once  
- **Nested vectors** — relationships across scales  
- **Compact differences** — nested field-level session deltas without full reprints  
- **Selective reconstruction** — rebuild only what the next operation needs  

On 40 sessions that share nested organization and say different things, the rhyme store is about a third smaller than an exact-text cache (suite experiment R). When all 40 sentences are identical, the exact-text cache is far smaller. Those are JSON byte counts, not GPU memory, and [the results page](../benchmarks/RESULTS.md) has the current values.

## What we measure

- Holographic rhyme gate (four pillars from Net Zero / octave 0 through ascending octaves; brick wall / schema-only / mid-octave-only negatives)  
- H100 published-profile **simulation**: when organizational wording differs, prefix cache cannot share and Tiny Footprint’s template+delta residency is ~34% smaller KV than prefix cache (~1.52× materialize bandwidth proxy). When the exact prefix is identical, Tiny matches prefix cache.  
- GPU allocation / peak device memory (local proxy lab — **prefix-reuse meter**, not a rhyme proof)  
- Real local-GPU causal-LM prefill / generate / train-step with vs without Tiny Footprint (DirectML/CUDA when available) — shared-prefix reuse  
- In-process representation reductions + exact reconstruction gates  

## Honesty

Local GeForce results (often GDDR via DirectML or nvcuda) are **not** datacenter HBM silicon identity and **not** a hosted frontier-vendor bake-off. The H100 arm is a **simulation** on published device specs that applies the in-process rhyme shared/delta fraction of JSON bytes to KV memory — not a live H100 KV-cache measurement. Shared-prefix GPU labs are not holographic rhyme proofs. Production claims require matched workload validation.

Whitepaper: [TECH_PAPER.md](TECH_PAPER.md) · Implementation: [`src/engine/`](../../src/engine/README.md) · Reproducible study: [`docs/manuscript/`](../manuscript/README.md)  
Also: https://github.com/FractiAI/synthobs-tiny-gateway-rhyming-templates
