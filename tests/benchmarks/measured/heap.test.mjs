import assert from 'node:assert/strict';
import test from 'node:test';
import { heapDesign, runHeapBenchmark } from '../../../src/benchmarks/measured/heap.mjs';

const plan = {
  workloads: { rhyme_differing: { conditions: ['duplicated', 'tiny'] }, ai_context: { conditions: ['aliased'], turns: 1 } },
  sessions: [8, 16],
  trials: 3,
  quickSessions: [8],
  quickTrials: 1,
  controls: [{ condition: 'control_empty' }],
};
const seeds = { primary: 1, orderShuffle: 2 };

test('the design is the full cross of workloads, stores, sizes and trials, plus controls', () => {
  assert.equal(heapDesign(plan, seeds).length, 3 * 2 * 3 + 3);
  assert.equal(heapDesign(plan, seeds).filter((s) => s.kind === 'control').length, 3);
  assert.equal(heapDesign(plan, seeds).find((s) => s.workload === 'ai_context').turns, 1);
});

test('quick mode uses the smaller grid', () => {
  assert.equal(heapDesign(plan, seeds, { quick: true }).length, 3 + 1);
});

test('a quick run returns one result per spec', () => {
  assert.equal(runHeapBenchmark(plan, seeds, { quick: true }).length, 4);
});
