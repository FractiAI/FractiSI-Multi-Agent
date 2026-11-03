# Tiny Footprint · Integration adapters (v0.1)

Adapters are **explicitly versioned and tested** — not universal compatibility claims.

| Adapter | Status | Notes |
|---------|--------|-------|
| `demo-inprocess` | **shipped** | Multi-session demo in `workloads/` |
| `openai-compatible-proxy` | planned | Shared system prompt / tools across sessions |
| `vllm-prefix-cache` | planned | Map Tiny Footprint policy onto prefix caching |
| `rag-static-corpus` | planned | Shared retrieval index + per-query deltas |

First integration point: **shared system prompts and static context** across sessions. Full KV-cache compression is a deeper integration and is not claimed by Workstation 0.1.
