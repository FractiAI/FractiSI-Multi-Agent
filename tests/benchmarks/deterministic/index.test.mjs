import assert from 'node:assert/strict';
import test from 'node:test';
import { runDeterministicBenchmarks } from '../../../src/benchmarks/deterministic/index.mjs';
import { loadPlan } from '../../../src/benchmarks/plan.mjs';

test('the tier produces every section and repeats exactly', () => {
  const { plan } = loadPlan();
  const a = runDeterministicBenchmarks(plan);
  assert.deepEqual(Object.keys(a), ['suite', 'sensitivity', 'exactness', 'baselines', 'scaling', 'crossover', 'gpuProxy']);
  assert.equal(JSON.stringify(a), JSON.stringify(runDeterministicBenchmarks(plan)));
});
