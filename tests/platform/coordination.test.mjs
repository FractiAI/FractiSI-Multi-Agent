import assert from 'node:assert/strict';
import test from 'node:test';
import { createCoordinationEngine } from '../../src/platform/coordination.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('coordination connects a project and proposes changes', () => {
  const store = createStore();
  const coord = createCoordinationEngine(store);
  coord.connectProject({ name: 'demo', root: '/tmp/demo' });
  const agent = coord.agents.register({ name: 'coder' });
  const proposal = coord.proposeChange({ agentId: agent.id, title: 'edit', paths: ['readme.md'] });
  assert.equal(proposal.state, 'proposed');
  assert.equal(coord.status().project.name, 'demo');
});
