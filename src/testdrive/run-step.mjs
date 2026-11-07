/**
 * Shared Test Drive step runners — CLI, self-paced web, and /api/testdrive.
 * Narrative locked to the real FractiSI Multi-Agent product stack:
 * Infinite Octaves · holographic rhyme · Tiny Gateway Rhyming Templates ·
 * Tiny Footprint (Layer A) · Layers B–F (coordination → deploy).
 */
import { gzipSync } from 'node:zlib';
import { runMultiSessionDemo } from '../workloads/multi-session.mjs';
import { compareRhymeToCache, differingWordSessions } from '../experiments/rhyme-vs-cache.mjs';
import { runDiscoveryConvergenceBenchmark } from '../experiments/expedition-002-discovery.mjs';
import { runComparativeBench } from '../platform/comparative-bench.mjs';
import {
  ARCHITECTURE_PRIMER,
  architecturePrimerFractisiBullets,
  architecturePrimerLines,
} from './architecture-primer.mjs';

function pct(x) {
  return `${(Number(x) * 100).toFixed(1)}%`;
}

function gzipJsonBytes(value) {
  return gzipSync(Buffer.from(JSON.stringify(value), 'utf8')).length;
}

function utf8Bytes(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

export const STEP_CATALOG = Object.freeze([
  {
    id: 'primer',
    n: 0,
    title: ARCHITECTURE_PRIMER.title,
    short: 'Net Zero · Φ · octaves · trees · polygons · wave · awareness → product',
    layer: ARCHITECTURE_PRIMER.kicker,
    component: 'Generative possibility → Tiny Gateway → FractiSI Multi-Agent',
  },
  {
    id: '1',
    n: 1,
    title: 'Layer A · Tiny Footprint shared world',
    short: 'Shared world once · agent deltas',
    layer: 'A · Tiny Footprint execution',
    component: 'Tiny Footprint · templates + deltas · selective reconstruct',
  },
  {
    id: '2',
    n: 2,
    title: 'Layer A · after gzip, architecture still matters',
    short: 'Gzip residual · share first',
    layer: 'A · Tiny Footprint execution',
    component: 'Tiny Footprint shared-world pack (vs N full copies)',
  },
  {
    id: '3',
    n: 3,
    title: 'Tiny Gateway · Rhyming Templates vs exact cache',
    short: 'Holographic rhyme · Net Zero → octaves',
    layer: 'A · Tiny Gateway™ engine',
    component: 'Rhyming Templates · Infinite Octaves · four-pillar holographic rhyme',
  },
  {
    id: '4',
    n: 4,
    title: 'Selective reconstruction · discovery',
    short: 'Relationship-guided recovery',
    layer: 'A · nested vectors · selective reconstruct',
    component: 'Tiny Gateway selective reconstruction · Expedition 002 E2',
  },
  {
    id: '5',
    n: 5,
    title: 'Selective reconstruction · convergence',
    short: 'Fewer rounds & ops',
    layer: 'A · nested vectors · selective reconstruct',
    component: 'Tiny Gateway guided path · Expedition 002 E2',
  },
  {
    id: '6',
    n: 6,
    title: 'Layers B–D · coordination + composition',
    short: 'Ownership · compose · no blind merge',
    layer: 'B · Coordination · C · Shared state · D · Composition',
    component: 'FractiSI platform · coord-bench arms A vs C',
  },
  {
    id: '7',
    n: 7,
    title: 'Density · Layers E–F · Community',
    short: 'More agents · Git · paid deploy',
    layer: 'A density · E Git · F Deploy (paid)',
    component: 'Tiny Footprint density · Git awareness · approval-gated deploy',
  },
]);

const NEXT = Object.freeze({
  primer: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
  5: '6',
  6: '7',
  7: null,
});

function base(meta, fields) {
  return {
    id: meta.id,
    n: meta.n,
    title: meta.title,
    short: meta.short,
    layer: meta.layer,
    component: meta.component,
    problem: fields.problem || '',
    opportunity: fields.opportunity || '',
    fractisi: fields.fractisi || [],
    lines: fields.lines || [],
    metrics: fields.metrics || {},
    next: NEXT[meta.id],
    honesty: ARCHITECTURE_PRIMER.honesty,
  };
}

function meta(id) {
  const row = STEP_CATALOG.find((s) => s.id === id || String(s.n) === String(id));
  if (!row) throw new Error(`Unknown testdrive step: ${id}`);
  return row;
}

function runPrimer() {
  const m = meta('primer');
  return base(m, {
    fractisi: architecturePrimerFractisiBullets(),
    lines: architecturePrimerLines(),
    metrics: {
      mode: 'primer',
      architecture: ARCHITECTURE_PRIMER.steps.map((s) => s.id),
      layers: ['A', 'B', 'C', 'D', 'E', 'F'],
      activeInferenceRhyme: 'possible_not_identity',
      chain: ARCHITECTURE_PRIMER.chain,
    },
  });
}

function run1() {
  const m = meta('1');
  const multi = runMultiSessionDemo(12);
  return base(m, {
    problem: 'Without Layer A, every agent reprints a full copy of the shared world.',
    opportunity: 'Tiny Footprint registers the world once; agents keep only local deltas.',
    fractisi: [
      'Component: Tiny Footprint (Layer A execution core, powered by Tiny Gateway™).',
      'Mechanism: shared templates + per-agent deltas + selective reconstruct.',
    ],
    lines: [
      'LAYER A · TINY FOOTPRINT',
      '',
      `  Conventional (N full copies):  ${multi.conventional.bytes} B across ${multi.conventional.sessions} sessions`,
      `  Tiny Footprint shared+deltas: ${multi.prefixReuse.bytes} B`,
      `  Reduction vs full copies:      ${pct(multi.prefixByteReduction)}`,
      '',
      '  → Same sessions. Layer A stops paying N reprints of one world.',
    ],
    metrics: {
      conventionalBytes: multi.conventional.bytes,
      sharedBytes: multi.prefixReuse.bytes,
      reduction: multi.prefixByteReduction,
      sessions: multi.conventional.sessions,
      component: 'tiny_footprint',
    },
  });
}

function run2() {
  const m = meta('2');
  const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
  const conventionalPayload = Array.from({ length: 12 }, (_, s) => ({
    system: SYSTEM,
    history: [`user-${s}`, `asst-${s}`],
  }));
  const sharedPayload = {
    system: SYSTEM,
    deltas: Array.from({ length: 12 }, (_, s) => ({ history: [`user-${s}`, `asst-${s}`] })),
  };
  const gzConv = gzipJsonBytes(conventionalPayload);
  const gzShared = gzipJsonBytes(sharedPayload);
  const rawConv = utf8Bytes(conventionalPayload);
  const rawShared = utf8Bytes(sharedPayload);
  return base(m, {
    problem: 'Gzip / pack compression shrinks copies — it does not remove N-copy structure.',
    opportunity: 'Tiny Footprint shares the world first; compression becomes optional polish.',
    fractisi: [
      'Component: Tiny Footprint shared-world pack (Layer A).',
      'Claim discipline: gzip residual is structural — not “compression theater.”',
    ],
    lines: [
      'LAYER A · TINY FOOTPRINT AFTER GZIP',
      '',
      `  Conventional JSON:     ${rawConv} B  → gzip ${gzConv} B`,
      `  Tiny Footprint JSON:   ${rawShared} B  → gzip ${gzShared} B`,
      `  Shared still ahead after gzip: ${gzShared < gzConv ? 'yes' : 'no'} (${gzConv - gzShared} B less)`,
      '',
      '  → Architecture (share once) beats “just gzip the N copies.”',
    ],
    metrics: { rawConv, gzConv, rawShared, gzShared, sharedAhead: gzShared < gzConv, component: 'tiny_footprint' },
  });
}

function run3() {
  const m = meta('3');
  const rhymeCmp = compareRhymeToCache(differingWordSessions(40));
  const multi = runMultiSessionDemo(12);
  const rhyme = multi.holographicRhyme;
  const lines = [
    'TINY GATEWAY · RHYMING TEMPLATES',
    '',
    '  Holographic rhyme (four pillars): repeating · self-similar · self-correcting · recursive',
    '  Rooted at Net Zero (octave 0), nested through Infinite Octaves — not exact-text match.',
    '',
    `  Sessions:              ${rhymeCmp.sessions} (same organization, different words)`,
    `  Exact-text cache hits: ${rhymeCmp.exactTextHits} duplicate texts`,
    `  Naive store:           ${rhymeCmp.naiveBytes} B`,
    `  Exact-text cache:      ${rhymeCmp.cacheBytes} B`,
    `  Rhyming Template store:${rhymeCmp.rhymeBytes} B`,
    `  Rhyme vs exact cache:  ${pct(rhymeCmp.rhymeVersusCache)} smaller than exact cache`,
    `  Exact rebuild:         ${rhymeCmp.equivalent}`,
    '',
    '  → Exact / prefix cache needs identical words. Rhyming Templates reuse organization.',
  ];
  if (rhyme?.status === 'ran') {
    lines.push(
      `  Reference rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `  (${pct(rhyme.byteReduction)} · four-pillar audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    );
  }
  return base(m, {
    problem: 'Exact-text and prefix caches only help when the words match.',
    opportunity:
      'Tiny Gateway Rhyming Templates share Infinite Octave organization when wording differs.',
    fractisi: [
      'Component: Tiny Gateway™ Rhyming Templates (engine under Tiny Footprint).',
      'Grammar: holographic rhyme from Net Zero up the Infinite Octaves ladder.',
      'Honesty: rhyme expands the cache bank for organizational near-dupes — not “rhyme beats every prefix cache on live heap.”',
    ],
    lines,
    metrics: {
      sessions: rhymeCmp.sessions,
      exactTextHits: rhymeCmp.exactTextHits,
      naiveBytes: rhymeCmp.naiveBytes,
      cacheBytes: rhymeCmp.cacheBytes,
      rhymeBytes: rhymeCmp.rhymeBytes,
      rhymeVersusCache: rhymeCmp.rhymeVersusCache,
      component: 'tiny_gateway_rhyming_templates',
    },
  });
}

function run4() {
  const m = meta('4');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Flat skim under a fixed budget never assembles multi-hop chains buried in noise.',
    opportunity:
      'Tiny Gateway selective reconstruction follows relationship edges across the shared world.',
    fractisi: [
      'Component: selective reconstruction + nested relational structure (Tiny Gateway spine).',
      'Lab: Expedition 002 · E2 — architectural discovery, not an LLM bake-off.',
    ],
    lines: [
      'TINY GATEWAY · SELECTIVE RECONSTRUCTION · DISCOVERY',
      '',
      `  Scenarios:                 ${e2.scenarios} (six-hop hidden chains)`,
      `  Flat skim discoveries:     ${e2.flat.discoveries} / ${e2.scenarios}`,
      `  Flat skim solutions:       ${e2.flat.solutions} / ${e2.scenarios}`,
      `  FractiSI discoveries:      ${e2.fractisi.discoveries} / ${e2.scenarios}`,
      `  FractiSI solutions:        ${e2.fractisi.solutions} / ${e2.scenarios}`,
      `  Lab pass (100/100 vs 0/100): ${e2.pass}`,
      '',
      '  → Same information, same budget. Guided reconstruction finds what flat skim misses.',
    ],
    metrics: {
      scenarios: e2.scenarios,
      flatDiscoveries: e2.flat.discoveries,
      fractisiDiscoveries: e2.fractisi.discoveries,
      pass: e2.pass,
      component: 'selective_reconstruction',
    },
  });
}

