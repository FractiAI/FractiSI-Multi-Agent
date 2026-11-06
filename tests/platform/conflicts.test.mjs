import assert from 'node:assert/strict';
import test from 'node:test';
import { createAgentRegistry } from '../../src/platform/agents.mjs';
import { createConflictDetector } from '../../src/platform/conflicts.mjs';
import { createOwnershipTracker } from '../../src/platform/ownership.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('path overlap blocks independent progress', () => {
  const store = createStore();
  const agents = createAgentRegistry(store);
  const ownership = createOwnershipTracker(store);
  const conflicts = createConflictDetector(store);
  const a = agents.register({ name: 'a' });
  const b = agents.register({ name: 'b' });
  const t1 = ownership.claimTask({ agentId: a.id, title: 't1', paths: ['src/api/router.mjs'] });
  ownership.claimTask({ agentId: b.id, title: 't2', paths: ['src/api/router.mjs'] });
  const gate = conflicts.canProceedIndependently(t1.id);
  assert.equal(gate.ok, false);
  assert.ok(gate.conflicts.some((c) => c.type === 'path_overlap'));
});
