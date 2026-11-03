# Tiny Footprint · Technology (short)

## Tiny Gateway

Architecture centered on **Rhyming Templates**: reusable organizational patterns across information, sessions, and workloads.

- **Shared representation** — store common structures once  
- **Nested vectors** — relationships across scales  
- **Compact differences** — session-specific state without full reprints  
- **Selective reconstruction** — rebuild only what the next operation needs  

## What we measure

- GPU allocation / peak device memory (local proxy lab)  
- Real local-GPU causal-LM prefill / generate / train-step with vs without Tiny Footprint (DirectML/CUDA when available)  
- In-process representation reductions + exact reconstruction gates  

## Honesty

Local GeForce results (often GDDR via DirectML or nvcuda) are **not** datacenter HBM silicon identity and **not** a hosted frontier-vendor bake-off. Production claims require matched workload validation.

Paper / suite: nested under `research/synthobs-tiny-gateway-rhyming-templates/`  
Also: https://github.com/FractiAI/synthobs-tiny-gateway-rhyming-templates
