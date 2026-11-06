import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompositionEngine } from '../../src/platform/composition.mjs';
import { createCoordinationEngine } from '../../src/platform/coordination.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('composition rejects overlapping paths and integrates disjoint work', () => {
  const store = createStore();
  const coord = createCoordinationEngine(store);
  const composition = createCompositionEngine(store);
  const a = coord.agents.register({ name: 'a' });
  const b = coord.agents.register({ name: 'b' });
  const c1 = composition.submitContribution({ agentId: a.id, paths: ['a.js'], summary: 'a' });
  const c2 = composition.submitContribution({ agentId: b.id, paths: ['b.js'], summary: 'b' });
  const ok = composition.compose([c1.id, c2.id]);
  assert.equal(ok.ok, true);
  composition.validate(ok.composition.id, { passed: true });
  composition.integrate(ok.composition.id);
  assert.equal(store.state.compositions.get(ok.composition.id).state, 'integrated');

  const c3 = composition.submitContribution({ agentId: a.id, paths: ['same.js'] });
  const c4 = composition.submitContribution({ agentId: b.id, paths: ['same.js'] });
  const bad = composition.evaluateCompatibility([c3.id, c4.id]);
  assert.equal(bad.composable, false);
});
