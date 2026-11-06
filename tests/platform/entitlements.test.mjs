import assert from 'node:assert/strict';
import test from 'node:test';
import { featureMatrix, hasCapability, resolveTier } from '../../src/platform/entitlements.mjs';

test('tiers are packaging labels with cumulative capabilities', () => {
  assert.equal(resolveTier('core').id, 'core');
  assert.equal(hasCapability('enterprise', 'deployment_integration'), true);
  assert.equal(hasCapability('core', 'deployment_integration'), false);
  const matrix = featureMatrix();
  assert.ok(matrix.matrix.composition_engine.professional);
});
