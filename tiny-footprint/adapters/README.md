# Tiny Footprint · Integration adapters (v0.1)

Adapters are **explicitly versioned and tested** — not universal compatibility claims.

| Adapter | Status | Notes |
|---------|--------|-------|
| `demo-inprocess` | **shipped** | Multi-session demo in `workloads/` |
| `openai-compatible-proxy` | planned | Shared system prompt / tools across sessions |
| `vllm-prefix-cache` | planned | Map Tiny Footprint policy onto prefix caching |
| `rag-static-corpus` | planned | Shared retrieval index + per-query deltas |

First integration point: **shared system prompts and static context** across sessions. A rhyme matches organization, not identical text; mapping that onto a prefix cache is the planned adapter, not what the in-process rhyme test measures. Full KV-cache compression is a deeper integration and is not claimed by Workstation 0.1.

## Lab hooks (Workstation 0.1)

`context-compress-hooks` and `energy-proxy` are **in-process lab meters** exposed via the SDK. Full KV-cache compression and wall-socket energy claims remain **not** claimed by Workstation 0.1.
