/**
 * The receipts recorded on the original GTX 860M laptop. They are evidence about
 * that machine on that date. This module reads them, binds them by hash, and checks
 * what can be reproduced without that machine. It never treats them as a current run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from '../core/canonical-json.mjs';

export const HISTORICAL_FILES = Object.freeze({
  suite: 'empirical_report.json',
  gpuLive: 'gpu_live_chat_hbm_lab.json',
  gpuLlm: 'gpu_llm_real_lab.json',
});

function load(dir, name) {
  const text = fs.readFileSync(path.join(dir, name), 'utf8');
  return { file: name, sha256: sha256(text), data: JSON.parse(text) };
}

const close = (a, b) => Math.abs(a - b) < 1e-12;

/**
 * @param {string} dir directory holding the historical receipts
 * @param {object} deterministic this run's deterministic results
 */
export function reconcileHistorical(dir, deterministic) {
  const suite = load(dir, HISTORICAL_FILES.suite);
  const gpuLive = load(dir, HISTORICAL_FILES.gpuLive);
  const gpuLlm = load(dir, HISTORICAL_FILES.gpuLlm);
  const old = suite.data.results;
  const workloads = deterministic.suite.workloads.map((w) => ({
    key: w.key,
    historicalRatio: old[w.key].ratio,
    currentRatio: w.ratio,
    reproduced: close(old[w.key].ratio, w.ratio),
  }));
  const derived = deterministic.gpuProxy.atAssumedFraction;
  const alloc = gpuLive.data.cuMemAlloc;
  const suiteAlloc = old.I.report.cuMemAlloc;
  const latency = gpuLive.data.latency;
  return {
    receipts: {
      suite: { file: suite.file, sha256: suite.sha256, generatedAt: suite.data.generatedAt },
      gpuLive: { file: gpuLive.file, sha256: gpuLive.sha256 },
      gpuLlm: { file: gpuLlm.file, sha256: gpuLlm.sha256 },
    },
    device: gpuLive.data.device,
    llmModel: gpuLlm.data.model,
    workloads,
    allWorkloadsReproduced: workloads.every((w) => w.reproduced),
    aggregate: {
      historicalRatio: old.H.aggregateRatio,
      currentRatio: deterministic.sensitivity.published.ratio,
      reproduced: close(old.H.aggregateRatio, deterministic.sensitivity.published.ratio),
    },
    gpuAllocation: {
      historicalReductionRatio: alloc.reductionRatio,
      suiteReductionRatio: suiteAlloc.reductionRatio,
      derivedReductionRatio: derived.reductionRatio,
      conventionalMib: alloc.conventionalMib,
      tinyMib: alloc.tinyMib,
      reproducedByArithmetic: close(alloc.reductionRatio, derived.reductionRatio),
    },
    gpuMeasured: {
      smiReductionRatio: gpuLive.data.nvidiaSmi.reductionRatio,
      smiConventionalPeakMib: gpuLive.data.nvidiaSmi.conventionalPeakMib,
      smiTinyPeakMib: gpuLive.data.nvidiaSmi.tinyPeakMib,
      turnSpeedup: latency.comparison.turnSpeedup,
      suiteTurnSpeedup: old.I.report.latency.comparison.turnSpeedup,
      turnP50MsWithout: latency.withoutTinyFootprint.turnMaterializeMs.p50Ms,
      turnP50MsWith: latency.withTinyFootprint.turnMaterializeMs.p50Ms,
      payloadRatio: latency.payloadBytesPerTurn.conventional / latency.payloadBytesPerTurn.tinyFootprint,
      trials: latency.trials,
    },
    realLlm: {
      prefillP50Speedup: gpuLlm.data.inference.comparison.prefillP50Speedup,
      generateP50Speedup: gpuLlm.data.inference.comparison.generateP50Speedup,
      trainStepP50Speedup: gpuLlm.data.training.comparison.stepP50Speedup,
      nvidiaSmiUsedMib: gpuLlm.data.inference.withTinyFootprint.nvidiaSmiUsedMib,
      trials: gpuLlm.data.workload.trials,
      trainSteps: gpuLlm.data.workload.trainSteps,
    },
  };
}
