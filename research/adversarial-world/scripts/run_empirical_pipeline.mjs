#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCUMENT_ID, TITLE, SEED } from '../src/constants.mjs';
import { runFullExpedition } from '../src/experiments.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
mkdirSync(DATA, { recursive: true });

const t0 = Date.now();
const report = runFullExpedition();
const ms = Date.now() - t0;

const summary = {
  documentId: DOCUMENT_ID,
  title: TITLE,
  seed: SEED,
  positiveExpeditionSignal: report.positiveExpeditionSignal,
  signals: report.signals,
  levels: report.levels,
  models: Object.fromEntries(
    Object.entries(report.models).map(([k, v]) => [
      k,
      {
        containmentRate: v.containmentRate,
        contaminationRate: v.contaminationRate,
        sybilContained: v.sybilContained,
        minorityTruthOk: v.minorityTruthOk,
        majorityFalsehoodContained: v.majorityFalsehoodContained,
      },
    ]),
  ),
  goldilocksTop: report.goldilocks[0],
  ms,
};

writeFileSync(join(DATA, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(DATA, 'empirical_report.json'), JSON.stringify(report, null, 2));
writeFileSync(join(DATA, 'attack_atlas.json'), JSON.stringify(report.attackAtlas, null, 2));

const md = `# ${TITLE}

**Document ID:** ${DOCUMENT_ID}  
**Seed:** ${SEED}  
**Positive Soft Story signal:** ${report.positiveExpeditionSignal}  
**Signals:** ${report.signals.join(', ') || '(none)'}

## Model containment (attacks A–J)

| Model | Containment | Contamination | Sybil | Minority truth | Majority falsehood |
|---|---:|---:|---|---|---|
${Object.values(report.models)
  .map(
    (m) =>
      `| ${m.modelId} | ${m.containmentRate.toFixed(3)} | ${m.contaminationRate.toFixed(3)} | ${m.sybilContained} | ${m.minorityTruthOk} | ${m.majorityFalsehoodContained} |`,
  )
  .join('\n')}

## Levels

${Object.entries(report.levels)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

## Goldilocks ranking (Soft Story)

${report.goldilocks.map((g, i) => `${i + 1}. ${g.modelId} score=${g.score.toFixed(3)}`).join('\n')}

## Honesty

${report.honesty}
`;

writeFileSync(join(DATA, 'EMPIRICAL_REPORT.md'), md);

console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
