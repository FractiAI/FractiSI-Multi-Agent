# Predictive Shared State Architecture

**Document ID:** `predictive-shared-state-architecture-2026-11`  
**Prototype:** `src/experiments/predictive-shared-state.mjs`  
**Recommended placement:** extension of Tiny Footprint / Gateway (surface A) with explicit hooks into Coordination · Composition (B–D). **Not** a separate product.

## Honesty boundary

Prototype is an in-process architectural lab. Latent dynamics are RSSM-*lite* (hash features + seeded noise), not trained Dreamer/V-JEPA weights. Predictions never become authoritative without `commit(..., { approved: true })`.

## Critical distinction (non-negotiable)

| Category | Name | Writable by prediction? |
|---|---|---|
| **A** | Authoritative world state | **No** — only approved commit |
| **B** | Agent-proposed changes | Yes (proposals / deltas) |
| **C** | Predicted / simulated futures | Yes (isolated; disposable) |

## Capability: Tiny Gateway — Predictive Shared State

An agent may request:

| Request | API | Category |
|---|---|---|
| Current shared state | `getAuthoritative()` | A |
| Relevant selective reconstruction | `perspective(agentId, paths?)` | A view |
| Own local delta | `proposeChange` / agent delta map | B |
| Changes by others | perspectives + proposal list | A/B |
| Relevant history | `history()` / `rollback(v)` | A |
| Predicted consequences of an action | `imagineFuture(agentId, action)` | C |
| Alternative possible futures | `imagineFuture` × N → `evaluateFutures` | C |

## Data structures

```
AuthoritativeWorld { version, state, committedAt }
ProposedChange     { id, agentId, action, delta, paths, category:'agent_proposed_change' }
CandidateFuture    { id, agentId, proposalId, parentVersion, horizon,
                     predictedStates[], finalState, latent[], category:'predicted_future' }
ComposedCandidate  { candidateState, keptFutureIds, rejectedFutureIds, conflicts, composable }
```

State expressions **must rhyme** with the registered Tiny Footprint world template (stable module slots) so selective reconstruct stays exact.

## Execution flow

```
1. Maintain authoritative shared world (A)
2. Agents receive selective perspectives
3. Agents propose actions → ProposedChange (B)
4. imagineFuture → CandidateFuture (C) without mutating A
5. evaluateFutures → scores + path conflicts
6. composeCompatible → merge non-overlapping proposals
7. validate / human or policy approval
8. commit({ approved:true }) → A' ; else reject
9. history + rollback preserved
10. A' is the next shared world
```

## Latent dynamics (rebuild)

- `createLatentDynamics` — deterministic recurrent `h` + action-hash `z` + seeded noise (Dreamer RSSM rhyme).  
- `planWithCem` — elite-fraction discrete CEM toward goal latent (V-JEPA 2-AC rhyme).  
- Latents are **not** stored as authoritative state; they score futures only.

## Smallest architectural change (recommendation)

1. Keep prototype under `src/experiments/` until Product Integration gate.  
2. When graduating: add `createPredictiveSharedWorld` beside `createGateway` inside `createPlatform` as **opt-in** (`features.predictiveSharedState`).  
3. Wire Composition `evaluateCompatibility` to optionally call `evaluateFutures` for proposed contributions.  
4. Do **not** add a separate microservice until multi-host shared state exists.  
5. External WFM providers (Cosmos etc.) attach as **D-class** adapters that emit CandidateFutures — never write A directly.

## Interfaces (sketch for graduation)

```js
platform.predictive.getAuthoritative()
platform.predictive.perspective(agentId, paths?)
platform.predictive.propose(agentId, action)
platform.predictive.imagine(agentId, action, { horizon })
platform.predictive.evaluate(futureIds)
platform.predictive.compose(futureIds)
platform.predictive.commit(composed, { approved })
platform.predictive.rollback(version)
```

## What must not happen

- Unapproved prediction overwrites authoritative state.  
- Pixel/video tensors become the Layer A registry.  
- Predictive materialization counted as “free” — imagination has a byte/compute cost (measured in E1).
