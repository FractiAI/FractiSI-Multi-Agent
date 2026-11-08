/**
 * Shared Test Drive step runners — CLI, self-paced web, and /api/testdrive.
 * Narrative locked to the real FractiSI Multi-Agent product stack:
 * Infinite Octaves · holographic rhyme · Tiny Gateway Rhyming Templates ·
 * Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy.
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
    title: 'Tiny Footprint · shared world',
    short: 'Shared world once · agent deltas',
    layer: 'Tiny Footprint execution',
    component: 'Tiny Footprint · templates + deltas · selective reconstruct',
  },
  {
    id: '2',
    n: 2,
    title: 'Tiny Footprint · after gzip, architecture still matters',
    short: 'Gzip residual · share first',
    layer: 'Tiny Footprint execution',
    component: 'Tiny Footprint shared-world pack (vs N full copies)',
  },
  {
    id: '3',
    n: 3,
    title: 'Tiny Gateway · Rhyming Templates vs exact cache',
    short: 'Holographic rhyme · Net Zero → octaves',
    layer: 'Tiny Gateway™ engine',
    component: 'Rhyming Templates · Infinite Octaves · four-pillar holographic rhyme',
  },
  {
    id: '4',
    n: 4,
    title: 'Selective reconstruction · discovery',
    short: 'Relationship-guided recovery',
    layer: 'Tiny Gateway · nested vectors · selective reconstruct',
    component: 'Tiny Gateway selective reconstruction · Expedition 002 E2',
  },
  {
    id: '5',
    n: 5,
    title: 'Selective reconstruction · convergence',
    short: 'Fewer rounds & ops',
    layer: 'Tiny Gateway · nested vectors · selective reconstruct',
    component: 'Tiny Gateway guided path · Expedition 002 E2',
  },
  {
    id: '6',
    n: 6,
    title: 'Coordination · Shared state · Composition',
    short: 'Ownership · compose · no blind merge',
    layer: 'Coordination · Shared state · Composition',
    component: 'FractiSI platform · coord-bench isolated vs coordinated',
  },
  {
    id: '7',
    n: 7,
    title: 'Density · Git awareness · Deploy',
    short: 'More agents · Git · paid deploy',
    layer: 'Tiny Footprint density · Git awareness · Deploy (paid)',
    component: 'Tiny Footprint density · Git awareness · approval-gated Deploy',
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
    /** UI scoreboard: what was tested + headline result cards */
    readout: fields.readout || null,
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
      surfaces: [
        'Tiny Footprint',
        'Coordination',
        'Shared state',
        'Composition',
        'Git awareness',
        'Deploy',
      ],
      activeInferenceRhyme: 'possible_not_identity',
      chain: ARCHITECTURE_PRIMER.chain,
    },
  });
}

