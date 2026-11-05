import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapCi, bootstrapRatioCi, mean, median, quantileSorted, summarize } from '../../src/core/stats.mjs';

test('quantiles interpolate linearly between order statistics', () => {
  assert.equal(quantileSorted([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(quantileSorted([10, 20], 0.25), 12.5);
  assert.equal(quantileSorted([5], 0.95), 5);
});

test('quantile rejects an empty sample and an out-of-range q', () => {
  assert.throws(() => quantileSorted([], 0.5), RangeError);
  assert.throws(() => quantileSorted([1], 1.5), RangeError);
});

test('median and mean', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(mean([1, 2, 3, 6]), 3);
  assert.throws(() => mean([]), RangeError);
});

test('summarize reports the sample shape', () => {
  const summary = summarize([4, 1, 3, 2]);
  assert.equal(summary.n, 4);
  assert.equal(summary.min, 1);
  assert.equal(summary.max, 4);
  assert.equal(summary.p50, 2.5);
});

test('a bootstrap interval is deterministic for a seed and contains the estimate', () => {
  const samples = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const a = bootstrapCi(samples, { seed: 3, resamples: 500 });
  const b = bootstrapCi(samples, { seed: 3, resamples: 500 });
  assert.deepEqual(a, b);
  assert.ok(a.low <= a.estimate && a.estimate <= a.high);
  assert.ok(a.low > 10 && a.high < 19);
});

test('a constant sample has a zero-width interval', () => {
  const ci = bootstrapCi([5, 5, 5, 5], { resamples: 100 });
  assert.equal(ci.low, 5);
  assert.equal(ci.high, 5);
});

test('a ratio interval covers the true ratio of two samples', () => {
  const ci = bootstrapRatioCi([20, 21, 19, 20, 22], [10, 11, 9, 10, 10], { seed: 5, resamples: 500 });
  assert.equal(ci.estimate, 2);
  assert.ok(ci.low <= 2 && 2 <= ci.high);
});

test('bootstrap rejects empty samples', () => {
  assert.throws(() => bootstrapCi([]), RangeError);
  assert.throws(() => bootstrapRatioCi([], [1]), RangeError);
});
