# Current FractiSI Architecture · Shared World / Tiny Gateway

**Expedition:** Rhyming vs Non-Rhyming World Models  
**Date:** 18 November 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Honesty:** Descriptive inventory of the shipped FractiSI Multi-Agent kit. Not a claim that FractiSI wins any comparative benchmark.

## Identity lock

| Term | Meaning | Path |
|---|---|---|
| FractiSI Multi-Agent | Product / orchestration platform | `src/platform/` |
| Tiny Footprint | Shared-world execution core | `src/sdk/index.mjs`, `tiny-footprint/` |
| Tiny Gateway™ | Rhyming-template engine | `src/engine/gateway.mjs` (`createGateway`) |
| Factory | Wires store + gateway + coordination + composition + git + deploy | `src/platform/create-platform.mjs` (`createPlatform`) |

Layer gate (`src/gates/layers.mjs`): `core` → `engine` → `platform` → `sdk` → experiments / CLI.

## 1. World representation

### A. Engine / Tiny Footprint session world

- **Template catalog** (`src/engine/rhyming/catalog.mjs` · `createTemplateCatalog`): frozen `{ id, pattern, structuralSignature, rhymePass? }`.
- **Expression wire** (`src/engine/rhyming/codec.mjs` · `encodeExpression`): `{ templateId, delta, state? }`.
- **Shape grammar** (`src/engine/rhyming/shape.mjs`): same keys + value *kinds* (not exact text).
- **Rhyme gate** (`src/engine/rhyming/gate.mjs` · `auditRhyme`, `FOUR_PILLARS`).
- **Nested vectors** (`src/engine/vectors/store.mjs` · `createVectorStore`): `{ id, children?, cross?, complement?, deps? }`.
- **Eight-node broadcast** (`src/engine/broadcast/eight-node.mjs`): one `origin.story` + per-node `{ originRef, state }`.

### B. Platform shared project state

`createStore` (`src/platform/store.mjs`) — in-process Maps (+ optional JSON persist):

- `project`, `agents`, `tasks`, `contributions`, `compositions`, `releases`, `commits[]`, `events[]`

Agent registry (`src/platform/agents.mjs`): `{ id, name, framework, status, permissions, capacity, workspace, metadata }`.  
Ownership (`src/platform/ownership.mjs`): `{ id, title, agentId, paths[], dependsOn[], status }`.

### C. Predictive shared world (prototype — not wired into `createPlatform`)

`createPredictiveSharedWorld` (`src/experiments/predictive-shared-state.mjs`):

- **A** authoritative `{ version, state, committedAt }`
- **B** proposals / agent deltas
- **C** imagined futures  
Modules: `alpha|beta|gamma|shared`. Commit requires `{ approved: true }`.

### D. Comparative-bench toy shared world

`armB_tinyFootprintOnly` in `src/platform/comparative-bench.mjs`: `{ meta: 'shared', files: {} }` + `agentDeltas`.

## 2. Agent-local vs shared state

| Layer | Shared | Agent-local |
|---|---|---|
| Tiny Footprint | Template catalog + origin story | Session delta / working-set view |
| Platform | Project store, ownership, contributions | Workspace / worktree, capacity, metadata |
| Predictive | Authoritative modules | Proposals, imagined futures, perspective slices |

## 3. Read / write APIs

| Path | Read | Write |
|---|---|---|
| SDK | `reconstruct(templateId, delta)` | `registerTemplate`, `sessionDelta` |
| Gateway | `execute({ operation: 'reconstruct'\|'workingSet'|… })` | `registerTemplate`, ingest |
| Coordination | `status()`, ownership get/list | `agents.register`, `claimTask`, `proposeChange` |
| Composition | `evaluateCompatibility`, lineage | `submitContribution` → `compose` → `validate` → `integrate` |
| Git | `inspect`, `changedPaths` | `allocateScopedWorkspace`, `applyContribution`, `commitWorkspace` |
| Predictive | `perspective(agentId, paths?)` | `proposeChange`, `imagineFuture`; commit only if approved |

## 4. Delta representation

`diffDelta` / `mergeDelta` / `encodeExpression` (`src/engine/rhyming/codec.mjs`):

- Nested plain-object merge; arrays/leaves replace; missing keys → `{ __missing: true }` tombstones.
- Default merge uses `structuredClone`; `{ clone: false }` can share template identity.
- Platform contributions also use file-level `diff` / `files` / `paths` (not field-delta codec).
- Predictive: per-module `{ value, owner, action }` maps.

## 5. Reconstruction / materialization

| Mechanism | Symbol | Path |
|---|---|---|
| Template + delta → value | `reconstructExpression` | `codec.mjs` |
| Selective working set | `resolveWorkingSet(rootId, { maxDepth, energyBudgetJ })` | `vectors/store.mjs` |
| Eight-node view | `reconstructNodeView` | `eight-node.mjs` |
| Context window | `reconstructWindow` | `context/buffer.mjs` |
| Exp 002 guided | `relationshipGuided` vs `flatRetrieve` | `expedition-002-discovery.mjs` |
| Deploy artifact | `materialize(releaseId, projectRoot)` | `deploy.mjs` |

