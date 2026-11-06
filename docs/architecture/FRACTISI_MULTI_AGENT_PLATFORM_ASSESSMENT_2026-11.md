# FractiSI Multi-Agent — Architecture Assessment (Phase 1)

**Date:** 2026-11-06  
**Company:** FractiSI  
**Flagship product:** FractiSI Multi-Agent  
**Core technology:** Tiny Footprint (Tiny Gateway™)  
**Edition:** Workstation kit evolution (not a greenfield rewrite)

## Current architecture map

| Layer | Location | Status before this evolution |
|---|---|---|
| A · Agent execution / memory | `src/engine/*`, `src/sdk/*`, `tiny-footprint/sdk` | Shipped — templates, deltas, selective reconstruct, rhyme gate, vectors, broadcast |
| B · Coordination | — | Missing |
| C · Shared project state | In-process Maps only for templates | Missing project/task ownership model |
| D · Composition | — | Missing |
| E · Git / versioning | None (Git used only as host tooling) | Missing |
| F · Test / deploy | Benchmark + manuscript pipeline only | Missing product deploy capability |
| Install UX | `node scripts/tiny.mjs doctor|install|demo|benchmark|report` | Partial — verify-only install |
| External agents | Adapters README (planned) | Missing concrete adapters |

## Existing capabilities retained

- Tiny Gateway rhyming templates, codec, catalog, gate
- Nested vectors / selective working sets
- Eight-node shared broadcast demo
- Multi-session workload demo
- Deterministic + measured benchmark pipeline
- Zero npm-dependency Node kit
- FractiSI static marketing site
- Expedition 002 discovery receipts (product docs)

## Gaps addressed by this evolution

1. Agent registration, lifecycle, permissions, capacity
2. Shared project representation + task ownership + dependencies
3. Conflict / interference detection (path + interface markers)
4. Composition engine with proposed→validated→integrated→deployed states
5. Git awareness and scoped workspaces (virtual by default; optional worktrees)
6. Deploy approvals (never unvalidated)
7. Adapter interface for Cursor / Claude Code / VS Code / OpenAI
8. Commercial tiers as entitlements of one product
9. Plug-and-play `init` + config templates + Docker self-host option
10. Comparative A/B/C coordination benchmark (measured simulation)

## Reusable components extended (not replaced)

- `src/engine/gateway.mjs` — execution core inside `createPlatform()`
- `src/sdk/index.mjs` — now also exports `createPlatform`
- `src/cli/*` — additive commands (`init`, `status`, `agents`, `compose`, `coord-bench`)
- Layer gate — new `platform` layer between `engine` and `sdk`

## Target architecture

```
External agents (Cursor / Claude Code / VS Code / OpenAI)
        │ adapters
        ▼
FractiSI Coordination Engine (B) ── Shared project state (C)
        │                                    │
        ▼                                    ▼
Composition Engine (D) ◄──────── Git awareness (E)
        │
        ▼
Validation / FractiSI Deploy (F)
        │
Tiny Footprint execution (A) · Tiny Gateway
```

## Implementation priorities

1. Platform foundation in `src/platform/` (complete in this change set)
2. CLI + config + admin surface
3. Comparative bench receipts
4. SING13 architecture paper / ship-blog companion (catalog sync)
5. Deeper IDE connectors and live LLM agent trials (remaining)

## Risks

| Risk | Mitigation |
|---|---|
| Overclaiming multi-agent intelligence | Honesty rails; architectural sims labeled |
| Breaking layer gates / golden fixtures | Additive layer; no engine golden changes |
| Competing product names | Single product: FractiSI Multi-Agent; Tiny Footprint = core tech |
| Git replacement temptation | Git integration is awareness + workflow above Git |
| Stale SING13 `products/` mirror | Prefer standalone kit as source of truth |

## Known limitations / remaining work

- Adapters normalize messages; they do not yet drive live Cursor/Claude sessions.
- Composition semantic analysis is marker/heuristic-based, not full program analysis.
- Deploy connectors are approval-gated stubs (no cloud provider ship in this phase).
- Comparative bench is an in-process measured simulation — not GPU/$ production cost.
- 100-agent runs are supported in code paths but heavy host timing varies; default bench uses 5/10/25 (+50 with `--full`).
