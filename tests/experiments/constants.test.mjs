import assert from 'node:assert/strict';
import test from 'node:test';
import { BUILDS_ON, DIGITAL_SEED, DRAM_REDUCTION_TARGET, ENGINE_SHELF_SLOT, HONESTY, REPRESENTATION_REDUCTION_TARGET, VALIDATION_SEED } from '../../src/experiments/constants.mjs';

test('the published seeds and slot are stable', () => {
  assert.equal(DIGITAL_SEED, 20261103);
  assert.equal(VALIDATION_SEED, 202611032);
  assert.equal(ENGINE_SHELF_SLOT, 52);
});

test('the deprecated target name still equals the representation target', () => {
  assert.equal(DRAM_REDUCTION_TARGET, REPRESENTATION_REDUCTION_TARGET);
});

test('the lineage is frozen and the honesty note names its limits', () => {
  assert.ok(Object.isFrozen(BUILDS_ON));
  assert.match(HONESTY, /Proxy ≠ model forward/);
});
