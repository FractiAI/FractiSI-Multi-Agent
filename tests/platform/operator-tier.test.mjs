import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canDeploy,
  resolveOperatorTier,
} from '../../src/platform/operator-tier.mjs';

test('Community is the default operator tier', () => {
  const tier = resolveOperatorTier({}, {});
  assert.equal(tier.id, 'community');
  assert.equal(canDeploy(tier), false);
});

test('FRACTISI_EDITION unlocks paid deploy on Team+', () => {
  assert.equal(canDeploy(resolveOperatorTier({}, { FRACTISI_EDITION: 'team' })), true);
  assert.equal(canDeploy(resolveOperatorTier({}, { FRACTISI_EDITION: 'enterprise' })), true);
  assert.equal(canDeploy(resolveOperatorTier({}, { FRACTISI_TIER: 'developer_pro' })), false);
});
