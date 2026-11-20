import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADDONS,
  featureMatrix,
  hasCapability,
  hasRhymingShieldCapability,
  resolveRhymingShieldPackage,
  resolveTier,
  TIERS,
} from '../../src/platform/entitlements.mjs';

test('tiers are packaging labels with cumulative capabilities', () => {
  assert.equal(resolveTier('community').id, 'community');
  assert.equal(resolveTier('core').id, 'community'); // legacy alias
  assert.equal(resolveTier('professional').id, 'developer_pro');
  assert.equal(hasCapability('enterprise', 'deployment_integration'), true);
  assert.equal(hasCapability('community', 'deployment_integration'), false);
  assert.equal(hasCapability('community', 'approval_gated_deploy'), false);
  assert.equal(hasCapability('developer_pro', 'approval_gated_deploy'), false);
  assert.equal(hasCapability('team', 'approval_gated_deploy'), true);
  assert.equal(hasCapability('developer_pro', 'composition_engine'), true);
  const matrix = featureMatrix();
  assert.ok(matrix.matrix.composition_engine.developer_pro);
  assert.equal(matrix.pricingMetric, 'concurrent_coordinated_agents');
  assert.equal(TIERS.developer_pro.price.amount, 59);
  assert.equal(TIERS.team.price.amount, 299);
  assert.equal(TIERS.enterprise.price.amount, 30000);
  assert.equal(TIERS.developer_pro.capacity.concurrentCoordinatedAgents, 8);
  assert.equal(TIERS.team.capacity.concurrentCoordinatedAgents, 32);
});

test('Rhyming Shield is a self-similar security add-on ladder', () => {
  assert.equal(ADDONS.rhyming_shield.kind, 'security_addon');
  assert.equal(resolveRhymingShieldPackage('developer_pro').price.amount, 59);
  assert.equal(resolveRhymingShieldPackage('team').price.amount, 299);
  assert.equal(resolveRhymingShieldPackage('enterprise').price.amount, 30000);
  assert.equal(resolveRhymingShieldPackage('lab').price.amount, 0);
  assert.equal(hasRhymingShieldCapability('developer_pro', 'rhyming_shield'), true);
  assert.equal(hasRhymingShieldCapability('lab', 'rhyming_shield'), false);
  const matrix = featureMatrix();
  assert.equal(matrix.addons.rhyming_shield.prices.developer_pro.amount, 59);
  assert.equal(matrix.addons.rhyming_shield.prices.team.amount, 299);
});
