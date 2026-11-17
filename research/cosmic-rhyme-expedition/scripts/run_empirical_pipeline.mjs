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
lines.push('# Cosmic Rhyme Expedition · empirical report');
lines.push('');
lines.push(`**Document ID:** \`${report.documentId}\``);
lines.push(`**Seed:** ${report.seed}`);
lines.push(`**Runtime:** ${report.ms} ms`);
lines.push('');
lines.push('## Verdict');
lines.push('');
lines.push(report.summary.verdict);
lines.push('');
lines.push(`Positive signal: **${report.summary.positiveExpeditionSignal}** · H1 layers: ${report.summary.h1Layers.join(', ') || '(none)'} · Motif survivors: ${report.summary.nMotifSurvivors}`);
lines.push('');
lines.push('## C1 — Partner recovery (LINEAR / FLAT / AWARE)');
lines.push('');
lines.push('| Layer | N tasks | LINEAR | FLAT | AWARE | Δ(A−L) | H1 | H2 |');
lines.push('|---|---:|---:|---:|---:|---:|---|---|');
for (const r of Object.values(report.c1)) {
  lines.push(
    `| ${r.layer} | ${r.nTasks} | ${(r.rates.linear * 100).toFixed(1)}% | ${(r.rates.flat * 100).toFixed(1)}% | **${(r.rates.aware * 100).toFixed(1)}%** | ${(r.deltaAwareLinear * 100).toFixed(1)} pp | ${r.H1} | ${r.H2} |`,
  );
}
lines.push('');
lines.push('## C3 — WMAP TT spectral rhyme');
lines.push('');
const c3 = report.c3;
lines.push(
  `N=${c3.rates.n} · LINEAR ${(c3.rates.linear * 100).toFixed(1)}% · FLAT ${(c3.rates.flat * 100).toFixed(1)}% · AWARE **${(c3.rates.aware * 100).toFixed(1)}%** · H1=${c3.H1} · H2=${c3.H2}`,
);
lines.push('');
lines.push('Top |corr| lags: ' + c3.topLags.map((x) => `lag ${x.lag}=${x.corr.toFixed(3)}`).join(' · '));
lines.push('');
lines.push('## C2 — Open motif survivors (held-out + FDR vs feature-permute null)');
lines.push('');
if (!report.summary.motifHits.length) {
  lines.push('_No motifs survived FDR + held-out replication._');
} else {
  lines.push('| Layer | Signature | Train | Held-out | p_feat | Audit |');
  lines.push('|---|---|---:|---:|---:|---|');
  for (const m of report.summary.motifHits) {
    lines.push(
      `| ${m.layer} | \`${m.signature}\` | ${(m.trainEnrichment * 100).toFixed(1)}% | ${(m.heldOutEnrichment * 100).toFixed(1)}% | ${m.pFeaturePermute.toFixed(3)} | ${m.audit} |`,
    );
  }
}
lines.push('');
lines.push('## Honesty');
lines.push('');
lines.push('Cosmos = observable relational layer, not Universe ontology. Application companion — not ENGINE_SHELF, not a claim of new fundamental physics. Architecture control on public NASA Exoplanet Archive, JPL CAD, OpenNGC, and WMAP TT fixtures. Surviving motifs require held-out replication and FDR against feature-permutation nulls; rediscovery audits are post-hoc.');
lines.push('');
lines.push('→ ∞^∞');

writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));
console.log(lines.join('\n'));
console.log('\nWrote', join(dataDir, 'empirical_report.json'));