function run1() {
  const m = meta('1');
  const multi = runMultiSessionDemo(12);
  const reductionPct = pct(multi.prefixByteReduction);
  return base(m, {
    problem: 'Without Tiny Footprint, every agent reprints a full copy of the shared world.',
    opportunity: 'Tiny Footprint registers the world once; agents keep only local deltas.',
    fractisi: [
      'Component: Tiny Footprint (execution core, powered by Tiny Gateway™).',
      'Mechanism: shared templates + per-agent deltas + selective reconstruct.',
    ],
    lines: [
      'TINY FOOTPRINT',
      '',
      `  Conventional (N full copies):  ${multi.conventional.bytes} B across ${multi.conventional.sessions} sessions`,
      `  Tiny Footprint shared+deltas: ${multi.prefixReuse.bytes} B`,
      `  Reduction vs full copies:      ${reductionPct}`,
      '',
      '  → Same sessions. Tiny Footprint stops paying N reprints of one world.',
    ],
    metrics: {
      conventionalBytes: multi.conventional.bytes,
      sharedBytes: multi.prefixReuse.bytes,
      reduction: multi.prefixByteReduction,
      sessions: multi.conventional.sessions,
      component: 'tiny_footprint',
    },
    readout: {
      tested: `Byte cost for ${multi.conventional.sessions} agent sessions that share the same world context.`,
      baselineLabel: 'Old way · every agent gets a full copy',
      baselineValue: `${multi.conventional.bytes.toLocaleString()} bytes`,
      treatmentLabel: 'FractiSI · one shared world + small per-agent notes',
      treatmentValue: `${multi.prefixReuse.bytes.toLocaleString()} bytes`,
      headlineLabel: 'How much smaller',
      headlineValue: reductionPct,
      summary: `We compared ${multi.conventional.sessions} agents that all need the same shared context. The old way copied that context for every agent (${multi.conventional.bytes.toLocaleString()} bytes total). FractiSI kept one shared copy and only the small differences per agent (${multi.prefixReuse.bytes.toLocaleString()} bytes). That is a ${reductionPct} cut — same work, far less duplicate context.`,
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
      'Component: Tiny Footprint shared-world pack.',
      'Claim discipline: gzip residual is structural — not “compression theater.”',
    ],
    lines: [
      'TINY FOOTPRINT · AFTER GZIP',
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
    '  What we mean by Net Zero (locked · before rhyme):',
    '  Balanced zero, not nothing zero.',
    '  Net Zero (octave 0) = active-equilibrium root — cancel-to-balance under continuous activity,',
    '  not empty void / blank null / dead stop. Goldilocks ≡ Net Zero (viable band). Rhymes hang from here.',
    '  Not: nothing zero · climate-policy “net zero” · certified zero-watt SI · GR singularity proofs.',
    '',
    '  What we mean by rhyme (locked):',
    '  A holographic rhyme passes four pillars — repeating · self-similar · self-correcting · recursive —',
    '  rooted at Net Zero (octave 0 · active equilibrium) and ascending Infinite Octaves.',
    '  Not a rhyme: exact-text / prefix cache alone · schema-key match alone · brick-wall repetition ·',
    '  mid-octave nest without Net Zero.',
    '',
    `  Sessions:              ${rhymeCmp.sessions} (same organization, different words)`,
    `  Exact-text cache hits: ${rhymeCmp.exactTextHits} duplicate texts`,
    `  Naive store:           ${rhymeCmp.naiveBytes} B`,
    `  Exact-text cache:      ${rhymeCmp.cacheBytes} B`,
    `  Rhyming Template store:${rhymeCmp.rhymeBytes} B`,
    `  Rhyme vs exact cache:  ${pct(rhymeCmp.rhymeVersusCache)} smaller than exact cache`,
    `  Exact rebuild:         ${rhymeCmp.equivalent}`,
    '',
    '  → Exact / prefix cache needs identical words. Rhyming Templates reuse organization under the gate.',
  ];
  if (rhyme?.status === 'ran') {
    lines.push(
      `  Reference rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `  (${pct(rhyme.byteReduction)} · four-pillar audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    );
  }
  return base(m, {
    problem: 'Exact-text and prefix caches only help when the words match — and that is not our rhyme gate.',
    opportunity:
      'Tiny Gateway Rhyming Templates share organization when wording differs, under the four-pillar holographic rhyme gate.',
    fractisi: [
      'Component: Tiny Gateway™ Rhyming Templates (engine under Tiny Footprint).',
      'Rhyme: four pillars from Net Zero up Infinite Octaves — see /library/papers/holographic-rhyme/.',
      'Honesty: expands organizational near-dupe reuse — not “rhyme beats every prefix cache on live heap.”',
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
    readout: {
      tested: `${rhymeCmp.sessions} sessions with the same job shape written in different words.`,
      baselineLabel: 'Old way · exact-text cache hits',
      baselineValue: String(rhymeCmp.exactTextHits),
      treatmentLabel: 'FractiSI · shared organization store',
      treatmentValue: `${rhymeCmp.rhymeBytes.toLocaleString()} bytes`,
      headlineLabel: 'Smaller than exact-text cache store',
      headlineValue: pct(rhymeCmp.rhymeVersusCache),
      summary: `We ran ${rhymeCmp.sessions} sessions that do the same kind of work but use different wording. An exact-text cache only helps when the words match — here it got ${rhymeCmp.exactTextHits} hits. FractiSI still reused the shared organization (${rhymeCmp.rhymeBytes.toLocaleString()} bytes), ${pct(rhymeCmp.rhymeVersusCache)} smaller than keeping every paraphrase as its own exact-cache entry.`,
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
    readout: {
      tested: `${e2.scenarios} puzzles where the answer is buried six links deep. Same information budget for both methods.`,
      baselineLabel: 'Old way · flat skim',
      baselineValue: `${e2.flat.discoveries}/${e2.scenarios} found · ${e2.flat.solutions}/${e2.scenarios} solved`,
      treatmentLabel: 'FractiSI · follow the links',
      treatmentValue: `${e2.fractisi.discoveries}/${e2.scenarios} found · ${e2.fractisi.solutions}/${e2.scenarios} solved`,
      headlineLabel: 'Score',
      headlineValue: `${e2.fractisi.discoveries}/${e2.scenarios} vs ${e2.flat.discoveries}/${e2.scenarios}`,
      summary: `We hid answers behind six-step chains and gave both methods the same information budget. Flat skim (reading a text window) found ${e2.flat.discoveries} of ${e2.scenarios} and solved ${e2.flat.solutions}. FractiSI followed the relationships and found ${e2.fractisi.discoveries} of ${e2.scenarios}, solving ${e2.fractisi.solutions}. Same data — different search method.`,
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
    'COORDINATION · SHARED STATE · COMPOSITION',
    '',
    '  Coordination — agent registry, ownership, interference detection',
    '  Shared state — project / task / contribution store',
    '  Composition — validate, integrate, rollback contributions',
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
      `    Conventional branches: conflicts ${aConflicts.toFixed(1)} · useful ${aUseful.toFixed(1)}`,
      `    FractiSI coordinated:  conflicts ${cConflicts.toFixed(1)} · useful ${cUseful.toFixed(1)} · compositions ${cComp.toFixed(1)}`,
    );
    summary[`n${n}`] = { aConflicts, cConflicts, aUseful, cUseful, cComp };
  }
  lines.push(
    '',
    '  → Tiny Footprint densifies. Coordination · Shared state · Composition change how fleets collide and compose.',
    '    (In-process platform simulation — not a production CapEx claim.)',
  );
  return base(m, {
    problem: 'Parallel agents collide at merge when isolation meets a blind integrate.',
    opportunity: 'Coordination, Shared state, and Composition own paths and compose contributions before ship.',
    fractisi: [
      'Components: Coordination · Shared state · Composition.',
      'Beside IDE tools you already run — Cursor / Claude Code / VS Code / Git.',
    ],
    lines,
    metrics: { ...summary, component: 'platform_coord_compose' },
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
    opportunity: 'Tiny Footprint density + Git awareness; cloud Deploy unlocks on paid editions.',
    fractisi: [
      'Tiny Footprint density — more agents inside the same representation budget.',
      'Git awareness — commits / worktrees on your repo (Community).',
      'Deploy — approval-gated publish; paid (Team · Enterprise · Cloud).',
    ],
    lines: [
      'DENSITY · GIT AWARENESS · DEPLOY',
      '',
      `  Budget (conventional 24-session pack): ${budget} B`,
      `  Conventional agents in that pack:     ${conventionalAgents}`,
      `  Tiny Footprint agents in same budget: ${sharedAgentsFit}`,
      `  Density gain:                         ${densityGain.toFixed(1)}×`,
      `  Shared pack size:                     ${multi.prefixReuse.bytes} B`,
      '',
      '  Community (free)',
      '    · GitHub clone = signup · Tiny Footprint · Coordination · Shared state · Composition · Git awareness',
      '    · Cloud token + FRACTISI_EDITION unlock Deploy (paid)',
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
      component: 'density_git_deploy',
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
