import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runSuiteBytes } from '../../../src/benchmarks/deterministic/suite-bytes.mjs';

const golden = JSON.parse(readFileSync(new URL('../../fixtures/golden-experiments-0dcf9d2.json', import.meta.url), 'utf8'));

test('workload bytes equal the result captured before modularization', () => {
  const { workloads } = runSuiteBytes({ seed: 20261103, validationSeed: 202611032 });
  for (const workload of workloads) {
    assert.equal(workload.baselineBytes, golden[workload.key].baselineBytes);
    assert.equal(workload.tinyBytes, golden[workload.key].tinyBytes);
    assert.equal(workload.ratio, golden[workload.key].ratio);
  }
  assert.deepEqual(workloads.map((w) => w.key), ['B', 'C', 'D', 'E', 'F']);
});
