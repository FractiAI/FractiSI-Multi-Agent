import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createLatentDynamics,
  createPredictiveSharedWorld,
  planWithCem,
  conventionalFullCopies,
  tinyFootprintViews,
} from '../../src/experiments/predictive-shared-state.mjs';

test('authoritative, proposed, and predicted categories stay distinct', () => {
  const world = createPredictiveSharedWorld({ seed: 1 });
  const auth = world.getAuthoritative();
  assert.equal(auth.category, 'authoritative_world_state');
  const prop = world.proposeChange('A0', { target: 'shared', value: 3 });
  assert.equal(prop.category, 'agent_proposed_change');
  const fut = world.imagineFuture('A0', prop);
  assert.equal(fut.category, 'predicted_future');
  assert.equal(world.getAuthoritative().version, 0);
  assert.notEqual(fut.finalState.modules.shared.value, auth.state.modules.shared.value);
});

test('unapproved predictions cannot overwrite authoritative state', () => {
  const world = createPredictiveSharedWorld({ seed: 2 });
  const fut = world.imagineFuture('A1', { target: 'alpha', value: 9 });
  const composed = world.composeCompatible([fut.id]);
  const blocked = world.commit(composed, { approved: false });
  assert.equal(blocked.ok, false);
  assert.equal(world.getAuthoritative().version, 0);
  const ok = world.commit(composed, { approved: true });
  assert.equal(ok.ok, true);
  assert.equal(world.getAuthoritative().version, 1);
  assert.equal(world.getAuthoritative().state.modules.alpha.value, 9);
});

test('rollback restores a prior authoritative version', () => {
  const world = createPredictiveSharedWorld({ seed: 3 });
  const f1 = world.imagineFuture('A0', { target: 'beta', value: 2 });
  world.commit(world.composeCompatible([f1.id]), { approved: true });
  const f2 = world.imagineFuture('A0', { target: 'beta', value: 5 });
  world.commit(world.composeCompatible([f2.id]), { approved: true });
  assert.equal(world.getAuthoritative().version, 2);
  world.rollback(1);
  assert.equal(world.getAuthoritative().version, 1);
  assert.equal(world.getAuthoritative().state.modules.beta.value, 2);
});

test('conflicting futures on one path are not silently all kept', () => {
  const world = createPredictiveSharedWorld({ seed: 4 });
  const a = world.imagineFuture('A0', { target: 'shared', value: 1 });
  const b = world.imagineFuture('A1', { target: 'shared', value: 2 });
  const evaluation = world.evaluateFutures([a.id, b.id]);
  assert.equal(evaluation.composable, false);
  assert.ok(evaluation.conflicts.length >= 1);
  const composed = world.composeCompatible([a.id, b.id]);
  assert.equal(composed.keptFutureIds.length, 1);
  assert.equal(composed.rejectedFutureIds.length, 1);
});

test('Tiny Footprint views beat conventional full copies on bytes', () => {
  const world = createPredictiveSharedWorld({ seed: 5 });
  const state = world.getAuthoritative().state;
  const conv = conventionalFullCopies(state, 8);
  const tiny = tinyFootprintViews(state, Array.from({ length: 8 }, (_, i) => `A${i}`));
  assert.ok(tiny.bytes < conv.bytes);
});

test('CEM planner returns a ranked action toward a goal latent', () => {
  const dynamics = createLatentDynamics({ seed: 9 });
  const goal = dynamics.encode({ goal: true, x: 1 });
  const plan = planWithCem({
    dynamics,
    goalLatent: goal,
    candidates: [{ move: 'left' }, { move: 'right' }, { move: 'stay' }],
  });
  assert.ok(plan.best);
  assert.ok(plan.ranked.length >= 3);
  assert.equal(typeof plan.best.energy, 'number');
});