function run5() {
  const m = meta('5');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Collectives burn too many ops and propagation rounds before a composed answer.',
    opportunity: 'The same selective-reconstruction path converges with fewer rounds and ops.',
    fractisi: [
      'Component: Tiny Gateway guided reconstruction (Expedition 002 convergence meters).',
      'Claim discipline: architectural rounds/ops — not LLM dialogue-turn claims.',
    ],
    lines: [
      'TINY GATEWAY · SELECTIVE RECONSTRUCTION · CONVERGENCE',
      '',
      `  Flat mean ops / scenario:           ${e2.flat.meanOps.toFixed(1)}`,
      `  FractiSI mean ops / scenario:       ${e2.fractisi.meanOps.toFixed(1)}`,
      `  Ops reduction:                      ${pct(e2.opsReduction)}`,
      `  Flat propagation rounds (6-hop):    ${e2.flat.propagationRounds}`,
      `  FractiSI propagation rounds:        ${e2.fractisi.propagationRounds}`,
      `  Rounds reduction:                   ${pct(e2.roundsReduction)}`,
      '',
      '  → −50% rounds · −85% ops on this constrained Infinite-Octave-adjacent path.',
    ],
    metrics: {
      opsReduction: e2.opsReduction,
      roundsReduction: e2.roundsReduction,
      flatOps: e2.flat.meanOps,
      fractisiOps: e2.fractisi.meanOps,
      component: 'selective_reconstruction',
    },
  });
}

