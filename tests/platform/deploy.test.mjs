import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompositionEngine } from '../../src/platform/composition.mjs';
import { createCoordinationEngine } from '../../src/platform/coordination.mjs';
import { createDeployPipeline } from '../../src/platform/deploy.mjs';
import { createStore } from '../../src/platform/store.mjs';

test('deploy refuses unapproved and unvalidated compositions', () => {
  const store = createStore();
  const coord = createCoordinationEngine(store);
  const composition = createCompositionEngine(store);
  const deploy = createDeployPipeline(store);
  const a = coord.agents.register({ name: 'a' });
  const c = composition.submitContribution({ agentId: a.id, paths: ['x.js'] });
  const composed = composition.compose([c.id]);
  assert.throws(() => deploy.createReleaseCandidate(composed.composition.id), /not_validated/);
  composition.validate(composed.composition.id, { passed: true });
  const rc = deploy.createReleaseCandidate(composed.composition.id);
  assert.throws(() => deploy.deploy(rc.id), /requires_approval/);
  deploy.approve(rc.id, 'tester');
  const deployed = deploy.deploy(rc.id);
  assert.equal(deployed.state, 'deployed');
});
