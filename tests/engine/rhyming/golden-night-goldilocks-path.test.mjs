import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GN_DOCUMENT_ID,
  GN_ENGINE_SHELF_PINNED,
  OMNI_LATTICE_NODES,
  STRATEGY_ORDER,
  GOLDILOCKS_SEQUENCE,
  weightedGeometricMean,
  goldenNightRecord,
  runReferenceComparison,
} from '../../../src/engine/rhyming/golden-night-goldilocks-path.mjs';

test('Golden Night document id and Soft Story shelf lock', () => {
  assert.equal(GN_DOCUMENT_ID, 'WP-GOLDEN-NIGHT-99-GOLDILOCKS-PATH-2026-11-27');
  assert.equal(GN_ENGINE_SHELF_PINNED, false);
  assert.equal(OMNI_LATTICE_NODES, 99);
  assert.equal(STRATEGY_ORDER.length, 6);
  assert.equal(GOLDILOCKS_SEQUENCE.length, 9);
});

test('weighted geometric mean is 1 when all dims are 1', () => {
  assert.ok(Math.abs(weightedGeometricMean(Array(11).fill(1)) - 1) < 1e-12);
});

test('reference comparison ranks goldilocks first', () => {
  const ref = runReferenceComparison({ trials: 2000, seed: 20261127 });
  assert.equal(ref.ranked[0].strategyId, 'goldilocks-path');
  assert.ok(ref.byId['goldilocks-path'].meanCoherence > 0.9);
});

test('goldenNightRecord freezes expedition metadata', () => {
  const r = goldenNightRecord();
  assert.equal(r.omniLatticeNodes, 99);
  assert.equal(r.strategies, 6);
  assert.ok(r.doesNotProve.length >= 3);
});
