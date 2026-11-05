import assert from 'node:assert/strict';
import test from 'node:test';
import { predictedReduction, sessionScaling } from '../../../src/benchmarks/deterministic/scaling.mjs';

test('the closed form follows from storing shared bytes once', () => {
  for (const [S, D, n] of [[1000, 100, 8], [100, 900, 64], [5000, 5000, 2]]) {
    const direct = 1 - (S + n * D) / (n * (S + D));
    assert.ok(Math.abs(predictedReduction(n, S / (S + D)) - direct) < 1e-12);
  }
});

test('one session has no saving, and the saving never reaches the shared fraction', () => {
  assert.equal(predictedReduction(1, 0.9), 0);
  for (const n of [2, 16, 1024, 1e6]) assert.ok(predictedReduction(n, 0.9) < 0.9);
});

test('measured curves track the prediction, and longer conversations save less', () => {
  const { series } = sessionScaling({ seed: 1, sessions: [1, 4, 64], turns: [1, 25] });
  assert.ok(series.every((s) => s.maxAbsoluteError < 0.1));
  assert.ok(series[1].measuredAtLargestN < series[0].measuredAtLargestN);
  for (const s of series) assert.ok(s.points.at(-1).measured < s.points.at(-1).sharedFraction + 1e-9);
});