function run6() {
  const m = meta('6');
  const bench = runComparativeBench({ agentCounts: [5, 10, 25], runs: 3 });
  const lines = [
    'LAYERS B–D · COORDINATION · SHARED STATE · COMPOSITION',
    '',
    '  B Coordination — agent registry, ownership, interference detection',
    '  C Shared state — project / task / contribution store',
    '  D Composition — validate, integrate, rollback contributions',
    '',
  ];
  const summary = {};
  for (const n of [5, 10, 25]) {
    const rows = bench.results.filter((r) => r.agents === n);
    const avg = (arm, key) => rows.reduce((s, r) => s + r.arms[arm][key], 0) / rows.length;
    const aConflicts = avg('A', 'mergeConflicts');
    const cConflicts = avg('C', 'mergeConflicts');
    const aUseful = avg('A', 'usefulCompletedTasks');
    const cUseful = avg('C', 'usefulCompletedTasks');
    const cComp = avg('C', 'successfulCompositions');
    lines.push(
      `  n=${n} agents`,
      `    Arm A conventional branches: conflicts ${aConflicts.toFixed(1)} · useful ${aUseful.toFixed(1)}`,
      `    Arm C FractiSI B–D:           conflicts ${cConflicts.toFixed(1)} · useful ${cUseful.toFixed(1)} · compositions ${cComp.toFixed(1)}`,
    );
    summary[`n${n}`] = { aConflicts, cConflicts, aUseful, cUseful, cComp };
  }
  lines.push(
    '',
    '  → Layer A alone densifies. Layers B–D change how fleets collide and compose.',
    '    (In-process platform simulation — not a production CapEx claim.)',
  );
  return base(m, {
    problem: 'Parallel agents collide at merge when isolation meets a blind integrate.',
    opportunity: 'Layers B–D coordinate ownership and compose contributions before ship.',
    fractisi: [
      'Components: Coordination (B) · Shared state (C) · Composition (D).',
      'Beside IDE tools you already run — Cursor / Claude Code / VS Code / Git.',
    ],
    lines,
    metrics: { ...summary, component: 'platform_bcd' },
  });
}

