/**
 * Benchmark this machine. Every receipt written here describes this run on this
 * host. A lab that cannot run gets a `not_run` receipt; the kit's stored receipts
 * from other machines are never copied in or reported as this run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { aggregateHeapForReceipt } from '../../analysis/measured-summary.mjs';
import { describeHost, loadSample } from '../../benchmarks/host.mjs';
import { runHeapBenchmark } from '../../benchmarks/measured/heap.mjs';
import { loadPlan } from '../../benchmarks/plan.mjs';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE } from '../../experiments/constants.mjs';
import { runAllExperiments } from '../../experiments/suite.mjs';
import { LAB_STATUS } from '../../labs/lab-status.mjs';
import { renderSuiteReport } from '../../reporting/suite-report.mjs';

function writeJson(dir, name, value) {
  fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
}

export function benchmark(ctx) {
  const { log, reports, config } = ctx;
  log('benchmark · conventional vs Tiny, on this machine');
  fs.mkdirSync(reports, { recursive: true });
  if (config.forceLlmLabDefault && process.env.TINY_FOOTPRINT_FORCE_LLM_LAB == null) {
    process.env.TINY_FOOTPRINT_FORCE_LLM_LAB = '1';
  }

  const host = describeHost();
  const results = runAllExperiments();
  const report = {
    schema: 'tiny-footprint-customer-benchmark/v2',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    host,
    results,
  };
  writeJson(reports, 'empirical_report.json', report);
  fs.writeFileSync(path.join(reports, 'empirical_report.md'), renderSuiteReport(report));
  writeJson(reports, 'gpu_live_chat_hbm_lab.json', results.I.report);
  writeJson(reports, 'gpu_llm_real_lab.json', results.J.report);

  const { plan } = loadPlan();
  log('measuring real heap in isolated processes…');
  const load = { start: loadSample() };
  const samples = runHeapBenchmark(plan.measured.heap, plan.seeds, { quick: !ctx.flag('--full') });
  load.end = loadSample();
  writeJson(reports, 'heap_benchmark.json', {
    schema: 'tiny-footprint-heap/v1',
    host,
    load,
    summary: aggregateHeapForReceipt(samples),
    samples,
  });

  for (const key of ['I', 'J']) {
    const lab = results[key];
    if (lab.status === LAB_STATUS.NOT_RUN) log(`${lab.title}: not run here (${lab.report.reason})`);
  }
  log(`experiments: ${results.n_pass} pass · ${results.n_fail} fail · ${results.n_not_run} not run`);
  log(`aggregate representation reduction ${(results.H.aggregateRatio * 100).toFixed(1)}% (JSON bytes, not device memory)`);
  log(results.H.interpretation);
  log('Next: node scripts/tiny.mjs report');
  return results.n_fail > 0 ? 1 : 0;
}
