/**
 * The single source of truth downstream of the receipts. Figures, manuscript tokens
 * and generated documentation all read this object, so one value cannot be stated
 * two ways.
 */
import fs from 'node:fs';
import path from 'node:path';
import { llmRunSlug } from '../benchmarks/plan.mjs';
import { sha256File } from '../core/canonical-json.mjs';
import { PATHS, REPO_ROOT } from '../core/paths.mjs';
import { LAB_STATUS } from '../labs/lab-status.mjs';
import { reconcileHistorical } from './historical.mjs';
import { evaluateClaims } from './claims.mjs';
import { summarizeHeap, summarizeLatency, summarizeLlm, summarizeRss } from './measured-summary.mjs';

/** @param {string} file absolute path */
function readRequired(file) {
  if (!fs.existsSync(file)) throw new Error(`missing evidence: ${path.relative(REPO_ROOT, file)}. Run the pipeline stage that writes it.`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function evidencePaths(dataDir = PATHS.outputData) {
  return {
    deterministic: path.join(dataDir, 'deterministic', 'results.json'),
    compression: path.join(dataDir, 'deterministic', 'compression.json'),
    h100: path.join(dataDir, 'simulation', 'h100_prefix_cache_sim.json'),
    heap: path.join(dataDir, 'measured', 'heap.json'),
    latency: path.join(dataDir, 'measured', 'latency.json'),
    rss: path.join(dataDir, 'measured', 'rss.json'),
    gpuLive: path.join(dataDir, 'measured', 'gpu_live.json'),
    suiteRun: path.join(dataDir, 'suite', 'manifest.json'),
    llmDir: path.join(dataDir, 'measured', 'llm'),
  };
}

/** One entry per planned run. A leftover file from another plan is not evidence, and a missing one is stated. */
function loadLlmReceipts(dir, plan) {
  return plan.llm.runs.map(llmRunSlug).sort().map((run) => {
    const file = path.join(dir, `${run}.json`);
    if (!fs.existsSync(file)) return { status: LAB_STATUS.NOT_RUN, reason: 'no_receipt', run };
    return { ...JSON.parse(fs.readFileSync(file, 'utf8')), run };
  });
}

/**
 * @param {object} plan validated benchmark plan
 * @param {{dataDir?: string, historicalDir?: string}} [options]
 */
export function buildAnalysisSummary(plan, { dataDir = PATHS.outputData, historicalDir = PATHS.historicalReceipts } = {}) {
  const paths = evidencePaths(dataDir);
  const deterministic = readRequired(paths.deterministic);
  const compression = readRequired(paths.compression);
  const h100 = readRequired(paths.h100);
  const heap = readRequired(paths.heap);
  const latency = readRequired(paths.latency);
  const rss = readRequired(paths.rss);
  const gpuLive = readRequired(paths.gpuLive);
  const suiteRun = readRequired(paths.suiteRun);
  const llm = loadLlmReceipts(paths.llmDir, plan);
  const bootstrap = {
    resamples: plan.measured.bootstrap.resamples,
    confidence: plan.measured.bootstrap.confidence,
    seed: plan.seeds.bootstrap,
  };
  const evidence = Object.fromEntries(
    Object.entries(paths)
      .filter(([key]) => key !== 'llmDir')
      .map(([key, file]) => [key, { file: path.relative(REPO_ROOT, file), sha256: sha256File(file) }]),
  );
  const summary = {
    schema: 'tiny-footprint-analysis-summary/v1',
    evidence,
    seeds: plan.seeds,
    bootstrap,
    target: plan.deterministic.target,
    deterministic,
    compression,
    h100,
    heap: { host: heap.host, load: heap.load, sourceFingerprint: heap.sourceFingerprint, childFlags: heap.childFlags, ...summarizeHeap(heap, bootstrap) },
    latency: { host: latency.host, load: latency.load, sourceFingerprint: latency.sourceFingerprint, ...summarizeLatency(latency, bootstrap) },
    rss: { host: rss.host, load: rss.load, ...summarizeRss(rss, bootstrap) },
    gpuLive,
    suiteRun,
    llm: summarizeLlm(llm, bootstrap),
    historical: reconcileHistorical(historicalDir, deterministic),
  };
  return { ...summary, claims: evaluateClaims(summary) };
}
