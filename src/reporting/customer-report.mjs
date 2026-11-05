/**
 * The customer HTML report. It states only what this machine's latest benchmark
 * produced, and says "not run here" for a lab that did not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml } from '../core/html.mjs';

const percent = (value) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : 'n/a');
const times = (value) => (typeof value === 'number' ? `${value.toFixed(2)}×` : 'n/a');
const kib = (bytes) => (typeof bytes === 'number' ? `${(bytes / 1024).toFixed(1)} KiB` : 'n/a');

function readEvidence(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Row label and value for an optional lab, from this run's report only. */
function labRows(label, lab, rows) {
  if (!lab) return [[label, 'no benchmark yet']];
  if (lab.status !== 'pass') return [[label, `not run here (${lab.status === 'not_run' ? lab.reason : lab.error ?? 'failed'})`]];
  return rows;
}

function heapRows(heap) {
  if (!heap?.summary) return [['Real heap per workload', 'no benchmark yet']];
  return heap.summary.map((row) => [
    `Real V8 heap, ${row.workload}, ${row.sessions} sessions`,
    `duplicated ${kib(row.duplicatedMedian)} · aliased ${kib(row.aliasedMedian)} · tiny ${kib(row.tinyMedian)}`,
  ]);
}

/**
 * @param {object} options
 * @param {string} options.reportsDir
 * @param {ReturnType<import('../core/config.mjs').loadProductConfig>} options.config
 * @param {string} [options.generatedAt]
 */
export function renderCustomerReport({ reportsDir, config, generatedAt = new Date().toISOString() }) {
  const empirical = readEvidence(path.join(reportsDir, 'empirical_report.json'));
  const heap = readEvidence(path.join(reportsDir, 'heap_benchmark.json'));
  const results = empirical?.results;
  const llm = results?.J?.report;
  const gpu = results?.I?.report;
  const rows = [
    ['Suite verdict', results?.verdict ?? 'no benchmark yet'],
    ['Experiments', results ? `${results.n_pass} pass · ${results.n_fail} fail · ${results.n_not_run} not run` : 'n/a'],
    ['Aggregate representation gate (JSON bytes, not device memory)', percent(results?.H?.aggregateRatio)],
    ...heapRows(heap),
    ...labRows('GPU allocation lab', gpu, [
      ['GPU allocation reduction', percent(gpu?.cuMemAlloc?.reductionRatio)],
      ['GPU device', gpu?.device ?? 'n/a'],
    ]),
    ...labRows('Real-model lab', llm, [
      ['Real-model prefill speedup', times(llm?.inference?.comparison?.prefillP50Speedup)],
      ['Real-model decode speedup', times(llm?.inference?.comparison?.decodeP50Speedup)],
      ['Real-model device', llm?.device ?? 'n/a'],
    ]),
    ['Host', empirical?.host ? `${empirical.host.cpuModel} · ${empirical.host.platform} ${empirical.host.arch}` : 'n/a'],
  ];
  const honesty = [];
  if (config.honesty.localGpuNotHbm) honesty.push('Local GPU results are not datacenter HBM silicon identity.');
  if (config.honesty.notHostedFrontierBakeoff) honesty.push('Not a hosted frontier-vendor bake-off.');
  const honestyText = honesty.join(' ') || 'Local results only; validate on your own workload.';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(config.product)} · Customer Benchmark</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
h1{font-size:1.6rem}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left}
.muted{color:#555;font-size:.9rem}</style></head><body>
<h1>${escapeHtml(config.product)} — Customer Benchmark</h1>
<p class="muted">${escapeHtml(config.headline)} · Generated ${escapeHtml(generatedAt)} · Workstation ${escapeHtml(config.version)}</p>
<table>
<tr><th>Metric</th><th>Value</th></tr>
${rows.map(([metric, value]) => `<tr><td>${escapeHtml(metric)}</td><td>${escapeHtml(value)}</td></tr>`).join('\n')}
</table>
<p class="muted">Every value above comes from this machine's latest benchmark. Labs that could not run here say so. JSON bytes are a representation size; the heap rows are measured in a live process.</p>
<p class="muted">${escapeHtml(honestyText)}</p>
<p class="muted">Raw receipts in benchmarks/reports/. Share: node scripts/tiny.mjs share</p>
</body></html>`;
}

/** @param {Parameters<typeof renderCustomerReport>[0]} options */
export function writeCustomerReport(options) {
  fs.mkdirSync(options.reportsDir, { recursive: true });
  const out = path.join(options.reportsDir, 'customer-benchmark.html');
  fs.writeFileSync(out, renderCustomerReport(options), 'utf8');
  return out;
}
