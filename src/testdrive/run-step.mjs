/**
 * Shared Test Drive step runners — CLI, self-paced web, and /api/testdrive.
 * Returns structured results (no doctor/install; safe for serverless).
 */
import { gzipSync } from 'node:zlib';
import { runMultiSessionDemo } from '../workloads/multi-session.mjs';
import { compareRhymeToCache, differingWordSessions } from '../experiments/rhyme-vs-cache.mjs';
import { runDiscoveryConvergenceBenchmark } from '../experiments/expedition-002-discovery.mjs';
import { runComparativeBench } from '../platform/comparative-bench.mjs';

function pct(x) {
  return `${(Number(x) * 100).toFixed(1)}%`;
}

function gzipJsonBytes(value) {
  return gzipSync(Buffer.from(JSON.stringify(value), 'utf8')).length;
}

function utf8Bytes(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

/** @typedef {{ id: string, n: number, title: string, problem: string, opportunity: string, fractisi: string[], lines: string[], metrics?: Record<string, unknown>, next?: string }} StepResult */

export const STEP_CATALOG = Object.freeze([
  { id: 'primer', n: 0, title: 'Cold start primer', short: 'What FractiSI is' },
  { id: '1', n: 1, title: 'One world, many copies', short: 'N copies → shared + deltas' },
  { id: '2', n: 2, title: 'Gzip is not an architecture', short: 'Share first, then compress' },
  { id: '3', n: 3, title: 'Exact cache vs rhyme', short: 'When words differ' },
  { id: '4', n: 4, title: 'Discovery', short: 'Flat skim misses' },
  { id: '5', n: 5, title: 'Convergence', short: 'Fewer rounds & ops' },
  { id: '6', n: 6, title: 'Merge collisions', short: 'Coordinate & compose' },
  { id: '7', n: 7, title: 'Agent density', short: 'More agents in budget' },
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
    problem: fields.problem || '',
    opportunity: fields.opportunity || '',
    fractisi: fields.fractisi || [],
    lines: fields.lines || [],
    metrics: fields.metrics || {},
    next: NEXT[meta.id],
    honesty:
      'Architectural / structured-state lab on the FractiSI server — not a CapEx guarantee, not an LLM bake-off.',
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
    fractisi: [
      'Shared computational world — one project / environment',
      'Tiny Footprint / Tiny Gateway — deltas, not N copies',
      'Agents — models, tools, roles on that world',
      'Coordination + composition — ownership, conflicts, results',
    ],
    lines: [
      'FractiSI Multi-Agent is shared-world coordination for agent fleets.',
      'Not another foundation model. Not a Cursor / Claude Code replacement.',
      'It sits beside the tools you already run.',
      '',
      'This self-paced walkthrough runs each demonstration live and prints the numbers.',
      'No IDE required. No FractiSI account. No cloud token.',
    ],
    metrics: { mode: 'primer' },
  });
}

