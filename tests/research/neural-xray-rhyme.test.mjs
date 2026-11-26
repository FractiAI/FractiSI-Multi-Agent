import assert from 'node:assert/strict';
import test from 'node:test';
import { runNeuralXrayRhymeSuite } from '../../research/neural-xray-rhyme/src/experiments.mjs';

test('NXR Soft Story suite Exp 1–8 all pass', () => {
  const report = runNeuralXrayRhymeSuite();
  assert.equal(report.engineShelfSlot, 58);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 8);
  assert.equal(report.passCount, 8);
  assert.equal(report.pass, true);
  assert.equal(report.majorResultShape.measured.fullXrayClaimed, false);
  assert.equal(report.majorResultShape.measured.decisiveThresholdOpen, true);
  assert.equal(report.anchors.tier, 'measured');
});
