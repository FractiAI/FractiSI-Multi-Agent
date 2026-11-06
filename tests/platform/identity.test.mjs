import assert from 'node:assert/strict';
import test from 'node:test';
import { CAPABILITIES, COMPANY, CORE_TECHNOLOGY, PRODUCT, productBanner } from '../../src/platform/identity.mjs';

test('product identity locks company and flagship name', () => {
  assert.equal(COMPANY, 'FractiSI');
  assert.equal(PRODUCT, 'FractiSI Multi-Agent');
  assert.equal(CORE_TECHNOLOGY, 'Tiny Footprint');
  assert.ok(CAPABILITIES.includes('multi_agent_coordination'));
  assert.match(productBanner(), /FractiSI Multi-Agent/);
});
