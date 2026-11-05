/** The human-readable suite report written beside each machine's receipts. */
import { DIGITAL_SEED, DOC_ID, ENGINE_SHELF_SLOT, HONESTY, REGISTRY_ID, STANDALONE_REPO, STUDY_TITLE } from '../experiments/constants.mjs';

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const orNotRun = (lab, value) => (lab?.status === 'pass' ? value() : lab?.status ?? 'n/a');

/** @param {{generatedAt: string, host?: object, results: object}} report */
export function renderSuiteReport(report) {
  const r = report.results;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    ...(report.host ? [`**Host:** ${report.host.cpuModel} · ${report.host.platform} ${report.host.arch} · Node ${report.host.node}`] : []),
    '',
    '## Verdict',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| Verdict | \`${r.verdict}\` |`,
    `| Experiments | ${r.n_pass} pass · ${r.n_fail} fail · ${r.n_not_run} not run · ${r.n_total} total |`,
    `| Aggregate measured reduction (JSON bytes) | ${pct(r.H.aggregateRatio)} |`,
    `| GPU allocation reduction | ${orNotRun(r.I, () => pct(r.I.allocReduction))} |`,
    `| nvidia-smi reduction | ${orNotRun(r.I, () => (r.I.smiReduction != null ? pct(r.I.smiReduction) : 'n/a'))} |`,
    `| Real-model prefill speedup | ${orNotRun(r.J, () => `${r.J.prefillP50Speedup?.toFixed(2)}×`)} |`,
    `| Engine pin recommended | \`${r.enginePinRecommended}\` (#${ENGINE_SHELF_SLOT}) |`,
    '',
    r.H.interpretation,
    '',
    '## Workload reductions',
    '',
    '| Exp | Reduction | Pass |',
    '|-----|----------:|:----:|',
    `| B structured | ${pct(r.B.ratio)} | ${r.B.pass} |`,
    `| C cross-linked | ${pct(r.C.ratio)} | ${r.C.pass} |`,
    `| D eight-node | ${pct(r.D.ratio)} | ${r.D.pass} |`,
    `| E cross-octave | ${pct(r.E.ratio)} | ${r.E.pass} |`,
    `| F AI context proxy | ${pct(r.F.ratio)} | ${r.F.pass} |`,
    `| Aggregate B–F | ${pct(r.H.aggregateRatio)} | pin=${r.enginePinRecommended} |`,
    '',
    '## Companion meters (not in the engine pin)',
    '',
    '| Experiment | Meter | Pass |',
    '|------------|-------|-----:|',
    `| K dynamic route | bucket compares ${r.K.bucketCompares} vs linear ${r.K.linearCompares} | ${r.K.pass} |`,
    `| L context-fold hooks | foldRatio ${pct(r.L.foldRatio)} · levels ${r.L.levels} | ${r.L.pass} |`,
    `| M energy-proxy scale | depth ${r.M.baselineDepth} → ${r.M.scaledDepth} · PROXY | ${r.M.pass} |`,
    '',
    '## Honesty',
    '',
    HONESTY,
    '',
    `Standalone: ${STANDALONE_REPO}`,
    '',
    '→ ∞^∞',
    '',
  ];
  return lines.join('\n');
}
