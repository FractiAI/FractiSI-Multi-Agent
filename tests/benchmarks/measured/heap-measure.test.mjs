import assert from 'node:assert/strict';
import test from 'node:test';
import { measureHeap } from '../../../src/benchmarks/measured/heap-measure.mjs';
import { runChild } from '../../../src/benchmarks/measured/child-runner.mjs';

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const trials = (spec, n = 5) => Array.from({ length: n }, (_, trial) => runChild({ ...spec, trial }));

test('the instrument reads near zero when nothing is allocated', () => {
  const readings = trials({ kind: 'control', condition: 'control_empty' }).map((r) => r.heapUsedDelta);
  assert.ok(Math.abs(median(readings)) < 16 * 1024, `read ${median(readings)} bytes`);
});

test('the instrument reads a known allocation accurately', () => {
  const results = trials({ kind: 'control', condition: 'control_known', doubles: 200_000 });
  const reading = median(results.map((r) => r.heapUsedDelta));
  assert.ok(Math.abs(reading - results[0].expectedBytes) / results[0].expectedBytes < 0.01, `read ${reading}`);
});

test('negative control: a store that is dropped is not counted', () => {
  // Aliasing retains one prompt copy; duplication retains one per session. The heap sees that.
  const spec = { kind: 'heap', workload: 'ai_context', sessions: 64, seed: 1, turns: 5 };
  const duplicated = median(trials({ ...spec, condition: 'duplicated' }).map((r) => r.heapUsedDelta));
  const aliased = median(trials({ ...spec, condition: 'aliased' }).map((r) => r.heapUsedDelta));
  assert.ok(aliased < duplicated * 0.8, `aliased ${aliased}, duplicated ${duplicated}`);
});

test('JSON bytes cannot see a shared reference, and the heap can', () => {
  const spec = { kind: 'heap', workload: 'ai_context', sessions: 16, seed: 1, turns: 1, trial: 0 };
  const duplicated = runChild({ ...spec, condition: 'duplicated' });
  const aliased = runChild({ ...spec, condition: 'aliased' });
  assert.equal(aliased.representationBytes, duplicated.representationBytes);
  assert.ok(aliased.heapUsedDelta < duplicated.heapUsedDelta);
});

test('measuring without exposed garbage collection is refused, and so is an unknown store', () => {
  if (typeof globalThis.gc !== 'function') {
    assert.throws(() => measureHeap({ workload: 'ai_context', condition: 'duplicated', sessions: 1 }), /expose-gc/);
  }
  assert.throws(() => runChild({ kind: 'heap', workload: 'ai_context', condition: 'nope', sessions: 1, seed: 1, turns: 1 }), /unknown condition/);
  assert.throws(() => runChild({ kind: 'control', condition: 'nope' }), /unknown control/);
});

test('regression: a discarded warm pass is not counted, at the size that exposed it', () => {
  // At 256 sessions two forced collections left the warm store alive, so this read near zero.
  const reading = median(trials({ kind: 'heap', workload: 'rhyme_differing', condition: 'exact_cache', sessions: 256, seed: 1 }, 3).map((r) => r.heapUsedDelta));
  assert.ok(reading / 256 > 100, `read ${reading / 256} bytes per session`);
});
