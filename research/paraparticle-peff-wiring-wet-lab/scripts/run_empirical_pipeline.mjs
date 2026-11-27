#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runParaparticlePeffSuite } from '../src/experiments.mjs';
import { PEFF_WIRING_CHAIN } from '../../../src/engine/rhyming/paraparticle-peff-wiring-wet-lab.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const report = runParaparticlePeffSuite();
writeFileSync(join(dataDir, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  `# Paraparticle–PEFF Cross-Scale Rhyme — empirical report`,
  ``,
  `Document: \`${report.documentId}\``,
  `Registry: \`${report.registryId}\``,
  `Series: ${report.series}`,
  `Seed: \`${report.seed}\``,
  `ENGINE_SHELF pinned: \`${report.engineShelfPinned}\``,
  ``,
  `## Summary`,
  ``,
  `Pass **${report.passCount}/${report.total}** · suite \`${report.pass}\``,
  ``,
  `## Experiments`,
  ``,
];
for (const e of report.experiments) {
  lines.push(`- **${e.id}** ${e.title}: pass=\`${e.pass}\` · tier=\`${e.tier}\``);
}
lines.push('', '## Working form', '', JSON.stringify(report.workingForm, null, 2), '');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), `${lines.join('\n')}\n`);

const catalogMd = [
  `# PEFF Wiring Wet Lab Evidence Chain`,
  ``,
  `Machine source: \`src/engine/rhyming/paraparticle-peff-wiring-wet-lab.mjs\``,
  ``,
];
for (const e of PEFF_WIRING_CHAIN) {
  catalogMd.push(`- **${e.id}** ${e.name} — demonstrated=\`${e.demonstrated}\` · compatibility=\`${e.compatibility}\``);
}
catalogMd.push('');
writeFileSync(join(dataDir, 'WIRING_EVIDENCE_CHAIN.md'), `${catalogMd.join('\n')}\n`);

console.log(
  JSON.stringify(
    {
      pass: report.pass,
      passCount: report.passCount,
      total: report.total,
      documentId: report.documentId,
    },
    null,
    2,
  ),
);
process.exitCode = report.pass ? 0 : 1;
