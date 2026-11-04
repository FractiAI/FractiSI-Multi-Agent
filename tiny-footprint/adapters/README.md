# Tiny Footprint · Integration adapters (v0.1)

Adapters are **explicitly versioned and tested** — not universal compatibility claims.

| Adapter | Status | Notes |
|---------|--------|-------|
| `demo-inprocess` | **shipped** | Multi-session demo in `workloads/` · rhyme gate + shared-context contrast |
| `openai-compatible-proxy` | planned | Shared system prompt / tools across sessions |
| `vllm-prefix-cache` | planned | Map Tiny Footprint policy onto prefix caching |
| `rag-static-corpus` | planned | Shared retrieval index + per-query deltas |

A **rhyme** matches organization (four pillars), not identical text. Mapping rhyme onto a prefix cache is the planned adapter — prefix reuse is a useful first integration and a separate meter, not the definition of rhyme. Full KV-cache compression is a deeper integration and is not claimed by Workstation 0.1.