function run1() {
  const m = meta('1');
  const multi = runMultiSessionDemo(12);
  return base(m, {
    problem: 'Every agent reprints overlapping copies of the same world.',
    opportunity: 'One shared world; specialized agents keep only what differs.',
    fractisi: ['Register the shared world once. Agents keep objectives and local deltas.'],
    lines: [
      `Conventional (N full copies):  ${multi.conventional.bytes} B across ${multi.conventional.sessions} sessions`,
      `Shared world + deltas:         ${multi.prefixReuse.bytes} B`,
      `Reduction vs full copies:      ${pct(multi.prefixByteReduction)}`,
      '',
      '→ Same sessions. One shared system pattern instead of N reprints.',
    ],
    metrics: {
      conventionalBytes: multi.conventional.bytes,
      sharedBytes: multi.prefixReuse.bytes,
      reduction: multi.prefixByteReduction,
      sessions: multi.conventional.sessions,
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
    problem: 'Gzip shrinks copies — it does not remove the cross-copy tax.',
    opportunity: 'Share the world first; compression becomes optional polish.',
    fractisi: ['Stop paying N copies before you compress.'],
    lines: [
      `Conventional JSON:     ${rawConv} B  → gzip ${gzConv} B`,
      `Shared-world JSON:     ${rawShared} B  → gzip ${gzShared} B`,
      `Shared still ahead after gzip: ${gzShared < gzConv ? 'yes' : 'no'} (${gzConv - gzShared} B less)`,
      '',
      '→ Gzip helps both arms. Sharing the world removes the N-copy structure.',
    ],
    metrics: { rawConv, gzConv, rawShared, gzShared, sharedAhead: gzShared < gzConv },
  });
}

function run3() {
  const m = meta('3');
  const rhymeCmp = compareRhymeToCache(differingWordSessions(40));
  const multi = runMultiSessionDemo(12);
  const rhyme = multi.holographicRhyme;
  const lines = [
    `Sessions:              ${rhymeCmp.sessions} (same shape, different words)`,
    `Exact-text cache hits: ${rhymeCmp.exactTextHits} duplicate texts`,
    `Naive store:           ${rhymeCmp.naiveBytes} B`,
    `Exact-text cache:      ${rhymeCmp.cacheBytes} B`,
    `Rhyme store:           ${rhymeCmp.rhymeBytes} B`,
    `Rhyme vs cache:        ${pct(rhymeCmp.rhymeVersusCache)} smaller than exact cache`,
    `Exact rebuild:         ${rhymeCmp.equivalent}`,
    '',
    '→ When words differ, rhyme still shares structure. Exact cache mostly cannot.',
  ];
  if (rhyme?.status === 'ran') {
    lines.push(
      `Reference demo rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `(${pct(rhyme.byteReduction)} · audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    );
  }
  return base(m, {
    problem: 'Exact-text / prefix cache only helps when the words match.',
    opportunity: 'Same-shape sessions with different wording can still share structure.',
    fractisi: [
      'Rhyming templates store organization once; keep per-session expressions even when utterance text differs.',
    ],
    lines,
    metrics: {
      sessions: rhymeCmp.sessions,
      exactTextHits: rhymeCmp.exactTextHits,
      naiveBytes: rhymeCmp.naiveBytes,
      cacheBytes: rhymeCmp.cacheBytes,
      rhymeBytes: rhymeCmp.rhymeBytes,
      rhymeVersusCache: rhymeCmp.rhymeVersusCache,
    },
  });
}

function run4() {
  const m = meta('4');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Flat skim misses distributed multi-hop discoveries inside a fixed budget.',
    opportunity: 'Relationship-guided recovery finds chains flat approaches never assemble.',
    fractisi: [
      'Guided reconstruction follows next-hop edges across the shared world.',
      'Expedition 002 · E2 architectural lab (not an LLM bake-off).',
    ],
    lines: [
      `Scenarios:                 ${e2.scenarios} (six-hop hidden chains)`,
      `Flat skim discoveries:     ${e2.flat.discoveries} / ${e2.scenarios}`,
      `Flat skim solutions:       ${e2.flat.solutions} / ${e2.scenarios}`,
      `FractiSI discoveries:      ${e2.fractisi.discoveries} / ${e2.scenarios}`,
      `FractiSI solutions:        ${e2.fractisi.solutions} / ${e2.scenarios}`,
      `Lab pass (100/100 vs 0/100): ${e2.pass}`,
      '',
      '→ Same information, same budget. Guided recovery finds what flat skim misses.',
    ],
    metrics: {
      scenarios: e2.scenarios,
      flatDiscoveries: e2.flat.discoveries,
      fractisiDiscoveries: e2.fractisi.discoveries,
      pass: e2.pass,
    },
  });
}

