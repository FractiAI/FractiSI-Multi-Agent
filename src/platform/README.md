# Platform

FractiSI Multi-Agent coordination layer. Extends Tiny Footprint execution with
agent registration, shared project state, conflict detection, composition, Git
awareness, and deploy validation. Does not replace the Tiny Gateway engine.

| Module | Role |
|---|---|
| `identity.mjs` | Company / product / tier labels |
| `store.mjs` | In-memory + JSON persistence |
| `agents.mjs` | Registration and lifecycle |
| `ownership.mjs` | Task ownership and dependencies |
| `conflicts.mjs` | Overlap and interference detection |
| `coordination.mjs` | Coordination engine |
| `composition.mjs` | Contribution composition |
| `git.mjs` | Git awareness (does not replace Git) |
| `deploy.mjs` | Validation / deploy approvals |
| `adapters.mjs` | External agent integration interface |
| `entitlements.mjs` | Commercial capability tiers (labels) |
| `create-platform.mjs` | Factory |
| `index.mjs` | Public exports |
