import assert from 'node:assert/strict';
import test from 'node:test';
import { featureMatrix, hasCapability, resolveTier, TIERS } from '../../src/platform/entitlements.mjs';

test('tiers are packaging labels with cumulative capabilities', () => {
  assert.equal(resolveTier('community').id, 'community');
  assert.equal(resolveTier('core').id, 'community'); // legacy alias
  assert.equal(resolveTier('professional').id, 'developer_pro');
  assert.equal(hasCapability('enterprise', 'deployment_integration'), true);
  assert.equal(hasCapability('community', 'deployment_integration'), false);
  assert.equal(hasCapability('developer_pro', 'composition_engine'), true);
  const matrix = featureMatrix();
  assert.ok(matrix.matrix.composition_engine.developer_pro);
  assert.equal(matrix.pricingMetric, 'concurrent_coordinated_agents');
  assert.equal(TIERS.developer_pro.price.amount, 39);
  assert.equal(TIERS.team.price.amount, 149);
  assert.equal(TIERS.developer_pro.capacity.concurrentCoordinatedAgents, 4);
  assert.equal(TIERS.team.capacity.concurrentCoordinatedAgents, 16);
});
