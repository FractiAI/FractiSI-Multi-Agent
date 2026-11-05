import assert from 'node:assert/strict';
import test from 'node:test';
import { childFlags, heapIsolationFlags, runChild, runDesign } from '../../../src/benchmarks/measured/child-runner.mjs';

test('a child runs in its own process with garbage collection exposed', () => {
  const result = runChild({ kind: 'control', condition: 'control_empty', trial: 0 });
  assert.equal(result.condition, 'control_empty');
  assert.equal(typeof result.heapUsedDelta, 'number');
});

test('a failing child throws with its specification and stderr', () => {
  assert.throws(() => runChild({ kind: 'nope' }), /benchmark child failed[\s\S]*unknown measurement kind/);
});

test('a design runs every spec in a seeded order and reports progress', () => {
  const specs = [0, 1, 2].map((trial) => ({ kind: 'control', condition: 'control_empty', trial }));
  const seen = [];
  const results = runDesign(specs, 5, (done, total) => seen.push([done, total]));
  assert.deepEqual(results.map((r) => r.trial).sort(), [0, 1, 2]);
  assert.deepEqual(seen.at(-1), [3, 3]);
});

test('heap measurements isolate data from tier-up; latency and RSS keep normal settings', () => {
  assert.ok(heapIsolationFlags().includes('--no-opt'));
  assert.ok(childFlags({ kind: 'heap' }).includes('--no-opt'));
  assert.ok(childFlags({ kind: 'control' }).includes('--no-opt'));
  assert.deepEqual(childFlags({ kind: 'latency' }), ['--expose-gc']);
  assert.deepEqual(childFlags({ kind: 'rss' }), ['--expose-gc']);
});

test('a heap reading repeats exactly across processes', () => {
  const spec = { kind: 'heap', workload: 'rhyme_differing', condition: 'tiny', sessions: 64, seed: 1 };
  const readings = new Set([0, 1, 2].map((trial) => runChild({ ...spec, trial }).heapUsedDelta));
  assert.equal(readings.size, 1);
});
