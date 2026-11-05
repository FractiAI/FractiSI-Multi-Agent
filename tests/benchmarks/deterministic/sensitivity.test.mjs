import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateSensitivity } from '../../../src/benchmarks/deterministic/sensitivity.mjs';

const workload = (key, baselineBytes, tinyBytes) => ({ key, baselineBytes, tinyBytes, ratio: 1 - tinyBytes / baselineBytes });
const workloads = [
  workload('B', 100, 50),
  workload('C', 1000, 100),
  workload('D', 100, 10),
  workload('E', 800, 8),
  workload('F', 100, 50),
];

test('every alternative is computed from the same workloads', () => {
  const result = aggregateSensitivity(workloads, 0.8);
  assert.equal(result.published.ratio, 1 - 218 / 2100);
  assert.equal(result.unweightedMean.ratio, (0.5 + 0.9 + 0.9 + 0.99 + 0.5) / 5);
  assert.deepEqual(result.lossless.keys, ['B', 'C', 'D', 'F']);
  assert.equal(result.lossless.ratio, 1 - 210 / 1300);
  assert.deepEqual(result.nonStrawman.keys, ['B', 'D', 'F']);
  assert.equal(result.leaveOneOut.length, 5);
});

test('clearing the target is computed, not assumed', () => {
  const result = aggregateSensitivity(workloads, 0.8);
  assert.equal(result.published.clearsTarget, true);
  assert.equal(result.nonStrawman.clearsTarget, false);
});

test('byte shares sum to one', () => {
  const total = aggregateSensitivity(workloads, 0.8).byteShare.reduce((sum, b) => sum + b.share, 0);
  assert.ok(Math.abs(total - 1) < 1e-12);
});
