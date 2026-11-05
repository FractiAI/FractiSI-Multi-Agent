/** Design of the heap benchmark: workloads x conditions x session counts x trials. */
import { runDesign } from './child-runner.mjs';

/**
 * @param {object} heapPlan plan.measured.heap
 * @param {object} seeds plan.seeds
 * @param {{quick?: boolean, onProgress?: Function}} [options]
 */
export function heapDesign(heapPlan, seeds, { quick = false } = {}) {
  const sessions = quick ? heapPlan.quickSessions : heapPlan.sessions;
  const trials = quick ? heapPlan.quickTrials : heapPlan.trials;
  const specs = [];
  for (const [workload, config] of Object.entries(heapPlan.workloads)) {
    for (const condition of config.conditions) {
      for (const n of sessions) {
        for (let trial = 0; trial < trials; trial++) {
          specs.push({
            kind: 'heap',
            workload,
            condition,
            sessions: n,
            trial,
            seed: seeds.primary,
            ...(config.turns ? { turns: config.turns } : {}),
          });
        }
      }
    }
  }
  for (const control of heapPlan.controls ?? []) {
    for (let trial = 0; trial < trials; trial++) specs.push({ kind: 'control', ...control, trial });
  }
  return specs;
}

export function runHeapBenchmark(heapPlan, seeds, options = {}) {
  return runDesign(heapDesign(heapPlan, seeds, options), seeds.orderShuffle, options.onProgress);
}
