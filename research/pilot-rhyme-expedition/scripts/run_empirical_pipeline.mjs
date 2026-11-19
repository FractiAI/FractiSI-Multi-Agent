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

const discoveries = report.theaters?.discoveries || [];
const catalog = {
  documentId: report.documentId,
  rhyme: 'pilot-rhyme',
  generatedAt: new Date().toISOString(),
  nDiscoveries: discoveries.length,
  discoveries,
};
writeFileSync(join(dataDir, 'DISCOVERY_CATALOG.json'), JSON.stringify(catalog, null, 2));

const lines = [];
lines.push('# Pilot Rhyme Expedition · empirical report');
lines.push('');
lines.push(`**Document ID:** \`${report.documentId}\``);
lines.push(`**Seed:** ${report.seed}`);
lines.push(`**Runtime:** ${report.ms} ms`);
lines.push('');
lines.push('## Verdict');
lines.push('');
lines.push(report.verdict);
lines.push('');
lines.push(`Coordination positive signal: **${report.positiveExpeditionSignal}**`);
lines.push(`Theater candidate signal: **${report.positiveTheaterSignal}** · **${catalog.nDiscoveries}** named discoveries`);
lines.push('');
lines.push(report.honesty);
lines.push('');
lines.push('## Coordination lab (wins / N)');
lines.push('');
lines.push('| Arm | Wins | Win rate | Mean ops | Mean rounds |');
lines.push('|---|---:|---:|---:|---:|');
for (const [arm, a] of Object.entries(report.arms)) {
  lines.push(`| ${arm} | ${a.wins} | ${(a.winRate * 100).toFixed(1)}% | ${a.meanOps.toFixed(1)} | ${a.meanRounds.toFixed(1)} |`);
}
lines.push('');
const c = report.compare;
lines.push('## Store size');
lines.push('');
lines.push('| Store | Bytes |');
lines.push('|---|---:|');
lines.push(`| Pilot Rhyme (template once + deltas) | ${c.rhymeStoreBytes} |`);
lines.push(`| Exact-text role cache | ${c.exactCacheStoreBytes} (hits: ${c.exactCacheHits}) |`);
lines.push(`| Private Director/Pilot copies | ${c.privateStoreBytes} |`);
lines.push('');
lines.push(`Rhyme vs exact cache: **${(c.rhymeVersusExact * 100).toFixed(1)}% smaller**`);
lines.push(`Rhyme vs private copies: **${(c.rhymeVersusPrivate * 100).toFixed(1)}% smaller**`);
lines.push('');
lines.push('## Theater candidate recovery');
lines.push('');
lines.push('| Theater | Tasks | Flat | Pilot Rhyme | Named candidates (Pilot hit · flat miss) |');
lines.push('|---|---:|---:|---:|---:|');
for (const layer of report.theaters.layers) {
  lines.push(
    `| ${layer.theater} | ${layer.nTasks} | ${(layer.rates.flat_peers * 100).toFixed(1)}% | **${(layer.rates.director_pilot_rhyme * 100).toFixed(1)}%** | ${layer.nDiscoveries} |`,
  );
}
lines.push('');
lines.push('## Discovery catalog (sample)');
lines.push('');
for (const d of discoveries.slice(0, 40)) {
  lines.push(`- **${d.theater}:** \`${d.discoveryId}\` (${d.kind}, coupling ${Number(d.coupling).toFixed(4)})`);
}
if (discoveries.length > 40) lines.push(`- … +${discoveries.length - 40} more in DISCOVERY_CATALOG.json`);
lines.push('');
writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), lines.join('\n'));

const mdCat = [];
mdCat.push('# Pilot Rhyme · Discovery Catalog');
mdCat.push('');
mdCat.push(`**Document ID:** \`${report.documentId}\` · **Seed:** ${report.seed}`);
mdCat.push('');
mdCat.push('Named held-out partners recovered by Pilot Rhyme (Director map + Pilot local slices) that flat peers with local windows missed.');
mdCat.push('');
mdCat.push('| Theater | Discovery | Kind | Coupling |');
mdCat.push('|---|---|---|---:|');
for (const d of discoveries) {
  mdCat.push(`| ${d.theater} | \`${d.discoveryId}\` | ${d.kind} | ${Number(d.coupling).toFixed(4)} |`);
}
mdCat.push('');
mdCat.push('Honesty: Soft Story / computational expedition. Genome rows are public-panel demos, not clinical genetics. Cosmic rows are fixture partners from measured feature couplings, not finished astrophysical discoveries. → ∞^∞');
mdCat.push('');
writeFileSync(join(dataDir, 'DISCOVERY_CATALOG.md'), mdCat.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      positive: report.positiveExpeditionSignal,
      theaterCandidates: catalog.nDiscoveries,
      layers: report.theaters.layers.map((l) => ({
        theater: l.theater,
        nTasks: l.nTasks,
        flat: l.rates.flat_peers,
        pilot: l.rates.director_pilot_rhyme,
        nDiscoveries: l.nDiscoveries,
      })),
      ms: report.ms,
    },
    null,
    2,
  ),
);
