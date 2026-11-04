/**
 * Statistics over measured receipts. The independent unit is one child process, so
 * bootstrap intervals resample processes rather than iterations within a process.
 */
import { bootstrapCi, bootstrapRatioCi, median } from '../core/stats.mjs';

const REFERENCE_CONDITION = 'duplicated';
const FLOAT32_BYTES = 4;

function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

/** Small per-workload table for a customer's own receipt. */
export function aggregateHeapForReceipt(samples) {
  const rows = new Map();
  for (const sample of samples.filter((s) => s.kind === 'heap')) {
    const key = `${sample.workload}|${sample.sessions}`;
    if (!rows.has(key)) rows.set(key, { workload: sample.workload, sessions: sample.sessions, values: {} });
    const row = rows.get(key);
    (row.values[sample.condition] ??= []).push(sample.heapUsedDelta);
  }
  const ordered = [...rows.values()].sort((a, b) => a.workload.localeCompare(b.workload) || a.sessions - b.sessions);
  return ordered.map(({ workload, sessions, values }) => ({
    workload,
    sessions,
    duplicatedMedian: values.duplicated ? median(values.duplicated) : null,
    aliasedMedian: values.aliased ? median(values.aliased) : null,
    tinyMedian: values.tiny ? median(values.tiny) : null,
    exactCacheMedian: values.exact_cache ? median(values.exact_cache) : null,
  }));
}

/**
 * @param {object} receipt measured heap receipt
 * @param {{resamples: number, confidence: number, seed: number}} bootstrap
 */
export function summarizeHeap(receipt, bootstrap) {
  const heap = receipt.samples.filter((s) => s.kind === 'heap');
  const controls = receipt.samples.filter((s) => s.kind === 'control');
  const rows = [];
  for (const [key, group] of groupBy(heap, (s) => `${s.workload}|${s.sessions}`)) {
    const [workload, sessionsText] = key.split('|');
    const byCondition = groupBy(group, (s) => s.condition);
    const reference = byCondition.get(REFERENCE_CONDITION);
    const referenceHeap = reference.map((s) => s.heapUsedDelta);
    const referenceRepresentation = reference[0].representationBytes;
    for (const [condition, samples] of byCondition) {
      const heapValues = samples.map((s) => s.heapUsedDelta);
      const ratio = bootstrapRatioCi(heapValues, referenceHeap, bootstrap);
      rows.push({
        workload,
        sessions: Number(sessionsText),
        condition,
        n: samples.length,
        heap: bootstrapCi(heapValues, bootstrap),
        heapPerSessionBytes: median(heapValues) / Number(sessionsText),
        rssMedianBytes: median(samples.map((s) => s.rssDelta)),
        buildMsMedian: median(samples.map((s) => s.buildMs)),
        representationBytes: samples[0].representationBytes,
        wireBytes: samples[0].wireBytes,
        jsonReduction: 1 - samples[0].representationBytes / referenceRepresentation,
        heapReduction: { estimate: 1 - ratio.estimate, low: 1 - ratio.high, high: 1 - ratio.low },
      });
    }
  }
  const controlValues = (name) => controls.filter((s) => s.condition === name).map((s) => s.heapUsedDelta);
  const known = controls.find((s) => s.condition === 'control_known');
  const knownMedian = median(controlValues('control_known'));
  return {
    rows,
    controls: {
      emptyMedianBytes: median(controlValues('control_empty')),
      emptyMaxBytes: Math.max(...controlValues('control_empty')),
      knownMedianBytes: knownMedian,
      knownExpectedBytes: known.expectedBytes,
      knownRelativeError: Math.abs(knownMedian - known.expectedBytes) / known.expectedBytes,
      trials: controlValues('control_empty').length,
    },
  };
}

/**
 * A store's total retained heap cannot fall as it holds more sessions. A violation means
 * the instrument misread a cell, whatever its interval says: narrow intervals only show
 * that a reading repeats, and a systematic error repeats perfectly.
 *
 * @param {ReadonlyArray<{workload: string, condition: string, sessions: number, heap: {estimate: number}}>} rows
 * @returns {string[]} one description per violation
 */
export function heapGrowthViolations(rows) {
  const violations = [];
  for (const [key, group] of groupBy(rows, (row) => `${row.workload}/${row.condition}`)) {
    const ordered = [...group].sort((a, b) => a.sessions - b.sessions);
    for (let i = 1; i < ordered.length; i++) {
      if (ordered[i].heap.estimate < ordered[i - 1].heap.estimate) {
        violations.push(`${key}: ${ordered[i].sessions} sessions read ${ordered[i].heap.estimate} bytes, below ${ordered[i - 1].sessions} sessions at ${ordered[i - 1].heap.estimate}`);
      }
    }
  }
  return violations;
}

/**
 * @param {object} receipt measured latency receipt
 * @param {{resamples: number, confidence: number, seed: number}} bootstrap
 */
export function summarizeLatency(receipt, bootstrap) {
  const rows = [];
  for (const [workload, group] of groupBy(receipt.samples, (s) => s.workload)) {
    const byCondition = groupBy(group, (s) => s.condition);
    const reference = byCondition.get(REFERENCE_CONDITION).map((s) => s.p50Ns);
    for (const [condition, samples] of byCondition) {
      const values = samples.map((s) => s.p50Ns);
      rows.push({
        workload,
        condition,
        processes: samples.length,
        p50Ns: bootstrapCi(values, bootstrap),
        ratioToDuplicated: bootstrapRatioCi(values, reference, bootstrap),
        exactReconstructions: samples.reduce((sum, s) => sum + s.exactReconstructions, 0),
        checkedReconstructions: samples.reduce((sum, s) => sum + s.checkedReconstructions, 0),
      });
    }
  }
  return { rows };
}

