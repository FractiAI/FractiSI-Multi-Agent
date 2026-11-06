import assert from 'node:assert/strict';
import test from 'node:test';
import { createAgentRegistry } from '../../src/platform/agents.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('agents register, activate, and list', () => {
  const store = createStore();
  const agents = createAgentRegistry(store);
  const a = agents.register({ name: 'worker', framework: 'cursor' });
  agents.setStatus(a.id, 'active');
  assert.equal(agents.activeCount(), 1);
  assert.equal(agents.list({ framework: 'cursor' })[0].name, 'worker');
  assert.throws(() => agents.register({ name: 'x', id: a.id }), /agent_exists/);
});
