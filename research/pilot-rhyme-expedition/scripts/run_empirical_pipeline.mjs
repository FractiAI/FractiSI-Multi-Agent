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

const c = report.compare;
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
lines.push(`Positive signal: **${report.positiveExpeditionSignal}**`);
lines.push('');
lines.push(report.honesty);
lines.push('');
lines.push('## Discovery (wins / N)');
lines.push('');
lines.push('| Arm | Wins | Win rate | Mean ops | Mean rounds |');
lines.push('|---|---:|---:|---:|---:|');
for (const [arm, a] of Object.entries(report.arms)) {
  lines.push(`| ${arm} | ${a.wins} | ${(a.winRate * 100).toFixed(1)}% | ${a.meanOps.toFixed(1)} | ${a.meanRounds.toFixed(1)} |`);
}
lines.push('');
lines.push('## Store size');
lines.push('');
lines.push(`| Store | Bytes |`);
lines.push(`|---|---:|`);
lines.push(`| Pilot Rhyme (template once + deltas) | ${c.rhymeStoreBytes} |`);
lines.push(`| Exact-text role cache | ${c.exactCacheStoreBytes} (hits: ${c.exactCacheHits}) |`);
lines.push(`| Private Director/Pilot copies | ${c.privateStoreBytes} |`);
lines.push(`| Flat peers | ${c.flatStoreBytes} |`);
lines.push(`| Shared text | ${c.sharedTextStoreBytes} |`);
lines.push('');
lines.push(`Rhyme vs exact cache: **${(c.rhymeVersusExact * 100).toFixed(1)}% smaller**`);
lines.push(`Rhyme vs private copies: **${(c.rhymeVersusPrivate * 100).toFixed(1)}% smaller**`);
lines.push('');

writeFileSync(join(dataDir, 'EMPIRICAL_REPORT.md'), lines.join('\n'));
console.log(JSON.stringify({ ok: true, positive: report.positiveExpeditionSignal, compare: c, ms: report.ms }, null, 2));
