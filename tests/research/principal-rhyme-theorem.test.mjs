import assert from 'node:assert/strict';
import test from 'node:test';
import { runPrincipalRhymeSuite } from '../../research/principal-rhyme-theorem/src/experiments.mjs';

test('PRT Soft Story suite Exp 1–7 all pass', () => {
  const report = runPrincipalRhymeSuite();
  assert.equal(report.engineShelfSlot, 55);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 7);
  assert.equal(report.passCount, 7);
  assert.equal(report.pass, true);
});
