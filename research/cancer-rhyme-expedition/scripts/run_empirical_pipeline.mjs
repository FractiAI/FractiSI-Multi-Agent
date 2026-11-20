#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DOCUMENT_ID, TITLE, SEED } from '../src/constants.mjs';
import { runFullExpedition } from '../src/experiments.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const FIX = join(ROOT, 'fixtures/pancancer_worlds.json');
mkdirSync(DATA, { recursive: true });

if (!existsSync(FIX)) {
  const prep = spawnSync(process.execPath, [join(ROOT, 'scripts/prepare_fixtures.mjs')], {
    encoding: 'utf8',
  });
  if (prep.status !== 0) {
    console.error(prep.stderr || prep.stdout);
    process.exit(1);
  }
}

const t0 = Date.now();
const report = runFullExpedition();
const ms = Date.now() - t0;

const summary = {
  documentId: DOCUMENT_ID,
  title: TITLE,
  seed: SEED,
  positiveExpeditionSignal: report.positiveExpeditionSignal,
  signals: report.signals,
  models: report.models,
  compression: report.compression.compressionDiseaseOverRhymes,
  transfer: report.transfer.transferAccuracy,
  ms,
};

writeFileSync(join(DATA, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(DATA, 'empirical_report.json'), JSON.stringify(report, null, 2));

const md = `# The Cancer Rhyme · empirical report

**Document ID:** \`${DOCUMENT_ID}\`
**Title:** ${TITLE}
**Seed:** ${SEED}
**Runtime:** ${ms} ms
**Label source:** ${report.labelSource}

## Verdict

${report.positiveExpeditionSignal ? 'Positive' : 'Mixed/negative'} Soft Story signal on ${report.signals.join(', ') || 'none'}.

${report.honesty}

## Models A / B / C (phenotype LOO)

| Model | Accuracy |
|---|---:|
| A disease labels | ${report.models.A_disease.toFixed(3)} |
| B relation-type bags | ${report.models.B_relBag.toFixed(3)} |
| C relational-rhyme fingerprints | ${report.models.C_rhymeFp.toFixed(3)} |

## Compression

- Disease taxonomy complexity: **${report.compression.diseaseTaxonomyComplexity}**
- Pathway/rel-bag complexity: **${report.compression.pathwayBagComplexity}**
- Strong rhyme complexity: **${report.compression.strongRhymeComplexity}**
- Disease / rhymes compression: **${report.compression.compressionDiseaseOverRhymes}**

## Null / transfer / local-vs-shared

- Null: ${JSON.stringify(report.nullTest)}
- Transfer accuracy: **${report.transfer.transferAccuracy.toFixed(3)}** (disease-identity baseline ${report.transfer.diseaseIdentityBaseline})
- Local−shared divergence: malignant-like **${report.localShared.meanDivergenceMalignantLike}** vs indeterminate **${report.localShared.meanDivergenceIndeterminate}**
- Goldilocks proxy signal: ${report.goldilocks.signal}

## Rhyme atlas (top)

${report.rhymeAtlas
  .map(
    (r) =>
      `- \`${r.fingerprint}\` · cancers=${r.nCancers} · tier=${r.tier} · planted=${r.plantedMotif || '—'} · ${r.postHocHint || ''}`,
  )
  .join('\n')}

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
writeFileSync(join(DATA, 'rhyme_atlas.json'), JSON.stringify(report.rhymeAtlas, null, 2));
console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
