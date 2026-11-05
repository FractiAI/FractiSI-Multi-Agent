/**
 * Stage bodies behind the benchmark scripts: run a tier and write its receipts.
 * Deterministic receipts carry no clock or host, so they are byte-stable. Measured
 * receipts carry both, plus a fingerprint of the code that produced them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify } from '../core/canonical-json.mjs';
import { PATHS, repoPath } from '../core/paths.mjs';
import { runGpuLiveChatLab } from '../labs/gpu-live-lab.mjs';
import { compressionReference, runDeterministicBenchmarks } from './deterministic/index.mjs';
import { sourceFingerprint } from './fingerprint.mjs';
import { describeHost, loadSample } from './host.mjs';
import { heapIsolationFlags } from './measured/child-runner.mjs';
import { runHeapBenchmark } from './measured/heap.mjs';
import { runLatencyBenchmark } from './measured/latency.mjs';
import { runRssBenchmark } from './measured/rss.mjs';

/** The project environment's interpreter when present, so the lab can import its package. */
function sys_python() {
  const candidate = repoPath('.venv', 'bin', 'python');
  return fs.existsSync(candidate) ? candidate : undefined;
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, canonicalStringify(value));
  return file;
}

/**
 * @param {object} plan
 * @param {string} planSha256
 * @param {string} [dataDir]
 */
export function writeDeterministicReceipts(plan, planSha256, dataDir = PATHS.outputData) {
  const dir = path.join(dataDir, 'deterministic');
  return [
    write(path.join(dir, 'results.json'), {
      schema: 'tiny-footprint-deterministic/v1',
      planSha256,
      sourceFingerprint: sourceFingerprint(),
      ...runDeterministicBenchmarks(plan),
    }),
    write(path.join(dir, 'compression.json'), {
      schema: 'tiny-footprint-compression-reference/v1',
      ...compressionReference({ seed: plan.seeds.primary }),
    }),
  ];
}

/**
 * @param {object} plan
 * @param {string} planSha256
 * @param {{dataDir?: string, onProgress?: (label: string, done: number, total: number) => void}} [options]
 */
export function writeMeasuredReceipts(plan, planSha256, { dataDir = PATHS.outputData, onProgress } = {}) {
  const dir = path.join(dataDir, 'measured');
  const host = describeHost();
  const measure = (label, run) => {
    const start = loadSample();
    const samples = run({ onProgress: (done, total) => onProgress?.(label, done, total) });
    return {
      schema: `tiny-footprint-${label}/v1`,
      planSha256,
      sourceFingerprint: sourceFingerprint(),
      host,
      load: { start, end: loadSample() },
      samples,
    };
  };
  const heap = {
    ...measure('heap', (options) => runHeapBenchmark(plan.measured.heap, plan.seeds, options)),
    childFlags: heapIsolationFlags(),
  };
  const latency = measure('latency', (options) => runLatencyBenchmark(plan.measured.latency, plan.seeds, options));
  const rss = measure('rss', (options) => runRssBenchmark(plan.measured.rss, plan.seeds, options));
  return [
    write(path.join(dir, 'heap.json'), heap),
    write(path.join(dir, 'latency.json'), latency),
    write(path.join(dir, 'rss.json'), rss),
    // Attempted on every host; a host without the runtime records `not_run`, not a borrowed result.
    write(path.join(dir, 'gpu_live.json'), {
      ...runGpuLiveChatLab({ python: process.env.TINY_FOOTPRINT_PYTHON ?? sys_python() }),
      planSha256,
      sourceFingerprint: sourceFingerprint(),
    }),
  ];
}