function run7() {
  const m = meta('7');
  const multi = runMultiSessionDemo(24);
  const budget = multi.conventional.bytes;
  const conventionalAgents = multi.conventional.sessions;
  const bytesPerShared = multi.prefixReuse.bytes / Math.max(1, multi.prefixReuse.sessions);
  const sharedAgentsFit = Math.floor(budget / Math.max(1, bytesPerShared));
  const densityGain = sharedAgentsFit / conventionalAgents;
  return base(m, {
    problem: 'Duplicated context burns the budget before specialized agent work begins.',
    opportunity: 'Tiny Footprint density + Git awareness; cloud deploy unlocks as paid Layer F.',
    fractisi: [
      'Layer A density — more agents inside the same representation budget.',
      'Layer E Git awareness — commits / worktrees on your repo (Community).',
      'Layer F Deploy — approval-gated publish; paid (Team · Enterprise · Cloud).',
    ],
    lines: [
      'DENSITY · LAYER E GIT · LAYER F DEPLOY',
      '',
      `  Budget (conventional 24-session pack): ${budget} B`,
      `  Conventional agents in that pack:     ${conventionalAgents}`,
      `  Tiny Footprint agents in same budget: ${sharedAgentsFit}`,
      `  Density gain:                         ${densityGain.toFixed(1)}×`,
      `  Shared pack size:                     ${multi.prefixReuse.bytes} B`,
      '',
      '  Community (free)',
      '    · GitHub clone = signup · Layer A–E local path · Git commits',
      '    · Cloud token + FRACTISI_EDITION unlock Layer F deploy (paid)',
      '',
      '  Pricing  https://fractisi.vercel.app/product/pricing/',
      '  Papers   Tiny Gateway Rhyming Templates · Tiny Footprint Multi-Agent · Exp 002',
    ],
    metrics: {
      budgetBytes: budget,
      conventionalAgents,
      sharedAgentsFit,
      densityGain,
      sharedBytes: multi.prefixReuse.bytes,
      component: 'density_ef',
    },
  });
}

const RUNNERS = Object.freeze({
  primer: runPrimer,
  0: runPrimer,
  1: run1,
  2: run2,
  3: run3,
  4: run4,
  5: run5,
  6: run6,
  7: run7,
});

export function listTestDriveSteps() {
  return STEP_CATALOG.map((s) => ({ ...s, next: NEXT[s.id] }));
}

/** @param {string|number} stepId */
export function runTestDriveStep(stepId) {
  const key = String(stepId).toLowerCase();
  const runner = RUNNERS[key];
  if (!runner) {
    const err = new Error(`Unknown testdrive step: ${stepId}`);
    err.code = 'unknown_step';
    throw err;
  }
  const started = Date.now();
  const result = runner();
  return {
    ok: true,
    ms: Date.now() - started,
    step: result,
  };
}
