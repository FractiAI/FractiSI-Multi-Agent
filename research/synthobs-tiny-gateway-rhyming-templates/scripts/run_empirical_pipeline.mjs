#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  HONESTY,
  STANDALONE_REPO,
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');

function pct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

function mdReport(report) {
  const r = report.results;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| All pass | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass} / ${r.n_total} |`,
    `| Aggregate measured reduction | ${pct(r.H.aggregateRatio)} |`,
    `| Tiny Footprint GPU alloc reduction | ${r.I?.allocReduction != null ? pct(r.I.allocReduction) : 'n/a'} |`,
    `| Tiny Footprint nvidia-smi reduction | ${r.I?.smiReduction != null ? pct(r.I.smiReduction) : 'n/a'} |`,
    `| Concurrency density gain | ${r.I?.concurrencyDensityGain != null ? `${r.I.concurrencyDensityGain.toFixed(2)}×` : 'n/a'} |`,
    `| Turn latency p50 without Tiny Footprint | ${r.I?.turnP50MsWithout != null ? `${r.I.turnP50MsWithout.toFixed(2)} ms` : 'n/a'} |`,
    `| Turn latency p50 with Tiny Footprint | ${r.I?.turnP50MsWith != null ? `${r.I.turnP50MsWith.toFixed(2)} ms` : 'n/a'} |`,
    `| Turn latency speedup (Tiny / conventional) | ${r.I?.turnSpeedup != null ? `${r.I.turnSpeedup.toFixed(2)}×` : 'n/a'} |`,
    `| Real LLM prefill speedup (with vs without) | ${r.J?.prefillP50Speedup != null ? `${r.J.prefillP50Speedup.toFixed(2)}×` : 'n/a'} |`,
    `| Real LLM generate speedup | ${r.J?.generateP50Speedup != null ? `${r.J.generateP50Speedup.toFixed(2)}×` : 'n/a'} |`,
    `| Real LLM train-step speedup | ${r.J?.trainStepP50Speedup != null ? `${r.J.trainStepP50Speedup.toFixed(2)}×` : 'n/a'} |`,
    `| Engine pin recommended | \`${r.enginePinRecommended}\` (#${ENGINE_SHELF_SLOT}) |`,
    '',
    '## Workload reductions',
    '',
    `| Exp | Reduction | Pass |`,
    `|-----|----------:|:----:|`,
    `| B structured | ${pct(r.B.ratio)} | ${r.B.pass} |`,
    `| C cross-linked | ${pct(r.C.ratio)} | ${r.C.pass} |`,
    `| D eight-node | ${pct(r.D.ratio)} | ${r.D.pass} |`,
    `| E cross-octave | ${pct(r.E.ratio)} | ${r.E.pass} |`,
    `| F AI context proxy | ${pct(r.F.ratio)} | ${r.F.pass} |`,
    `| I Tiny Footprint GPU live stack | alloc ${r.I?.allocReduction != null ? pct(r.I.allocReduction) : 'n/a'} · smi ${r.I?.smiReduction != null ? pct(r.I.smiReduction) : 'n/a'} | ${r.I?.pass} |`,
    `| Aggregate B–F | ${pct(r.H.aggregateRatio)} | pin=${r.enginePinRecommended} |`,
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

async function main() {
  console.log(`[tiny-gateway-rhyming] ${STUDY_TITLE}`);
  if (process.env.TINY_FOOTPRINT_FORCE_LLM_LAB == null) {
    process.env.TINY_FOOTPRINT_FORCE_LLM_LAB = '1';
  }
  const results = runAllExperiments();
  const report = {
    schema: 'synthobs-tiny-gateway-rhyming-templates/v1',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(RESULTS, 'manifest.json'),
    JSON.stringify(
      {
        ok: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        aggregateReduction: results.H.aggregateRatio,
        enginePinRecommended: results.enginePinRecommended,
        engineShelfSlot: ENGINE_SHELF_SLOT,
      },
      null,
      2,
    ),
  );
  console.log(`[tiny-gateway-rhyming] pass ${results.n_pass}/${results.n_total}`);
  console.log(
    `[tiny-gateway-rhyming] aggregate reduction ${(results.H.aggregateRatio * 100).toFixed(1)}% pin=${results.enginePinRecommended}`,
  );
  for (const k of ['B', 'C', 'D', 'E', 'F']) {
    console.log(`  ${k}: ${(results[k].ratio * 100).toFixed(1)}%`);
  }
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
