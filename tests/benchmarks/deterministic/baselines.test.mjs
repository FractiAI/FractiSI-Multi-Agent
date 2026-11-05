import assert from 'node:assert/strict';
import test from 'node:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import { compressionReference, normalizedCrossLinkedBaseline } from '../../../src/benchmarks/deterministic/baselines.mjs';

test('normalizing the graph captures the saving, and the template adds to it', () => {
  const result = normalizedCrossLinkedBaseline({ seed: 20261103 });
  assert.ok(result.normalizedBytes < result.conventionalBytes);
  assert.ok(result.tinyBytes > result.normalizedBytes, 'the template form is larger than plain references');
  assert.ok(result.normalizedToTiny < 0);
});

test('the compression reference records its zlib and covers the lossless workloads', () => {
  const result = compressionReference({ seed: 20261103 });
  assert.equal(result.zlib, process.versions.zlib);
  assert.deepEqual(result.workloads.map((w) => w.key), ['B', 'C', 'D', 'F']);
  assert.ok(result.workloads.every((w) => w.baselineGzipBytes < w.baselineBytes));
  assert.equal(gunzipSync(gzipSync(Buffer.from('round trip'))).toString(), 'round trip');
});
