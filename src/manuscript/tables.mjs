/** Result tables for the manuscript and generated docs, rendered from the summary. */
import { completedRuns } from '../analysis/measured-summary.mjs';
import { fixed2, int, interval, kib, mib, ms, pct, times, us } from '../core/format.mjs';

const CONDITION_LABEL = Object.freeze({
  duplicated: 'Duplicated',
  aliased: 'Aliased',
  tiny: 'Tiny (shipped)',
  tiny_compact: 'Tiny compact',
  tiny_noclone: 'Tiny without clone',
  exact_cache: 'Exact-text cache',
});
const WORKLOAD_LABEL = Object.freeze({
  ai_context: 'Shared prompt',
  rhyme_differing: 'Same shape',
  rhyme_identical: 'Identical',
});

/**
 * A pipe table. Pandoc reads relative column widths from the dash counts when a row
 * is long, so each column states its width and its alignment.
 *
 * @param {Array<[title: string, width: number, align?: 'left'|'right']>} columns
 * @param {string[][]} rows
 */
function table(columns, rows) {
  const line = (cells) => `| ${cells.join(' | ')} |`;
  const rule = columns.map(([, width, align]) => (align === 'right' ? `${'-'.repeat(width - 1)}:` : '-'.repeat(width)));
  return [line(columns.map(([title]) => title)), line(rule), ...rows.map(line)].join('\n');
}

export function workloadsTable(summary) {
  const exactness = summary.deterministic.exactness;
  const gzip = new Map(summary.compression.workloads.map((w) => [w.key, w.gzipReduction]));
  return table(
    [['Workload', 28], ['Conventional bytes', 14, 'right'], ['Tiny bytes', 11, 'right'], ['Reduction', 10, 'right'], ['gzip', 8, 'right'], ['Round trip', 29]],
    summary.deterministic.suite.workloads.map((w) => [
      `${w.key}: ${w.label}`,
      int(w.baselineBytes),
      int(w.tinyBytes),
      pct(w.ratio),
      gzip.has(w.key) ? pct(gzip.get(w.key)) : 'n/a',
      exactness[w.key].lossless
        ? `${int(exactness[w.key].matched)} of ${int(exactness[w.key].checked)} exact`
        : `not lossless: holds ${int(exactness[w.key].matched)} of ${int(exactness[w.key].checked)}`,
    ]),
  );
}

export function heapTable(summary) {
  const largest = Math.max(...summary.heap.rows.map((r) => r.sessions));
  const rows = summary.heap.rows
    .filter((r) => r.sessions === largest)
    .sort((a, b) => a.workload.localeCompare(b.workload) || a.heap.estimate - b.heap.estimate);
  return table(
    [['Workload', 16], ['Store', 20], ['JSON bytes', 12, 'right'], ['Heap', 12, 'right'], ['JSON reduction', 20, 'right'], ['Heap reduction', 20, 'right']],
    rows.map((r) => [
      WORKLOAD_LABEL[r.workload],
      CONDITION_LABEL[r.condition],
      kib(r.representationBytes),
      kib(r.heap.estimate),
      pct(r.jsonReduction),
      pct(r.heapReduction.estimate),
    ]),
  );
}

export function rssTable(summary) {
  return table(
    [['Store', 19], ['RSS growth', 13, 'right'], ['95% interval', 27], ['RSS reduction', 20, 'right'], ['Heap reduction', 20, 'right']],
    [...summary.rss.rows].sort((a, b) => b.rss.estimate - a.rss.estimate).map((r) => [
      CONDITION_LABEL[r.condition],
      mib(r.rss.estimate),
      interval(r.rss.low, r.rss.high, mib),
      pct(r.rssReduction.estimate),
      pct(r.heapReduction),
    ]),
  );
}

export function latencyTable(summary) {
  return table(
    [['Workload', 16], ['Store', 20], ['Median', 10, 'right'], ['95% interval', 20], ['Ratio', 9, 'right'], ['95% interval', 17]],
    [...summary.latency.rows]
      .sort((a, b) => a.workload.localeCompare(b.workload) || a.p50Ns.estimate - b.p50Ns.estimate)
      .map((r) => [
        WORKLOAD_LABEL[r.workload],
        CONDITION_LABEL[r.condition],
        us(r.p50Ns.estimate),
        interval(r.p50Ns.low, r.p50Ns.high, us),
        times(r.ratioToDuplicated.estimate),
        interval(r.ratioToDuplicated.low, r.ratioToDuplicated.high, times),
      ]),
  );
}

export function llmTable(summary) {
  const runs = completedRuns(summary);
  return table(
    [['Model', 13], ['Backend', 9], ['Re-prefill', 12, 'right'], ['Shared', 11, 'right'], ['Prefill', 9, 'right'], ['Decode', 9, 'right'], ['Both', 8, 'right'], ['Tokens equal', 14, 'right'], ['Control', 11, 'right']],
    runs.map((r) => [
      r.model.id.split('/').pop(),
      r.backend.toUpperCase(),
      ms(r.prefillCall.withoutMs.estimate),
      ms(r.prefillCall.withMs.estimate),
      times(r.prefillCall.speedup.estimate),
      times(r.decodeBatch.speedup.estimate),
      times(r.endToEndBatch.speedup.estimate),
      `${r.equivalence.tokenSequencesEqual} of ${r.equivalence.turns}`,
      r.equivalence.control?.detected ? 'caught' : 'missed',
    ]),
  );
}

export function residencyTable(summary) {
  const runs = completedRuns(summary);
  const device = (value) => (value == null ? 'n/a' : mib(value));
  return table(
    [['Model', 13], ['Backend', 10], ['Predicted', 12, 'right'], ['Tensors', 11, 'right'], ['Allocator', 12, 'right'], ['Duplicated', 14, 'right'], ['Shared', 12, 'right'], ['+ weights', 12, 'right']],
    runs.map((r) => [
      r.model.id.split('/').pop(),
      r.backend.toUpperCase(),
      pct(r.residency.reduction.predicted),
      pct(r.residency.reduction.logical),
      r.residency.reduction.device == null ? 'n/a' : pct(r.residency.reduction.device),
      device(r.residency.duplicated.deviceAllocatedBytes ?? r.residency.duplicated.logicalBytes),
      device(r.residency.shared.deviceAllocatedBytes ?? r.residency.shared.logicalBytes),
      pct(r.withWeights.reduction),
    ]),
  );
}

export function gpuSweepTable(summary) {
  return table(
    [['Assumed delta', 16, 'right'], ['Tiny allocation', 18, 'right'], ['Reduction', 14, 'right']],
    summary.deterministic.gpuProxy.sweep.map((p) => [pct(p.deltaFraction), `${fixed2(p.tinyMib)} MiB`, pct(p.reductionRatio)]),
  );
}

export function claimsTable(summary) {
  return table(
    [['Claim', 30], ['Evidence', 52], ['Status', 18]],
    summary.claims.map((c) => [c.claim, c.evidence, c.status]),
  );
}
