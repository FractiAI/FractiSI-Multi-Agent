import assert from 'node:assert/strict';
import test from 'node:test';
import { runCompositionalWetLabScaleSuite } from '../../research/compositional-wet-lab-scale/src/experiments.mjs';

test('CWLS Soft Story suite Exp 1–12 all pass', () => {
  const report = runCompositionalWetLabScaleSuite();
  assert.equal(report.engineShelfSlot, 57);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 12);
  assert.equal(report.passCount, 12);
  assert.equal(report.pass, true);
  assert.equal(report.majorResultShape.measured.level3Proven, false);
  assert.equal(report.baselines.digitalLatency.tier, 'measured');
  assert.equal(report.baselines.historicalEmEnergy.tier, 'historical');
  assert.deepEqual(report.majorResultShape.measured.volumeSequence, [
    1, 2, 4, 8, 16, 32, 64, 128, 256,
  ]);
});
