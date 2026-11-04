import assert from 'node:assert/strict';
import test from 'node:test';
import { fullExactness } from '../../../src/benchmarks/deterministic/exactness.mjs';

const results = fullExactness({ seed: 20261103 });

test('every record in the lossless workloads round-trips', () => {
  for (const key of ['B', 'C', 'D', 'F']) {
    assert.equal(results[key].lossless, true, key);
    assert.equal(results[key].matched, results[key].checked, key);
    assert.ok(results[key].checked > 0, key);
  }
});

test('the selective workload is reported as not lossless', () => {
  assert.equal(results.E.lossless, false);
  assert.ok(results.E.matched < results.E.checked);
});

test('other seeds round-trip too', () => {
  const other = fullExactness({ seed: 7 });
  assert.equal(other.B.lossless && other.C.lossless && other.D.lossless && other.F.lossless, true);
});
