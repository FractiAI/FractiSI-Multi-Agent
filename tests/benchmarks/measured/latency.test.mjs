import assert from 'node:assert/strict';
import test from 'node:test';
import { latencyDesign, runLatencyBenchmark } from '../../../src/benchmarks/measured/latency.mjs';

const plan = {
  workloads: { rhyme_differing: { conditions: ['duplicated', 'tiny'] } },
  sessions: 4,
  processes: 2,
  warmupOps: 8,
  measuredOps: 16,
  batch: 4,
};

test('the design is one process per condition and replicate', () => {
  const specs = latencyDesign(plan, { primary: 1 });
  assert.equal(specs.length, 4);
  assert.deepEqual([...new Set(specs.map((s) => s.process))], [0, 1]);
});

test('a run returns exact reconstructions from separate processes', () => {
  const results = runLatencyBenchmark(plan, { primary: 1, orderShuffle: 2 });
  assert.equal(results.length, 4);
  assert.ok(results.every((r) => r.exactReconstructions === r.checkedReconstructions));
});
