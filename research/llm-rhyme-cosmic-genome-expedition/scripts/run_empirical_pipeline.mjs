#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullExpedition } from '../src/experiments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const t0 = Date.now();
const report = runFullExpedition();
report.ms = Date.now() - t0;

writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2));

const lines = [];
lines.push('# LLM Rhyme Expedition · empirical report');
lines.push('');
lines.push(`**Document ID:** \`${report.documentId}\``);
lines.push(`**Seed:** ${report.seed}`);
lines.push(`**Runtime:** ${report.ms} ms`);
lines.push('');
lines.push('## Verdict');
lines.push('');
lines.push(report.summary.verdict);
lines.push('');
lines.push(
  `Positive signal: **${report.summary.positiveExpeditionSignal}** · H1 layers: ${(report.summary.h1Layers || []).join(', ') || '(none)'} · cosmic H1 ${report.summary.cosmicH1}/4 · genome H1 ${report.summary.genomeH1}/2`,
);
lines.push('');
lines.push(report.summary.note);
lines.push('');
lines.push('## Legend');
lines.push('');
lines.push(report.legend.oneLine);
lines.push('');
lines.push('## Cosmic language-pack rhyme');
lines.push('');
lines.push('| Layer | N | LINEAR | FLAT | AWARE | H1 | H2 |');
lines.push('|---|---:|---:|---:|---:|---|---|');
for (const r of Object.values(report.cosmic)) {
  lines.push(
    `| ${r.layer || r.domain} | ${r.nTasks} | ${(r.rates.linear * 100).toFixed(1)}% | ${(r.rates.flat * 100).toFixed(1)}% | **${(r.rates.aware * 100).toFixed(1)}%** | ${r.H1} | ${r.H2} |`,
  );
}
lines.push('');
lines.push('## Human genome exploration (language-pack rhyme)');
lines.push('');
lines.push('| Layer | N objects | N tasks | LINEAR | FLAT | AWARE | H1 | H2 | Lexical AWARE |');
lines.push('|---|---:|---:|---:|---:|---:|---|---|---:|');
for (const r of Object.values(report.genome)) {
  lines.push(
    `| ${r.layer} | ${r.nObjects} | ${r.nTasks} | ${(r.rates.linear * 100).toFixed(1)}% | ${(r.rates.flat * 100).toFixed(1)}% | **${(r.rates.aware * 100).toFixed(1)}%** | ${r.H1} | ${r.H2} | ${((r.lexicalBlind?.aware ?? 0) * 100).toFixed(1)}% |`,
  );
}
lines.push('');
lines.push('## Honesty');
lines.push('');
lines.push(
  'Application companion Soft Story — not ENGINE_SHELF, not frontier-LLM bake-off, not wet-lab genetics, not clinical advice. Cosmic fixtures: NASA Exoplanet Archive, JPL CAD, OpenNGC, WMAP TT. Genome fixtures: GTEx gene panel, MyGene exons, UCSC CpG islands, UCSC hs1 chrM. Pack-compliant reader by default.',
);
lines.push('');
lines.push('→ ∞^∞');

writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));
console.log(lines.join('\n'));
console.log('\nWrote', join(dataDir, 'empirical_report.json'));