function run5() {
  const m = meta('5');
  const e2 = runDiscoveryConvergenceBenchmark();
  return base(m, {
    problem: 'Collectives burn too many rounds and ops before a composed answer lands.',
    opportunity: 'Fewer modeled rounds and ops on the same constrained discovery path.',
    fractisi: [
      'Relationship-guided reconstruction collapses hop-chasing.',
      'Faster architectural convergence — not LLM dialogue-turn claims.',
    ],
    lines: [
      `Flat mean ops / scenario:           ${e2.flat.meanOps.toFixed(1)}`,
      `FractiSI mean ops / scenario:       ${e2.fractisi.meanOps.toFixed(1)}`,
      `Ops reduction:                      ${pct(e2.opsReduction)}`,
      `Flat propagation rounds (6-hop):    ${e2.flat.propagationRounds}`,
      `FractiSI propagation rounds:        ${e2.fractisi.propagationRounds}`,
      `Rounds reduction:                   ${pct(e2.roundsReduction)}`,
      '',
      '→ −50% rounds · −85% ops on this constrained path.',
    ],
    metrics: {
      opsReduction: e2.opsReduction,
      roundsReduction: e2.roundsReduction,
      flatOps: e2.flat.meanOps,
      fractisiOps: e2.fractisi.meanOps,
    },
  });
}

function run6() {
  const m = meta('6');
  const bench = runComparativeBench({ agentCounts: [5, 10, 25], runs: 3 });
  const lines = [];
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
      `n=${n} agents`,
      `  Conventional (A): conflicts ${aConflicts.toFixed(1)} · useful tasks ${aUseful.toFixed(1)}`,
      `  FractiSI (C):     conflicts ${cConflicts.toFixed(1)} · useful ${cUseful.toFixed(1)} · compositions ${cComp.toFixed(1)}`,
    );
    summary[`n${n}`] = { aConflicts, cConflicts, aUseful, cUseful, cComp };
  }
  lines.push(
    '',
    '→ Same tasks. Coordination changes conflict and completion shape.',
    '  (In-process simulation — not a production CapEx claim.)',
  );
  return base(m, {
    problem: 'Parallel agents collide at merge time as fleets grow.',
    opportunity: 'Coordinate ownership and compose contributions before blind merge.',
    fractisi: ['Coordination + composition on the shared world makes overlap visible early.'],
    lines,
    metrics: summary,
  });
}

function run7() {
  const m = meta('7');
  // Browser/serverless-friendly density demo (full GPU suite stays CLI-only).
  const multi = runMultiSessionDemo(24);
  const budget = multi.conventional.bytes;
  const conventionalAgents = multi.conventional.sessions;
  const sharedAgentsFit = Math.floor(budget / Math.max(1, multi.prefixReuse.bytes / multi.prefixReuse.sessions));
  const densityGain = sharedAgentsFit / conventionalAgents;
  return base(m, {
    problem: 'Fleets stay small because duplicated context burns the budget first.',
    opportunity: 'Higher agent density inside the same infrastructure budget.',
    fractisi: [
      'Tiny Footprint cuts duplicated representation so more agents fit.',
      'Self-paced density demo (full local GPU suite remains CLI: testdrive 7).',
    ],
    lines: [
      `Budget (conventional 24-session pack): ${budget} B`,
      `Conventional agents in that pack:     ${conventionalAgents}`,
      `Shared-world agents fitting same budget (approx): ${sharedAgentsFit}`,
      `Density gain vs full-copy pack:       ${densityGain.toFixed(1)}×`,
      `Shared pack size:                     ${multi.prefixReuse.bytes} B`,
      '',
      '→ Same information budget. Smaller shared representation → more agents.',
      '',
      'COMMUNITY (FREE)',
      '  Keep the GitHub clone · GitHub for commits · cloud deploy is paid (Team+).',
      '  Pricing: https://fractisi.vercel.app/product/pricing/',
    ],
    metrics: {
      budgetBytes: budget,
      conventionalAgents,
      sharedAgentsFit,
      densityGain,
      sharedBytes: multi.prefixReuse.bytes,
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
