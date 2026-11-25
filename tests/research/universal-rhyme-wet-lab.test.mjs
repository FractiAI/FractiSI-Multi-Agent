import assert from 'node:assert/strict';
import test from 'node:test';
import { runUniversalRhymeWetLabSuite } from '../../research/universal-rhyme-wet-lab/src/experiments.mjs';

test('URWL Soft Story suite Exp 1–7 all pass', () => {
  const report = runUniversalRhymeWetLabSuite();
  assert.equal(report.engineShelfSlot, 56);
  assert.equal(report.engineShelfPinned, true);
  assert.equal(report.total, 7);
  assert.equal(report.passCount, 7);
  assert.equal(report.pass, true);
});
