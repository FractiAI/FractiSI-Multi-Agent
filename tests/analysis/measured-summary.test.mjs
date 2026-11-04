import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateHeapForReceipt, completedRuns, heapGrowthViolations, perTrialMedians, summarizeHeap, summarizeLatency, summarizeLlm, summarizeRss } from '../../src/analysis/measured-summary.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const bootstrap = { resamples: 200, confidence: 0.95, seed: 1 };
const heapSample = (condition, heapUsedDelta, representationBytes) => ({
  kind: 'heap', workload: 'w', sessions: 10, condition, heapUsedDelta, representationBytes, wireBytes: 1000, rssDelta: 1, buildMs: 1,
});

const heapReceipt = {
  samples: [
    ...[1000, 1010, 990].map((v) => heapSample('duplicated', v, 1000)),
    ...[500, 505, 495].map((v) => heapSample('tiny', v, 200)),
    { kind: 'control', condition: 'control_empty', heapUsedDelta: 10 },
    { kind: 'control', condition: 'control_empty', heapUsedDelta: 12 },
    { kind: 'control', condition: 'control_known', heapUsedDelta: 1010, expectedBytes: 1000 },
  ],
};

test('heap rows compare against the duplicated store', () => {
  const { rows, controls } = summarizeHeap(heapReceipt, bootstrap);
  const tiny = rows.find((r) => r.condition === 'tiny');
  assert.equal(tiny.jsonReduction, 0.8);
  assert.equal(tiny.heapReduction.estimate, 0.5);
  assert.ok(tiny.heapReduction.low <= 0.5 && tiny.heapReduction.high >= 0.5);
  assert.equal(tiny.heapPerSessionBytes, 50);
  assert.equal(rows.find((r) => r.condition === 'duplicated').jsonReduction, 0);
  assert.equal(controls.knownRelativeError, 0.01);
  assert.equal(controls.emptyMaxBytes, 12);
});

test('a small customer table reports medians by condition', () => {
  const [row] = aggregateHeapForReceipt(heapReceipt.samples);
  assert.equal(row.duplicatedMedian, 1000);
  assert.equal(row.tinyMedian, 500);
  assert.equal(row.aliasedMedian, null);
});

test('latency ratios and exactness counts are carried through', () => {
  const sample = (condition, p50Ns) => ({ workload: 'w', condition, p50Ns, exactReconstructions: 4, checkedReconstructions: 4 });
  const { rows } = summarizeLatency({ samples: [sample('duplicated', 100), sample('duplicated', 100), sample('tiny', 200), sample('tiny', 200)] }, bootstrap);
  const tiny = rows.find((r) => r.condition === 'tiny');
  assert.equal(tiny.ratioToDuplicated.estimate, 2);
  assert.equal(tiny.exactReconstructions, 8);
});

test('RSS compares with the heap reduction', () => {
  const sample = (condition, rssDelta, heapUsedDelta) => ({ condition, rssDelta, heapUsedDelta, peakRssBytes: 5, sessions: 3 });
  const { rows } = summarizeRss({ samples: [sample('duplicated', 100, 100), sample('tiny', 80, 50)] }, bootstrap);
  const tiny = rows.find((r) => r.condition === 'tiny');
  assert.ok(Math.abs(tiny.rssReduction.estimate - 0.2) < 1e-12);
  assert.equal(tiny.heapReduction, 0.5);
});

test('a real-model run that did not run stays not_run', () => {
  const [run] = summarizeLlm([{ ...notRunReport('llm_stack_unavailable'), run: 'x' }], bootstrap);
  assert.deepEqual(run, { status: 'not_run', reason: 'llm_stack_unavailable', run: 'x' });
});

test('a completed run computes speedups and the reduction with weights', () => {
  const arm = (prefill, decode) => ({ prefillCallSamplesMs: [prefill], prefillBatchSamplesMs: [prefill * 2], decodeBatchSamplesMs: [decode] });
  const [run] = summarizeLlm([{
    status: 'pass', run: 'r', model: { parameterCount: 100 }, backend: 'cpu', device: 'x', software: {}, workload: { trainSteps: 0, trials: 1 }, equivalence: {},
    inference: { withoutTinyFootprint: arm(40, 100), withTinyFootprint: arm(10, 100) },
    residency: { duplicated: { logicalBytes: 1000 }, shared: { logicalBytes: 100 } },
    training: null,
  }], bootstrap);
  assert.equal(run.prefillCall.speedup.estimate, 4);
  assert.equal(run.decodeBatch.speedup.estimate, 1);
  assert.equal(run.endToEndBatch.speedup.estimate, 180 / 120);
  assert.equal(run.withWeights.weightBytes, 400);
  assert.equal(run.withWeights.reduction, 1 - 500 / 1400);
  assert.equal(run.trainingSpeedup, null);
});

test('training gets a bootstrap interval from its round samples', () => {
  const arm = { prefillCallSamplesMs: [2], prefillBatchSamplesMs: [2], decodeBatchSamplesMs: [2] };
  const [run] = summarizeLlm([{
    status: 'pass', run: 'r', model: { parameterCount: 1 }, backend: 'cpu', device: 'x', software: {}, workload: { trainSteps: 3, trials: 1 }, equivalence: {},
    inference: { withoutTinyFootprint: arm, withTinyFootprint: arm },
    residency: { duplicated: { logicalBytes: 2 }, shared: { logicalBytes: 1 } },
    training: { withoutTinyFootprint: { stepSamplesMs: [2, 2, 2] }, withTinyFootprint: { stepSamplesMs: [1, 1, 1] }, comparison: { stepP50Speedup: 2 } },
    load: { start: {}, end: {} },
  }], bootstrap);
  assert.equal(run.trainingInterval.estimate, 2);
  assert.equal(run.trainingInterval.low, 2);
  assert.deepEqual(run.load, { start: {}, end: {} });
});

test('call samples reduce to one median per trial, the most independent unit in one process', () => {
  assert.deepEqual(perTrialMedians([1, 2, 3, 10, 20, 30], 2), [2, 20]);
  assert.throws(() => perTrialMedians([1, 2, 3], 2), /do not divide/);
});

test('only a passing run counts as completed', () => {
  const llm = [{ status: 'pass', residency: {} }, { status: 'fail', residency: {} }, { status: 'not_run' }, { status: 'pass' }];
  assert.equal(completedRuns({ llm }).length, 1);
});

test('negative control: a store that reads smaller as it grows is flagged, with no interval to hide behind', () => {
  const row = (sessions, estimate) => ({ workload: 'w', condition: 'exact_cache', sessions, heap: { estimate, low: estimate, high: estimate } });
  const violations = heapGrowthViolations([row(16, 6000), row(64, 21000), row(256, 900), row(1024, 300000)]);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /w\/exact_cache: 256 sessions/);
});

test('growth is checked per store, and healthy readings pass', () => {
  const row = (condition, sessions, estimate) => ({ workload: 'w', condition, sessions, heap: { estimate } });
  assert.deepEqual(heapGrowthViolations([row('a', 16, 10), row('a', 64, 40), row('b', 16, 90), row('b', 64, 300)]), []);
});
