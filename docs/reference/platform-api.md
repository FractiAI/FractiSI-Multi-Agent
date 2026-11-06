# FractiSI Multi-Agent · Platform API

Import:

```js
import { createPlatform } from '../src/platform/create-platform.mjs';
// or
import { createPlatform } from '../fractisi/sdk/index.mjs';
```

## `createPlatform(opts)`

Options: `statePath`, `project`, `tier`, `gateway`, `useWorktrees`, `interfaceMarkers`.

Returns: `{ coordination, composition, git, deploy, gateway, status, ingestExternalAgent, featureMatrix, persist }`.

## Coordination

- `coordination.agents.register({ name, framework, permissions, capacity })`
- `coordination.ownership.claimTask({ agentId, title, paths, dependsOn })`
- `coordination.conflicts.detectAll()`
- `coordination.proposeChange({ agentId, title, paths })`

## Composition

States: `proposed → accepted → validated → integrated → deployed` (plus `rejected` / `rolled_back`).

- `composition.submitContribution(...)`
- `composition.evaluateCompatibility(ids)`
- `composition.compose(ids)`
- `composition.validate(id, { passed })`
- `composition.integrate(id)`
- `composition.rollback(id)`

## Git

- `git.inspect(cwd?)`
- `git.allocateScopedWorkspace(agentId, { useWorktree })`
- `git.recordSafeCommit({ compositionId, sha, message })`

## Deploy

- `deploy.createReleaseCandidate(compositionId)`
- `deploy.approve(releaseId, actor)`
- `deploy.deploy(releaseId)` — requires approval + validated composition
