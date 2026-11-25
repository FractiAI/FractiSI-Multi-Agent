#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCompositionalWetLabScaleSuite } from '../src/experiments.mjs';
import { COMPOSITIONAL_CHAIN } from '../../../src/engine/rhyming/compositional-wet-lab-scale.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const report = runCompositionalWetLabScaleSuite();
writeFileSync(join(dataDir, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  `# Compositional Wet-Lab Scale Proof — empirical report`,
  ``,
  `Document: \`${report.documentId}\``,
  `Registry: \`${report.registryId}\``,
  `Seed: \`${report.seed}\``,
  `ENGINE_SHELF: **#${report.engineShelfSlot}** pinned=\`${report.engineShelfPinned}\``,
  ``,
  `## Summary`,
  ``,
  `Pass **${report.passCount}/${report.total}** · suite \`${report.pass}\``,
  `ρ_CC = ${report.density.rho_R.toFixed(4)} (${report.density.usableCorrespondences}/${report.density.searchSpace})`,
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
  `# Compositional Chain (engine pin)`,
  ``,
  `Machine source: \`src/engine/rhyming/compositional-wet-lab-scale.mjs\``,
  ``,
];
for (const e of COMPOSITIONAL_CHAIN) {
  catalogMd.push(
    `- **${e.id}** ${e.name} — ${e.claim}${e.preprint ? ' *(preprint)*' : ''}`,
  );
}
catalogMd.push('');
writeFileSync(join(dataDir, 'COMPOSITIONAL_CHAIN.md'), `${catalogMd.join('\n')}\n`);

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
