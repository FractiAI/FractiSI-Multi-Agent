import assert from 'node:assert/strict';
import test from 'node:test';
import { measureLatency } from '../../../src/benchmarks/measured/latency-measure.mjs';

const spec = { workload: 'ai_context', sessions: 8, seed: 1, turns: 2, warmupOps: 32, measuredOps: 64, batch: 8 };

test('every session reconstructs exactly before any timing counts', () => {
  for (const condition of ['duplicated', 'aliased', 'tiny', 'tiny_noclone']) {
    const result = measureLatency({ ...spec, condition });
    assert.equal(result.exactReconstructions, result.checkedReconstructions, condition);
    assert.equal(result.checkedReconstructions, 8);
    assert.ok(result.p50Ns > 0 && result.p95Ns >= result.p50Ns);
    assert.equal(result.batchesTimed, 8);
  }
});

test('an unknown store is refused', () => {
  assert.throws(() => measureLatency({ ...spec, condition: 'nope' }), /unknown condition/);
});
