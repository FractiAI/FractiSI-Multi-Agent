import test from 'node:test';
import assert from 'node:assert/strict';
import { runGoldenNightSuite } from '../../research/golden-night-goldilocks-path/src/experiments.mjs';

test('Golden Night Soft Story suite passes E1–E8', () => {
  const report = runGoldenNightSuite({ trials: 5000 });
  assert.equal(report.pass, true);
  assert.equal(report.passCount, 8);
  assert.equal(report.total, 8);
  assert.equal(report.documentId, 'WP-GOLDEN-NIGHT-99-GOLDILOCKS-PATH-2026-11-27');
  assert.equal(report.reference.ranked[0].strategyId, 'goldilocks-path');
  assert.equal(report.sensitivity.advantageLost, true);
});
