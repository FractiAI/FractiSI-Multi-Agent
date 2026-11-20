#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullExpedition } from '../src/experiments.mjs';
import { DOCUMENT_ID, TITLE, SEED } from '../src/constants.mjs';

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
  rrs: report.rrs.rrs,
  h1: report.h1.rates.fractisi_rhyme.accuracy,
  h2: report.h2.rates.fractisi_rhyme.accuracy,
  h2b: report.h2b.rates.fractisi_rhyme.accuracy,
  h3edge: report.h3.edge.fractisi_rhyme.accuracy,
  ms,
};

writeFileSync(join(DATA, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(DATA, 'empirical_report.json'), JSON.stringify(report, null, 2));

const md = `# Relational Continuity · Rhyming Expedition · empirical report

**Document ID:** \`${DOCUMENT_ID}\`
**Title:** ${TITLE}
**Seed:** ${SEED}
**Runtime:** ${ms} ms

## Verdict

${report.positiveExpeditionSignal ? 'Positive' : 'Mixed/negative'} expedition signal on ${report.signals.join(', ') || 'none'}.

${report.honesty}

## RRS

- Relational Rhyme Score: **${report.rrs.rrs}**
- Alt linear: ${report.rrs.altLinear}
- Components: ${JSON.stringify(report.rrs.components)}

## H1 Partners

| Arm | Accuracy | Mean cost |
|---|---:|---:|
${Object.entries(report.h1.rates)
  .map(([a, r]) => `| ${a} | ${r.accuracy.toFixed(3)} | ${r.meanCost.toFixed(1)} |`)
  .join('\n')}

Signal: ${report.h1.signal} · Δ vs best baseline: ${report.h1.deltaVsBestBaseline}

## H2 Question ↔ Answer

| Arm | Accuracy |
|---|---:|
${Object.entries(report.h2.rates)
  .map(([a, r]) => `| ${a} | ${r.accuracy.toFixed(3)} |`)
  .join('\n')}

Lexical trap wins: ${report.h2.lexicalTrapWins}/${report.h2.n}
Rhyme wins when lexical loses: ${report.h2.rhymeWinsWhenLexicalLoses}/${report.h2.n}
Signal: ${report.h2.signal} · Δ vs embedding: ${report.h2.deltaVsEmbedding}

## H2b Agent world ↔ Agent world

Rhyme ${report.h2b.rates.fractisi_rhyme.accuracy.toFixed(3)} · embedding ${report.h2b.rates.embedding_sim.accuracy.toFixed(3)} · signal ${report.h2b.signal}

## H3 Seed ↔ Edge (depth ${report.h3.octaveDepth})

| Depth | rhyme | embedding | exact |
|---:|---:|---:|---:|
${Object.entries(report.h3.curve)
  .map(
    ([d, arms]) =>
      `| ${d} | ${arms.fractisi_rhyme.accuracy.toFixed(3)} | ${arms.embedding_sim.accuracy.toFixed(3)} | ${arms.exact_cache.accuracy.toFixed(3)} |`,
  )
  .join('\n')}

Transformed-edge control: ${JSON.stringify(report.h3.transformedEdgeControl)}
Signal: ${report.h3.signal}

## Ablations

| Ablation | Accuracy |
|---|---:|
${Object.entries(report.abl.rates)
  .map(([a, r]) => `| ${a} | ${r.accuracy.toFixed(3)} |`)
  .join('\n')}

Δ full − minus_rhyme: ${report.abl.deltaFullMinusRhyme}

## Separation

### Previously demonstrated
${report.previouslyDemonstrated.map((x) => `- ${x}`).join('\n')}

### New hypotheses
${report.newHypotheses.map((x) => `- ${x}`).join('\n')}

### New findings
${report.newFindings.map((x) => `- ${x}`).join('\n')}

→ ∞^∞
`;

writeFileSync(join(DATA, 'EMPIRICAL_REPORT.md'), md);
console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
