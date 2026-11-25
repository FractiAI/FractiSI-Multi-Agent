import assert from 'node:assert/strict';
import test from 'node:test';
import { runCompositionalWetLabScaleSuite } from '../../research/compositional-wet-lab-scale/src/experiments.mjs';

test('CWLS Soft Story suite Exp 1–7 all pass', () => {
  const report = runCompositionalWetLabScaleSuite();
  assert.equal(report.engineShelfSlot, 57);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 7);
  assert.equal(report.passCount, 7);
  assert.equal(report.pass, true);
  assert.equal(report.majorResultShape.measured.level3Proven, false);
});
