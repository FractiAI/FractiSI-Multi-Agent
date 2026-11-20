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
lines.push('# Diverse Redundancy · Inbreeding Expedition · empirical report');
lines.push('');
lines.push(`**Document ID:** \`${report.documentId}\``);
lines.push(`**Title:** ${report.title}`);
lines.push(`**Seed:** ${report.seed}`);
lines.push(`**Runtime:** ${report.ms} ms`);
lines.push('');
lines.push('## Verdict');
lines.push('');
lines.push(report.verdict);
lines.push('');
lines.push(`Positive expedition signal: **${report.positiveExpeditionSignal}**`);
lines.push(`Signals: ${report.signals.join(', ') || 'none'}`);
lines.push('');
lines.push(report.honesty);
lines.push('');
lines.push('## E1 · Depth simulator headline (β=0.2, depth=6)');
lines.push('');
lines.push('| Arm | n=5 | n=9 |');
lines.push('|---|---:|---:|');
lines.push(
  `| Clone | ${report.e1.headline.clone5.toFixed(4)} | ${report.e1.headline.clone9.toFixed(4)} |`,
);
lines.push(
  `| Diverse | ${report.e1.headline.diverse5.toFixed(4)} | ${report.e1.headline.diverse9.toFixed(4)} |`,
);
lines.push('');
lines.push('## E2 · Backblaze β̂');
lines.push('');
lines.push(`- Observed same-model window pairs: **${report.e2.observedWindowPairs}**`);
lines.push(`- Null mean: **${report.e2.nullMeanWindowPairs}**`);
lines.push(`- β̂ (excess share): **${report.e2.betaHat}**`);
lines.push('');
lines.push('## E3 · Plug-in at measured β');
lines.push('');
lines.push('| Depth | Clone5 | Diverse5 | Clone9 | Diverse9 |');
lines.push('|---:|---:|---:|---:|---:|');
for (const r of report.e3.table) {
  lines.push(
    `| ${r.depth} | ${r.clone5.toFixed(4)} | ${r.diverse5.toFixed(4)} | ${r.clone9.toFixed(4)} | ${r.diverse9.toFixed(4)} |`,
  );
}
lines.push('');
lines.push('## E4 · Yeast paralog buffering');
lines.push('');
lines.push(
  `Δ essential (paralog − no-paralog, length-stratified mean): **${report.e4.deltaEssential}** · signal=${report.e4.signal}`,
);
lines.push('');
lines.push('| Length bin | No-par N | No-par ess | Par N | Par ess |');
lines.push('|---:|---:|---:|---:|---:|');
for (const r of report.e4.stratified) {
  lines.push(
    `| ${r.lengthBin} | ${r.noParalogN} | ${r.noParalogEssentialRate} | ${r.withParalogN} | ${r.withParalogEssentialRate} |`,
  );
}
lines.push('');
lines.push('## E5 · Human LOEUF × paralog');
lines.push('');
lines.push(
  `Δ LOEUF (paralog − no-paralog, length-stratified mean): **${report.e5.deltaLoeuf}** · signal=${report.e5.signal}`,
);
lines.push('');
lines.push('| Length bin | No-par N | No-par LOEUF | Par N | Par LOEUF |');
lines.push('|---:|---:|---:|---:|---:|');
for (const r of report.e5.stratified) {
  lines.push(
    `| ${r.lengthBin} | ${r.noParalogN} | ${r.noParalogMeanLoeuf} | ${r.withParalogN} | ${r.withParalogMeanLoeuf} |`,
  );
}
lines.push('');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), lines.join('\n'));
writeFileSync(join(dataDir, 'summary.json'), JSON.stringify({
  documentId: report.documentId,
  positiveExpeditionSignal: report.positiveExpeditionSignal,
  signals: report.signals,
  betaHat: report.e2.betaHat,
  e1: report.e1.headline,
  e4delta: report.e4.deltaEssential,
  e5delta: report.e5.deltaLoeuf,
  ms: report.ms,
}, null, 2));

console.log(
  JSON.stringify(
    {
      ok: true,
      positive: report.positiveExpeditionSignal,
      signals: report.signals,
      betaHat: report.e2.betaHat,
      ms: report.ms,
    },
    null,
    2,
  ),
);
