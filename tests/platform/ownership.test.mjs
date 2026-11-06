import assert from 'node:assert/strict';
import test from 'node:test';
import { createAgentRegistry } from '../../src/platform/agents.mjs';
import { createOwnershipTracker } from '../../src/platform/ownership.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('ownership claims tasks and walks dependencies', () => {
  const store = createStore();
  const agents = createAgentRegistry(store);
  const ownership = createOwnershipTracker(store);
  const a = agents.register({ name: 'a' });
  const t1 = ownership.claimTask({ agentId: a.id, title: 'base', paths: ['a.js'] });
  const t2 = ownership.claimTask({ agentId: a.id, title: 'dep', paths: ['b.js'], dependsOn: [t1.id] });
  assert.deepEqual(ownership.dependencyClosure(t2.id), [t1.id]);
});
