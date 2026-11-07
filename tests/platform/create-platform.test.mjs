import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlatform } from '../../src/platform/create-platform.mjs';

test('createPlatform wires coordination composition git and deploy', () => {
  const platform = createPlatform({ project: { name: 'p', root: '/tmp/p' } });
  assert.equal(platform.product, 'FractiSI Multi-Agent');
  assert.equal(platform.tier.id, 'community');
  assert.equal(typeof platform.gateway.registerTemplate, 'function');
  assert.equal(platform.status().project.name, 'p');
  assert.ok(platform.featureMatrix().tiers.includes('enterprise'));
});
