#!/usr/bin/env node
/**
 * Rhyming vs Non-Rhyming World Models — expedition runner.
 * Fair comparative harness. FractiSI is not assumed to win.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { runEpisode } from '../src/run-episode.mjs';
import { summarize } from '../src/metrics.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = join(root, 'results');
const rawDir = join(resultsDir, 'raw');
mkdirSync(rawDir, { recursive: true });
mkdirSync(join(root, 'plots'), { recursive: true });
mkdirSync(join(root, 'reports'), { recursive: true });

const SEEDS = [1, 2, 3, 4, 5];
const CONDITIONS = [
  'independent',
  'shared_text',
  'shared_structured',
  'fractisi',
  'fractisi_deltas',
  'fractisi_selective',
];
const WORLDS = ['knowledge', 'dynamic', 'planning', 'adversarial', 'relational'];
const SCALE_N = [1, 2, 4, 8, 16, 32];

const t0 = performance.now();
const runs = [];

function record(row) {
  runs.push(row);
  return row;
}

// --- Main grid: worlds × conditions × seeds ---
for (const worldKind of WORLDS) {
  for (const condition of CONDITIONS) {
    for (const seed of SEEDS) {
      const ep = runEpisode({ worldKind, condition, seed, nAgents: worldKind === 'relational' ? 3 : 5 });
      record({
        kind: 'grid',
        worldKind,
        condition,
        seed,
        ...ep,
      });
    }
  }
}

// --- Scaling sweep (knowledge world) ---
const scaling = [];
for (const n of SCALE_N) {
  for (const condition of ['independent', 'shared_text', 'shared_structured', 'fractisi_selective']) {
    const seedRuns = [];
    for (const seed of SEEDS) {
      const ep = runEpisode({
        worldKind: 'knowledge',
        condition,
        seed,
        nAgents: Math.max(2, n),
        opts: { chain: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, Math.max(3, Math.min(8, n + 1))) },
      });
      seedRuns.push(ep);
      record({ kind: 'scaling', worldKind: 'knowledge', condition, seed, nAgents: n, ...ep });
    }
    const success = seedRuns.map((r) => (r.raw?.collectiveIntelligence?.successScore ?? 0));
    const dup = seedRuns.map((r) => r.raw?.resource?.duplicationRatio ?? 0);
    const msgs = seedRuns.map((r) => r.raw?.coordination?.messages ?? 0);
    const latency = seedRuns.map((r) => r.raw?.timingMs ?? 0);
    scaling.push({
      nAgents: n,
      condition,
      success: summarize(success),
      duplicationRatio: summarize(dup),
      messages: summarize(msgs),
      latencyMs: summarize(latency),
    });
  }
}

// --- Specialization experiment (planning world, fixed roles) ---
const specialization = [];
for (const condition of CONDITIONS) {
  const seedRuns = SEEDS.map((seed) => runEpisode({ worldKind: 'planning', condition, seed, nAgents: 6 }));
  for (const [i, ep] of seedRuns.entries()) {
    record({ kind: 'specialization', worldKind: 'planning', condition, seed: SEEDS[i], ...ep });
  }
  specialization.push({
    condition,
    success: summarize(seedRuns.map((r) => (r.raw?.collectiveIntelligence?.taskSuccess ? 1 : 0))),
    messages: summarize(seedRuns.map((r) => r.raw?.coordination?.messages ?? 0)),
    reconstructions: summarize(seedRuns.map((r) => r.raw?.coordination?.reconstructions ?? 0)),
    duplicationRatio: summarize(seedRuns.map((r) => r.raw?.resource?.duplicationRatio ?? 0)),
  });
}

// --- Reproduce existing FractiSI Exp 002 discovery signal (if present) ---
let reproduction = { status: 'NOT_FOUND', note: 'Exp 002 runner not importable' };
try {
  const exp002path = join(root, '../../src/experiments/expedition-002-discovery.mjs');
  if (existsSync(exp002path)) {
    const mod = await import(exp002path);
    const fn = mod.runDiscoveryConvergenceBenchmark || mod.runExpedition002 || mod.default;
    if (typeof fn === 'function') {
      // Signature is (seed: number), not options object.
      const r = fn(20261105 + 1);
      reproduction = {
        status: 'OK',
        source: 'src/experiments/expedition-002-discovery.mjs',
        result: r,
        protocol: mod.EXP002_DISCOVERY || null,
      };
    } else {
      reproduction = { status: 'EXPORTS_ONLY', exports: Object.keys(mod) };
    }
  }
} catch (err) {
  reproduction = { status: 'ERROR', error: String(err?.message || err) };
}

// Fallback: read committed Exp 002 receipt if live runner shape differs
const receiptPaths = [
  join(root, '../../docs/product/expedition-002/empirical_report.md'),
  join(root, '../../docs/product/expedition-002/empirical_report.json'),
];
for (const p of receiptPaths) {
  if (existsSync(p) && reproduction.status !== 'OK') {
    reproduction = {
      status: 'RECEIPT_ONLY',
      path: p,
      note: 'Live runner export shape differed; committed receipt cited for reproduction checklist',
      excerpt: readFileSync(p, 'utf8').slice(0, 1200),
    };
    break;
  }
}

// --- Aggregate grid by condition × world ---
function okRuns(filterFn) {
  return runs.filter((r) => r.status === 'OK' && r.raw && filterFn(r));
}

const gridSummary = [];
for (const worldKind of WORLDS) {
  for (const condition of CONDITIONS) {
    const subset = okRuns((r) => r.kind === 'grid' && r.worldKind === worldKind && r.condition === condition);
    if (!subset.length) {
      gridSummary.push({
        worldKind,
        condition,
        n: 0,
        status: runs.find((r) => r.worldKind === worldKind && r.condition === condition)?.status,
      });
      continue;
    }
    gridSummary.push({
      worldKind,
      condition,
      n: subset.length,
      successScore: summarize(subset.map((r) => r.raw.collectiveIntelligence.successScore)),
      taskSuccessRate: summarize(subset.map((r) => (r.raw.collectiveIntelligence.taskSuccess ? 1 : 0))),
      cie: summarize(subset.map((r) => r.cie.cie)),
      duplicationRatio: summarize(subset.map((r) => r.raw.resource.duplicationRatio ?? 0)),
      messages: summarize(subset.map((r) => r.raw.coordination.messages)),
      reconstructions: summarize(subset.map((r) => r.raw.coordination.reconstructions)),
      latencyMs: summarize(subset.map((r) => r.raw.timingMs)),
      crossAgentAgreement: summarize(
        subset.map((r) => r.raw.coherence.crossAgentAgreement ?? 0),
      ),
    });
  }
}

// --- Literature-only / NOT_EXECUTABLE adapters ---
const notExecutable = ['vjepa', 'dreamer', 'cosmos', 'genie'].map((id) => {
  const ep = runEpisode({ worldKind: 'knowledge', condition: id, seed: 1 });
  return {
    id,
    status: ep.status,
    architecture: ep.architecture,
    reason: ep.reason,
  };
});

// --- Scientific answers (data-driven, not forced) ---
function meanSuccess(condition) {
  const subset = okRuns((r) => r.kind === 'grid' && r.condition === condition);
  return mean(subset.map((r) => r.raw.collectiveIntelligence.successScore));
}
function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

const q1_shared_vs_independent = {
  independent: meanSuccess('independent'),
  shared_text: meanSuccess('shared_text'),
  shared_structured: meanSuccess('shared_structured'),
  fractisi_selective: meanSuccess('fractisi_selective'),
};
const sharedBetterThanIndependent =
  Math.max(
    q1_shared_vs_independent.shared_text,
    q1_shared_vs_independent.shared_structured,
    q1_shared_vs_independent.fractisi_selective,
  ) > q1_shared_vs_independent.independent + 0.05;

const q2_structured_vs_text = {
  shared_text: meanSuccess('shared_text'),
  shared_structured: meanSuccess('shared_structured'),
};
const structuredBetterThanText =
  q2_structured_vs_text.shared_structured > q2_structured_vs_text.shared_text + 0.05;

const q3_fractisi_vs_structured = {
  shared_structured: meanSuccess('shared_structured'),
  fractisi: meanSuccess('fractisi'),
  fractisi_deltas: meanSuccess('fractisi_deltas'),
  fractisi_selective: meanSuccess('fractisi_selective'),
};
const fractisiEdge =
  Math.max(
    q3_fractisi_vs_structured.fractisi,
    q3_fractisi_vs_structured.fractisi_deltas,
    q3_fractisi_vs_structured.fractisi_selective,
  ) - q3_fractisi_vs_structured.shared_structured;

function verdictSharedWorldHypothesis() {
  if (!sharedBetterThanIndependent) return 'NOT_SUPPORTED';
  if (sharedBetterThanIndependent && structuredBetterThanText) return 'PARTIALLY_SUPPORTED';
  if (sharedBetterThanIndependent) return 'PARTIALLY_SUPPORTED';
  return 'INCONCLUSIVE';
}

function verdictFractisiImplementation() {
  if (Math.abs(fractisiEdge) < 0.05) return 'INCONCLUSIVE'; // parity with structured shared state
  if (fractisiEdge > 0.05) return 'PARTIALLY_SUPPORTED';
  return 'NOT_SUPPORTED'; // structured shared alone matched or beat FractiSI-shaped arms on this fixture
}

const scientificConclusions = {
  question1_shared_vs_independent: {
    claim: 'Is a shared world better than independent world models?',
    means: q1_shared_vs_independent,
    supported: sharedBetterThanIndependent,
  },
  question2_structured_vs_text: {
    claim: 'Is structured shared state better than shared text/context?',
    means: q2_structured_vs_text,
    supported: structuredBetterThanText,
  },
  question3_fractisi_vs_other_shared: {
    claim: 'Does FractiSI’s particular implementation outperform other shared-world architectures in this harness?',
    means: q3_fractisi_vs_structured,
    fractisiEdge,
    note: 'Compared against shared_structured blackboard in-process; Genie/Cosmos/V-JEPA marked NOT_EXECUTABLE',
  },
  hypothesis_shared_world_coordination_primitive: verdictSharedWorldHypothesis(),
  hypothesis_fractisi_specific_implementation: verdictFractisiImplementation(),
  evidenceLevel: 'Level 2 — reproducible computational improvement on synthetic fixtures (not Level 5 embodied)',
};

const summary = {
  documentId: 'WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18',
  expedition: 'Rhyming vs Non-Rhyming World Models',
  seedDate: '2026-11-18',
  runtimeMs: performance.now() - t0,
  seeds: SEEDS,
  conditions: CONDITIONS,
  worlds: WORLDS,
  nRuns: runs.length,
  gridSummary,
  scaling,
  specialization,
  notExecutable,
  reproduction,
  scientificConclusions,
  honesty: [
    'Do not assume FractiSI wins — results are measured.',
    'NOT_EXECUTABLE architectures are not fabricated.',
    'CIE is secondary; raw metrics are primary.',
    'Synthetic fixture Level 2 evidence ≠ real-world embodied validation.',
    'FractiSI adapter is structural Tiny-Footprint-shaped (shared+delta+selective), not a claim of full platform+GPU parity.',
  ],
};

writeFileSync(join(rawDir, 'all_runs.jsonl'), runs.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(resultsDir, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(resultsDir, 'scaling.json'), JSON.stringify(scaling, null, 2));
writeFileSync(join(resultsDir, 'grid_summary.json'), JSON.stringify(gridSummary, null, 2));

// Markdown results
const lines = [];
lines.push('# Shared World Models Expedition · Results');
lines.push('');
lines.push(`**Document ID:** \`${summary.documentId}\``);
lines.push(`**Runtime:** ${summary.runtimeMs.toFixed(1)} ms · **Runs:** ${summary.nRuns}`);
lines.push('');
lines.push('## Honesty');
lines.push('');
for (const h of summary.honesty) lines.push(`- ${h}`);
lines.push('');
lines.push('## Scientific conclusions (data-driven)');
lines.push('');
lines.push(
  `| Hypothesis | Verdict |`,
);
lines.push(`|---|---|`);
lines.push(
  `| Shared world as coordination primitive | **${summary.scientificConclusions.hypothesis_shared_world_coordination_primitive}** |`,
);
lines.push(
  `| FractiSI-specific implementation advantage | **${summary.scientificConclusions.hypothesis_fractisi_specific_implementation}** |`,
);
lines.push('');
lines.push('### Q1 shared vs independent (mean successScore)');
lines.push('```');
lines.push(JSON.stringify(q1_shared_vs_independent, null, 2));
lines.push('```');
lines.push('### Q2 structured vs text');
lines.push('```');
lines.push(JSON.stringify(q2_structured_vs_text, null, 2));
lines.push('```');
lines.push('### Q3 FractiSI vs shared structured');
lines.push('```');
lines.push(JSON.stringify(q3_fractisi_vs_structured, null, 2));
lines.push('```');
lines.push('');
lines.push('## Grid summary (mean successScore by world × condition)');
lines.push('');
lines.push('| World | Condition | successScore mean | taskSuccess | CIE mean | dupRatio | msgs |');
lines.push('|---|---|---:|---:|---:|---:|---:|');
for (const g of gridSummary) {
  if (!g.successScore) {
    lines.push(`| ${g.worldKind} | ${g.condition} | — | — | — | — | — |`);
    continue;
  }
  lines.push(
    `| ${g.worldKind} | ${g.condition} | ${g.successScore.mean.toFixed(3)} | ${g.taskSuccessRate.mean.toFixed(3)} | ${g.cie.mean.toFixed(3)} | ${(g.duplicationRatio.mean || 0).toFixed(3)} | ${g.messages.mean.toFixed(1)} |`,
  );
}
lines.push('');
lines.push('## Scaling (knowledge world)');
lines.push('');
lines.push('| N | Condition | success mean | dupRatio | msgs | latency ms |');
lines.push('|---:|---|---:|---:|---:|---:|');
for (const s of scaling) {
  lines.push(
    `| ${s.nAgents} | ${s.condition} | ${s.success.mean.toFixed(3)} | ${s.duplicationRatio.mean.toFixed(3)} | ${s.messages.mean.toFixed(1)} | ${s.latencyMs.mean.toFixed(2)} |`,
  );
}
lines.push('');
lines.push('## NOT EXECUTABLE (no fabricated scores)');
lines.push('');
for (const n of notExecutable) {
  lines.push(`- **${n.id}** (${n.architecture}): ${n.reason}`);
}
lines.push('');
lines.push('## Existing FractiSI reproduction');
lines.push('');
lines.push('```json');
lines.push(JSON.stringify(reproduction, null, 2).slice(0, 2000));
lines.push('```');
lines.push('');
lines.push('→ ∞^∞');

writeFileSync(join(resultsDir, 'results.md'), lines.join('\n'));
writeFileSync(join(root, 'reports/results.md'), lines.join('\n'));

console.log(lines.join('\n'));
console.log('\nWrote', join(resultsDir, 'summary.json'));
