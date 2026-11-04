/** Design of the latency benchmark: workloads x conditions x independent processes. */
import { runDesign } from './child-runner.mjs';

/**
 * @param {object} latencyPlan plan.measured.latency
 * @param {object} seeds plan.seeds
 */
export function latencyDesign(latencyPlan, seeds) {
  const specs = [];
  for (const [workload, config] of Object.entries(latencyPlan.workloads)) {
    for (const condition of config.conditions) {
      for (let process = 0; process < latencyPlan.processes; process++) {
        specs.push({
          kind: 'latency',
          workload,
          condition,
          process,
          sessions: latencyPlan.sessions,
          warmupOps: latencyPlan.warmupOps,
          measuredOps: latencyPlan.measuredOps,
          batch: latencyPlan.batch,
          seed: seeds.primary,
          ...(config.turns ? { turns: config.turns } : {}),
        });
      }
    }
  }
  return specs;
}

export function runLatencyBenchmark(latencyPlan, seeds, options = {}) {
  return runDesign(latencyDesign(latencyPlan, seeds), seeds.orderShuffle + 1, options.onProgress);
}