## 6. Caching

In-process contrast arms — not a distributed cache:

- Exact-text SHA-256 cache (`session-stores.mjs`, `rhyme-vs-cache.mjs`)
- Aliased / JS reference sharing
- Prefix reuse for identical system strings (`multi-session.mjs`)
- Rhyming Templates for organizational near-dupe
- Context-fold hooks (`nestedDeltaFoldHook`, `workingSetBoundHook`)

Honesty: exact/prefix cache ≠ rhyme; rhyme expands reuse when wording differs.

## 7. Synchronization / conflict handling

`createConflictDetector` (`src/platform/conflicts.mjs`):

- Types: `path_overlap` (high), `shared_interface` (medium), `dependency_edge` (low)
- `canProceedIndependently` blocks on high severity only
- Composition can refuse unless `force`
- `proposeChange` attaches `safeConcurrent` — does **not** auto-merge
- Predictive: futures never overwrite authoritative without approval

**No** CRDT / OT / multi-host lock manager. Sync = in-process Maps + optional JSON + Git merge semantics.

## 8. Persistence

- Platform: optional JSON file persist via store
- Git worktrees under `.fractisi/worktrees/<agentId>` or virtual workspaces
- Deploy pipeline: RC → approve → materialize → deploy (token-gated)

## 9. Communication

- Adapters (`src/platform/adapters.mjs`): `cursor`, `claude-code`, `vscode`, `openai`, `native` — normalize inbound messages; do not drive live IDE sessions
- Coordination / composition events in store `events[]`
- Test Drive API: HTTP steps with `Cache-Control: no-store`

## 10. Compute requirements

- Default lab: Node ≥18, in-process, no GPU required for Tiny Gateway / Exp 002 / comparative bench
- Optional GPU labs: E8/E10 may `not_run` without keys/hardware
- H100 rhyme-vs-prefix figures in Tiny Gateway docs are **simulation / allocation proxy**, not established serving HBM

## 11. Git / worktree awareness

`createGitIntegration` (`src/platform/git.mjs`): `inspect`, `allocateScopedWorkspace`, `applyContribution`, `commitWorkspace`, `integrateComposition`, `removeWorkspace`.  
Stated rule: improves multi-agent workflow **above** Git; does not replace Git.

## 12. Existing experiments this expedition must reproduce

| Suite | Path | Signal to reproduce |
|---|---|---|
| Exp 002 discovery | `src/experiments/expedition-002-discovery.mjs` | 100×6-hop guided 100/100 vs flat 0/100; ops −85%; rounds −50% |
| Exp 002 resource | SING13 `research/synthobs-fractisi-expedition-002-beyond-memory/` | duplication cut; selective reconstruct |
| Tiny Gateway suite | `src/experiments/suite.mjs` | E1–E15 rhyme / exactness / context |
| Comparative bench | `src/platform/comparative-bench.mjs` | independent vs tiny-footprint vs denser arms |
| Relational / collab demos | `relational-intelligence-demo.mjs`, `collab-synergy-demo.mjs` | LINEAR/FLAT/AWARE; whole>OR |
| World-model assimilation | `world-model-assimilation-suite.mjs` | predictive efficiency, futures, collective |

## 13. Current limitations (must inform fairness)

1. Platform store is **local only** — no multi-host shared world yet.
2. Adapters normalize messages; they do not drive live Cursor/Claude sessions.
3. Conflicts are path/marker heuristics — not full program analysis.
4. Predictive Shared State is experimental — not in `createPlatform`.
5. Selective reconstruct ≠ universal latency win (clone tax measured).
6. Coordination can **increase** conflicts vs plain branching while improving useful work.
7. GPU / DRAM / HBM claims are lab or proxy — Soft Story honesty rails apply.
8. Exp 002 / relational / collab are architectural controls — not frontier LLM bake-offs.
9. Pixel world-foundation models (Genie/Cosmos) are **not** FractiSI product core (class F in assimilation crosswalk).

## 14. Mapping to expedition WORLD interface

| WORLD op | Native FractiSI | Notes |
|---|---|---|
| `observe` | perspective / inspect / working set | Native |
| `read_state` | store get, reconstruct, perspective | Native |
| `write_state` | proposeChange, sessionDelta, contributions | Native (often proposal-gated) |
| `predict` | `imagineFuture` (predictive prototype) | Adapter / prototype |
| `simulate` | evaluateFutures / CEM-lite | Prototype only |
| `share` | shared store / broadcast | Native |
| `fork` | worktree / session delta | Native-ish |
| `merge` | compose / mergeDelta / integrate | Native with conflict detector |
| `materialize` | reconstruct / deploy.materialize | Native |
| `reset` | new store / new world | Native |

→ ∞^∞
