import assert from 'node:assert/strict';
import test from 'node:test';
import { experimentA_illustrativeModel, illustrativeMemoryModel } from '../../src/experiments/a-illustrative-model.mjs';

test('the illustrative arithmetic is what the published text says', () => {
  const model = illustrativeMemoryModel();
  assert.ok(Math.abs(model.reductionPct - 78.7) < 0.15);
  assert.ok(Math.abs(model.nonWeightCutNeededPct - 94.12) < 0.2);
  assert.equal(model.approaches80, true);
});

test('the experiment says it is a hypothesis model', () => {
  const result = experimentA_illustrativeModel();
  assert.equal(result.pass, true);
  assert.match(result.honesty, /not a measured/);
});
