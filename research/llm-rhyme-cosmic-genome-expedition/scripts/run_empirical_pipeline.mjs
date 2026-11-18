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
writeFileSync(
  join(dataDir, 'DISCOVERY_CATALOG.json'),
  JSON.stringify(report.discoveryCatalog, null, 2),
);

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
  `Positive signal: **${report.summary.positiveExpeditionSignal}** · H1 layers: ${(report.summary.h1Layers || []).join(', ') || '(none)'} · cosmic H1 ${report.summary.cosmicH1}/4 · genome H1 ${report.summary.genomeH1}/2 · listed discoveries: **${report.summary.nListedDiscoveries}**`,
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
lines.push('## Discovery catalog (named findings — not pass rates alone)');
lines.push('');
lines.push(
  'AWARE boards surface concrete partners and couplings that LINEAR/FLAT miss. Listed below by theater.',
);
lines.push('');
for (const theater of report.discoveryCatalog.theaters) {
  const d = theater.discoveries;
  if (!d) continue;
  lines.push(`### ${theater.theater}`);
  lines.push('');
  lines.push(
    `AWARE-only recoveries: **${d.nAwareOnlyRecoveries ?? 0}** / ${theater.nTasks} tasks`,
  );
  lines.push('');
  if (d.awarenessOnlyPairs?.length) {
    lines.push('AWARE-only partner discoveries:');
    for (const p of d.awarenessOnlyPairs.slice(0, 8)) {
      lines.push(
        `- \`${p.id}\` · coupling ${p.maxCoupling ?? p.coupling}${p.bestLag != null ? ` · lag ${p.bestLag}` : ''}`,
      );
    }
    lines.push('');
  }
  if (d.topBoardCouplings?.length) {
    lines.push('Top awareness-board couplings:');
    for (const c of d.topBoardCouplings.slice(0, 8)) {
      lines.push(
        `- \`${c.id}\` · max coupling ${c.maxCoupling} · board appearances ${c.nBoardAppearances}`,
      );
    }
    lines.push('');
  }
  if (d.topSpectralLags?.length) {
    lines.push('Top spectral lags on AWARE board:');
    for (const c of d.topSpectralLags.slice(0, 8)) {
      lines.push(`- \`${c.id}\` · |corr|=${c.absCorr}`);
    }
    lines.push('');
  }
}
lines.push('Full machine catalog: `data/DISCOVERY_CATALOG.json`.');
lines.push('');
lines.push('## Honesty');
lines.push('');
lines.push(
  'Application companion Soft Story — discoveries are named AWARE-only partners and board couplings on public fixtures, not finished physics/biology laws and not a frontier-LLM bake-off. Cosmic fixtures: NASA Exoplanet Archive, JPL CAD, OpenNGC, WMAP TT. Genome fixtures: GTEx gene panel, MyGene exons, UCSC CpG islands, UCSC hs1 chrM. Pack-compliant reader by default.',
);
lines.push('');
lines.push('→ ∞^∞');

writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));

const catLines = [];
catLines.push('# LLM Rhyme · Discovery Catalog');
catLines.push('');
catLines.push(`**Document ID:** \`${report.documentId}\` · **Seed:** ${report.seed}`);
catLines.push('');
catLines.push(
  'Named discoveries from AWARE language packs across cosmic and genome theaters. Pass rates alone are not the product — these rows are.',
);
catLines.push('');
catLines.push('| Theater | Discovery | Kind | Coupling |');
catLines.push('|---|---|---|---:|');
for (const row of report.discoveryCatalog.listedDiscoveries.slice(0, 80)) {
  catLines.push(
    `| ${row.theater} | \`${row.discoveryId}\` | ${row.kind} | ${row.coupling ?? ''} |`,
  );
}
catLines.push('');
catLines.push('→ ∞^∞');
writeFileSync(join(dataDir, 'DISCOVERY_CATALOG.md'), catLines.join('\n'));

console.log(lines.join('\n'));
console.log('\nWrote', join(dataDir, 'empirical_report.json'));
console.log('Wrote', join(dataDir, 'DISCOVERY_CATALOG.json'));
