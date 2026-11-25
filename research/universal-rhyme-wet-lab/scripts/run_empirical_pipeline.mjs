#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runUniversalRhymeWetLabSuite } from '../src/experiments.mjs';
import { WET_LAB_EVIDENCE_CHAIN } from '../../../src/engine/rhyming/universal-rhyme-wet-lab.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const report = runUniversalRhymeWetLabSuite();
writeFileSync(join(dataDir, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  `# Universal Rhyme Wet-Lab Proof — empirical report`,
  ``,
  `Document: \`${report.documentId}\``,
  `Registry: \`${report.registryId}\``,
  `Seed: \`${report.seed}\``,
  `ENGINE_SHELF: **#${report.engineShelfSlot}** pinned=\`${report.engineShelfPinned}\``,
  ``,
  `## Summary`,
  ``,
  `Pass **${report.passCount}/${report.total}** · suite \`${report.pass}\``,
  `ρ_WL = ${report.density.rho_R.toFixed(4)} (${report.density.usableCorrespondences}/${report.density.searchSpace})`,
  ``,
  `## Experiments`,
  ``,
];
for (const e of report.experiments) {
  lines.push(`- **${e.id}** ${e.title}: pass=\`${e.pass}\``);
}
lines.push('', '## Major-result shape', '', JSON.stringify(report.majorResultShape.measured, null, 2), '');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), `${lines.join('\n')}\n`);

const catalogMd = [
  `# Wet-Lab Evidence Chain (engine pin)`,
  ``,
  `Machine source: \`src/engine/rhyming/universal-rhyme-wet-lab.mjs\``,
  ``,
];
for (const e of WET_LAB_EVIDENCE_CHAIN) {
  catalogMd.push(`- **${e.id}** ${e.name} — ${e.venue}`);
}
catalogMd.push('');
writeFileSync(join(dataDir, 'WET_LAB_EVIDENCE_CHAIN.md'), `${catalogMd.join('\n')}\n`);

console.log(
  JSON.stringify(
    {
      pass: report.pass,
      passCount: report.passCount,
      total: report.total,
      rho_R: report.density.rho_R,
      engineShelf: report.engineShelfSlot,
    },
    null,
    2,
  ),
);
process.exitCode = report.pass ? 0 : 1;
