#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGoldenNightSuite } from '../src/experiments.mjs';
import { REFERENCE_TRIALS_PER_STRATEGY } from '../../../src/engine/rhyming/golden-night-goldilocks-path.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const trials = Number(process.env.GN_TRIALS || REFERENCE_TRIALS_PER_STRATEGY);
const report = runGoldenNightSuite({ trials });
writeFileSync(join(dataDir, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  `# The Golden Night — empirical report`,
  ``,
  `Document: \`${report.documentId}\``,
  `Registry: \`${report.registryId}\``,
  `Series: ${report.series}`,
  `Seed: \`${report.seed}\``,
  `ENGINE_SHELF pinned: \`${report.engineShelfPinned}\``,
  `Trials per strategy: **${report.trialsPerStrategy}** · total **${report.totalTrials}**`,
  ``,
  `## Summary`,
  ``,
  `Pass **${report.passCount}/${report.total}** · suite \`${report.pass}\``,
  ``,
  `## Reference strategy table`,
  ``,
  `| Strategy | Mean coherence | 10th percentile | Critical failure | Risk-adjusted |`,
  `|---|---:|---:|---:|---:|`,
];
for (const r of report.reference.rows) {
  lines.push(
    `| ${r.label} | ${r.meanCoherence.toFixed(3)} | ${r.p10.toFixed(3)} | ${(100 * r.criticalFailureRate).toFixed(2)}% | ${r.riskAdjustedCoherence.toFixed(3)} |`,
  );
}
lines.push('', '## Experiments', '');
for (const e of report.experiments) {
  lines.push(`- **${e.id}** ${e.title}: pass=\`${e.pass}\` · tier=\`${e.tier}\``);
}
lines.push(
  '',
  '## Sensitivity',
  '',
  `Weakened Goldilocks RA=\`${report.sensitivity.goldilocks.riskAdjustedCoherence.toFixed(3)}\` · incremental RA=\`${report.sensitivity.incremental.riskAdjustedCoherence.toFixed(3)}\` · advantageLost=\`${report.sensitivity.advantageLost}\``,
  '',
  '## Honesty',
  '',
);
for (const d of report.doesNotProve) lines.push(`- ${d}`);
lines.push('');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), `${lines.join('\n')}\n`);

console.log(
  JSON.stringify(
    {
      pass: report.pass,
      passCount: report.passCount,
      total: report.total,
      documentId: report.documentId,
      trialsPerStrategy: report.trialsPerStrategy,
      goldilocksMean: report.reference.byId['goldilocks-path'].meanCoherence,
      goldilocksCritical: report.reference.byId['goldilocks-path'].criticalFailureRate,
      sensitivityRA: report.sensitivity.goldilocks.riskAdjustedCoherence,
    },
    null,
    2,
  ),
);
process.exitCode = report.pass ? 0 : 1;