/**
 * @param {object} receipt measured RSS receipt
 * @param {{resamples: number, confidence: number, seed: number}} bootstrap
 */
export function summarizeRss(receipt, bootstrap) {
  const byCondition = groupBy(receipt.samples, (s) => s.condition);
  const reference = byCondition.get(REFERENCE_CONDITION).map((s) => s.rssDelta);
  const referenceHeap = byCondition.get(REFERENCE_CONDITION).map((s) => s.heapUsedDelta);
  const rows = [...byCondition].map(([condition, samples]) => {
    const rss = samples.map((s) => s.rssDelta);
    const ratio = bootstrapRatioCi(rss, reference, bootstrap);
    return {
      condition,
      n: samples.length,
      sessions: samples[0].sessions,
      rss: bootstrapCi(rss, bootstrap),
      heapMedianBytes: median(samples.map((s) => s.heapUsedDelta)),
      heapReduction: 1 - median(samples.map((s) => s.heapUsedDelta)) / median(referenceHeap),
      peakRssMedianBytes: median(samples.map((s) => s.peakRssBytes)),
      rssReduction: { estimate: 1 - ratio.estimate, low: 1 - ratio.high, high: 1 - ratio.low },
    };
  });
  return { rows };
}

/**
 * @param {object[]} receipts real-model lab receipts, one per model and backend
 * @param {{resamples: number, confidence: number, seed: number}} bootstrap
 */
/** Runs that passed. A `not_run` entry or a failed equivalence check is not evidence. */
export const completedRuns = (summary) => summary.llm.filter((run) => run.status === 'pass' && run.residency);

/**
 * One median per trial. Calls within a trial share a process and a moment, so a trial
 * is the most independent unit a single process offers.
 *
 * @param {readonly number[]} samples per-call samples, in trial order
 * @param {number} trials
 */
export function perTrialMedians(samples, trials) {
  const callsPerTrial = samples.length / trials;
  if (!Number.isInteger(callsPerTrial) || callsPerTrial < 1) {
    throw new RangeError(`${samples.length} samples do not divide into ${trials} trials`);
  }
  return Array.from({ length: trials }, (_, trial) => median(samples.slice(trial * callsPerTrial, (trial + 1) * callsPerTrial)));
}

export function summarizeLlm(receipts, bootstrap) {
  return receipts.map((r) => {
    if (r.status === 'not_run') return { status: 'not_run', reason: r.reason, run: r.run };
    const without = r.inference.withoutTinyFootprint;
    const withArm = r.inference.withTinyFootprint;
    const withoutCalls = perTrialMedians(without.prefillCallSamplesMs, r.workload.trials);
    const withCalls = perTrialMedians(withArm.prefillCallSamplesMs, r.workload.trials);
    const endToEnd = (arm) => arm.prefillBatchSamplesMs.map((prefill, i) => prefill + arm.decodeBatchSamplesMs[i]);
    const weightBytes = r.model.parameterCount * FLOAT32_BYTES;
    const residentReduction = (arm) => weightBytes + arm.logicalBytes;
    return {
      status: r.status,
      run: r.run,
      model: r.model,
      backend: r.backend,
      device: r.device,
      software: r.software,
      workload: r.workload,
      equivalence: r.equivalence,
      prefillCall: {
        withoutMs: bootstrapCi(withoutCalls, bootstrap),
        withMs: bootstrapCi(withCalls, bootstrap),
        speedup: bootstrapRatioCi(withoutCalls, withCalls, bootstrap),
      },
      prefillBatch: {
        withoutMs: bootstrapCi(without.prefillBatchSamplesMs, bootstrap),
        withMs: bootstrapCi(withArm.prefillBatchSamplesMs, bootstrap),
        speedup: bootstrapRatioCi(without.prefillBatchSamplesMs, withArm.prefillBatchSamplesMs, bootstrap),
      },
      decodeBatch: {
        withoutMs: bootstrapCi(without.decodeBatchSamplesMs, bootstrap),
        withMs: bootstrapCi(withArm.decodeBatchSamplesMs, bootstrap),
        speedup: bootstrapRatioCi(without.decodeBatchSamplesMs, withArm.decodeBatchSamplesMs, bootstrap),
      },
      endToEndBatch: {
        withoutMs: bootstrapCi(endToEnd(without), bootstrap),
        withMs: bootstrapCi(endToEnd(withArm), bootstrap),
        speedup: bootstrapRatioCi(endToEnd(without), endToEnd(withArm), bootstrap),
      },
      residency: r.residency,
      withWeights: {
        weightBytes,
        duplicatedBytes: residentReduction(r.residency.duplicated),
        sharedBytes: residentReduction(r.residency.shared),
        reduction: 1 - residentReduction(r.residency.shared) / residentReduction(r.residency.duplicated),
      },
      trainingSpeedup: r.training?.comparison?.stepP50Speedup ?? null,
      trainingSteps: r.workload.trainSteps,
    };
  });
}
