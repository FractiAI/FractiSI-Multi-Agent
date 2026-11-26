#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runNeuralXrayRhymeSuite } from '../src/experiments.mjs';
import { XRAY_STAGES, WIRING_SEQUENCE } from '../../../src/engine/rhyming/neural-xray-rhyme.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const report = runNeuralXrayRhymeSuite();
writeFileSync(join(dataDir, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  `# Neural X-Ray Rhyme — empirical report`,
  ``,
  `Document: \`${report.documentId}\``,
  `Registry: \`${report.registryId}\``,
  `Seed: \`${report.seed}\``,
  `ENGINE_SHELF: **#${report.engineShelfSlot}** pinned=\`${report.engineShelfPinned}\``,
  ``,
  `## Summary`,
  ``,
  `Pass **${report.passCount}/${report.total}** · suite \`${report.pass}\``,
  `Measured computational anchors: **${report.anchors.tier}**`,
  ``,
  `## Experiments`,
  ``,
];
for (const e of report.experiments) {
  lines.push(`- **${e.id}** ${e.title}: pass=\`${e.pass}\``);
}
lines.push('', '## Major-result shape', '', JSON.stringify(report.majorResultShape.measured, null, 2), '');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), `${lines.join('\n')}\n`);

const catalog = [
  `# Neural X-Ray stages + wiring sequence`,
  ``,
  `Machine source: \`src/engine/rhyming/neural-xray-rhyme.mjs\``,
  ``,
  `## Stages`,
  ``,
];
for (const s of XRAY_STAGES) catalog.push(`- **${s.id}** ${s.name} — ${s.body}`);
catalog.push('', '## Wiring sequence', '');
for (const w of WIRING_SEQUENCE) {
  catalog.push(`- **${w.id}** ${w.observation} → ${w.relationship} (${(w.nest || []).join(', ')})`);
}
catalog.push('');
writeFileSync(join(dataDir, 'XRAY_CATALOG.md'), `${catalog.join('\n')}\n`);

console.log(
  JSON.stringify(
    {
      pass: report.pass,
      passCount: report.passCount,
      total: report.total,
      engineShelf: report.engineShelfSlot,
      measuredTier: report.anchors.tier,
    },
    null,
    2,
  ),
);
process.exitCode = report.pass ? 0 : 1;
