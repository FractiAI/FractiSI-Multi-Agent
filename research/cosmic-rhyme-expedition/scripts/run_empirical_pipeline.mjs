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
lines.push(`C4 physics search: **${report.summary.physicsSearchSignal}** · candidate novel: ${report.summary.nCandidateNovelPhysics} · known rediscovery: ${report.summary.nKnownPhysicsRediscovery}`);
lines.push('');
lines.push(`C5 LLM/language-pack rhyme: **${report.summary.llmRhymeSignal}** · H1 layers: ${(report.summary.llmRhymeH1Layers || []).join(', ') || '(none)'}`);
lines.push('');
lines.push(report.summary.whyPriorArmsWereNotNovelPhysics);
lines.push('');
lines.push(report.summary.llmRhymeVerdict);
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
lines.push('## C4 — Novel-physics candidate search (residuals after selection removal)');
lines.push('');
lines.push(report.summary.physicsVerdict);
lines.push('');
if (report.summary.novelPhysicsHits?.length) {
  lines.push('| Layer | Signal | Held-out / metric | Verdict |');
  lines.push('|---|---|---:|---|');
  for (const h of report.summary.novelPhysicsHits) {
    const metric =
      h.heldOutCorr != null
        ? h.heldOutCorr.toFixed(3)
        : h.corr != null
          ? h.corr.toFixed(3)
          : h.anisotropySpread != null
            ? h.anisotropySpread.toFixed(4)
            : '—';
    lines.push(`| ${h.layer} | \`${h.pair || h.lag || 'anisotropy'}\` | ${metric} | **candidate_novel_physics** |`);
  }
  lines.push('');
}
if (report.summary.knownPhysicsHits?.length) {
  lines.push('Known-template rediscoveries in residuals:');
  lines.push('');
  for (const h of report.summary.knownPhysicsHits.slice(0, 8)) {
    lines.push(
      `- \`${h.layer}\` · \`${h.pair || 'lag ' + h.lag}\` · held-out ${h.heldOutCorr != null ? h.heldOutCorr.toFixed(3) : h.corr?.toFixed(3) ?? '—'}`,
    );
  }
  lines.push('');
}
lines.push('');
lines.push('## C5 — LLM / language-pack rhyme (E9–E11 packing on cosmic fixtures)');
lines.push('');
lines.push(report.summary.llmRhymeVerdict);
lines.push('');
lines.push('| Layer | N | LINEAR | FLAT | AWARE | H1 | H2 | Lexical AWARE |');
lines.push('|---|---:|---:|---:|---:|---|---|---:|');
const c5layers = [
  report.c5.catalog.exoplanet,
  report.c5.catalog.neo,
  report.c5.catalog.ngc,
  report.c5.wmap,
];
for (const r of c5layers) {
  lines.push(
    `| ${r.layer} | ${r.nTasks} | ${(r.rates.linear * 100).toFixed(1)}% | ${(r.rates.flat * 100).toFixed(1)}% | **${(r.rates.aware * 100).toFixed(1)}%** | ${r.H1} | ${r.H2} | ${((r.lexicalBlind?.aware ?? 0) * 100).toFixed(1)}% |`,
  );
}
lines.push('');
lines.push(
  `Token economics (mean chars÷4): LINEAR ${c5layers[0].tokenEconomics.linearMean.toFixed(0)} · FLAT ${c5layers[0].tokenEconomics.flatMean.toFixed(0)} · AWARE ${c5layers[0].tokenEconomics.awareMean.toFixed(0)} (exo sample); live LLM configured=${report.c5.summary.liveLlmConfigured}.`,
);
lines.push('');
lines.push('### Legend · LLM rhymes → cosmic data');
lines.push('');
lines.push(report.c5.legend?.oneLine || report.summary.llmRhymeVerdict);
lines.push('');
lines.push('| Prior rhyme | Cosmic analog |');
lines.push('|---|---|');
for (const row of report.c5.legend?.domainBridge || []) {
  lines.push(`| ${row.rhyme} | ${row.cosmicAnalog} |`);
}
lines.push('');
lines.push('| Layer | Source | Gold |');
lines.push('|---|---|---|');
for (const row of report.c5.legend?.cosmicLayers || []) {
  lines.push(`| \`${row.code}\` | ${row.source} | ${row.gold} |`);
}
lines.push('');
lines.push('Full legend: `LLM_RHYME_LEGEND.md` · receipt `c5.legend`.');
lines.push('');
lines.push('## Honesty');
lines.push('');
lines.push('Cosmos = observable relational layer, not Universe ontology. Application companion — not ENGINE_SHELF. C1–C3 = representation + catalog fingerprints. C4 = residual search for candidate novel physics after removing selection axes / continuum; survivors are candidates under nulls, not confirmed new laws. C5 = E9–E11 language-pack rhyme on the same fixtures (pack-compliant reader by default; not a frontier bake-off). Fixtures: NASA Exoplanet Archive, JPL CAD, OpenNGC, WMAP TT.');
lines.push('');
lines.push('→ ∞^∞');

writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));
console.log(lines.join('\n'));
console.log('\nWrote', join(dataDir, 'empirical_report.json'));
