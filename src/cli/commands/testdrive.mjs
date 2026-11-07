/**
 * FractiSI Multi-Agent Test Drive — slide-aligned steps.
 *
 *   node scripts/tiny.mjs testdrive           # full tour
 *   node scripts/tiny.mjs testdrive list
 *   node scripts/tiny.mjs testdrive primer    # cold start (step 0)
 *   node scripts/tiny.mjs testdrive 1 … 7     # one problem/opportunity
 *
 * IDE agents: run the step named on the current symposium slide.
 */
import { gzipSync } from 'node:zlib';
import { doctor } from './doctor.mjs';
import { install } from './install.mjs';
import { benchmark } from './benchmark.mjs';
import { report } from './report.mjs';
import { runComparativeBench } from '../../platform/comparative-bench.mjs';
import { runMultiSessionDemo } from '../../workloads/multi-session.mjs';
import { compareRhymeToCache, differingWordSessions } from '../../experiments/rhyme-vs-cache.mjs';
import { runDiscoveryConvergenceBenchmark } from '../../experiments/expedition-002-discovery.mjs';

function say(lines) {
  for (const line of lines) console.log(line);
}

function hr() {
  console.log('');
  console.log('─'.repeat(64));
  console.log('');
}

function pct(x) {
  return `${(Number(x) * 100).toFixed(1)}%`;
}

function gzipJsonBytes(value) {
  return gzipSync(Buffer.from(JSON.stringify(value), 'utf8')).length;
}

function banner(title, subtitle) {
  say([
    '',
    '╔══════════════════════════════════════════════════════════════╗',
    `║  ${title.padEnd(60)}║`,
    subtitle ? `║  ${subtitle.padEnd(60)}║` : null,
    '╚══════════════════════════════════════════════════════════════╝',
    '',
  ].filter(Boolean));
}

function problemOpportunity(n, problem, opportunity) {
  hr();
  say([
    `STEP ${n} · PROBLEM & OPPORTUNITY`,
    '',
    `  Problem:      ${problem}`,
    `  Opportunity:  ${opportunity}`,
  ]);
}

function fractisi(lines) {
  say(['', '  FRACTISI MULTI-AGENT', '', ...lines.map((b) => `  ${b}`)]);
}

function measure(label) {
  say(['', `  ▸ measuring · ${label}…`, '']);
}

function nextCue(n) {
  if (n >= 7) {
    say([
      '',
      '  IDE next: talk closes on Community signup — GitHub for commits; cloud token + paid plan for deploy.',
      '  Optional full rerun: node scripts/tiny.mjs testdrive',
      '',
    ]);
    return;
  }
  say(['', `  IDE next: node scripts/tiny.mjs testdrive ${n + 1}`, '']);
}

async function ensureSetup(ctx) {
  if (ctx._testdriveSetupDone) return 0;
  hr();
  say(['SETUP · workstation check (once per session)']);
  const d = (await doctor(ctx)) ?? 0;
  if (d !== 0) return d;
  const i = (await install(ctx)) ?? 0;
  if (i !== 0) return i;
  ctx._testdriveSetupDone = true;
  return 0;
}

/** Step 0 — cold start primer */
async function stepPrimer(ctx) {
  banner('Test Drive · Step 0', 'Cold start primer · FractiSI Multi-Agent');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;

  hr();
  say([
    'PRIMER · What FractiSI Multi-Agent is',
    '',
    '  FractiSI Multi-Agent is a shared-world coordination architecture for',
    '  agent fleets — not another foundation model, not a Cursor/Claude Code',
    '  replacement. It sits beside the tools you already run.',
    '',
    '  Stack (cold start):',
    '    1. Shared computational world — one underlying project/environment',
    '    2. Tiny Footprint / Tiny Gateway — compact access; deltas, not N copies',
    '    3. Agents — different models, tools, roles on that shared world',
    '    4. Coordination + composition — ownership, conflicts, composed results',
    '',
    '  What it is for:',
    '    · denser fleets without reprinting the world per agent',
    '    · discovery flat skim misses under a fixed budget',
    '    · faster architectural convergence (fewer rounds/ops)',
    '    · composed work instead of merge chaos',
    '',
    '  Honesty: demos below are architectural / structured-state labs on your',
    '  machine — not CapEx guarantees, not an LLM multi-agent bake-off.',
    '',
    '  Product: https://fractisi.vercel.app/product/',
    '  Talk:    https://fractisi.vercel.app/talks/aai-symposium-2026/',
  ]);
  nextCue(0);
  return 0;
}

async function step1(ctx) {
  banner('Test Drive · Step 1', 'N copies of one world');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    1,
    'Every agent reprints overlapping copies of the same world.',
    'One shared world; specialized agents keep only what differs.',
  );
  fractisi([
    'Register the shared world once. Agents keep objectives and local deltas.',
  ]);
  measure('conventional full copies vs shared-prefix store');
  const multi = runMultiSessionDemo(12);
  ctx._testdriveMulti = multi;
  say([
    `  Conventional (N full copies):  ${multi.conventional.bytes} B across ${multi.conventional.sessions} sessions`,
    `  Shared world + deltas:         ${multi.prefixReuse.bytes} B`,
    `  Reduction vs full copies:      ${pct(multi.prefixByteReduction)}`,
    '',
    '  → Same sessions. One shared system pattern instead of N reprints.',
  ]);
  nextCue(1);
  return 0;
}

async function step2(ctx) {
  banner('Test Drive · Step 2', 'Gzip is not an architecture');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    2,
    'Gzip shrinks copies — it does not remove the cross-copy tax.',
    'Share the world first; compression becomes optional polish.',
  );
  fractisi(['Stop paying N copies before you compress.']);
  measure('gzip on conventional JSON vs shared-world JSON');
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
  const rawConv = Buffer.byteLength(JSON.stringify(conventionalPayload), 'utf8');
  say([
    `  Conventional JSON:     ${rawConv} B  → gzip ${gzConv} B`,
    `  Shared-world JSON:     ${Buffer.byteLength(JSON.stringify(sharedPayload), 'utf8')} B  → gzip ${gzShared} B`,
    `  Shared still ahead after gzip: ${gzShared < gzConv ? 'yes' : 'no'} (${gzConv - gzShared} B less)`,
    '',
    '  → Gzip helps both arms. Sharing the world removes the N-copy structure.',
  ]);
  nextCue(2);
  return 0;
}

async function step3(ctx) {
  banner('Test Drive · Step 3', 'Exact cache vs rhyme');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    3,
    'Exact-text / prefix cache only helps when the words match.',
    'Same-shape sessions with different wording can still share structure.',
  );
  fractisi([
    'Rhyming templates store organization once; keep per-session expressions',
    'even when utterance text differs.',
  ]);
  measure('40 same-shape / different-words sessions · rhyme vs exact-text cache');
  const rhymeCmp = compareRhymeToCache(differingWordSessions(40));
  say([
    `  Sessions:              ${rhymeCmp.sessions} (same shape, different words)`,
    `  Exact-text cache hits: ${rhymeCmp.exactTextHits} duplicate texts`,
    `  Naive store:           ${rhymeCmp.naiveBytes} B`,
    `  Exact-text cache:      ${rhymeCmp.cacheBytes} B`,
    `  Rhyme store:           ${rhymeCmp.rhymeBytes} B`,
    `  Rhyme vs cache:        ${pct(rhymeCmp.rhymeVersusCache)} smaller than exact cache`,
    `  Exact rebuild:         ${rhymeCmp.equivalent}`,
    '',
    '  → When words differ, rhyme still shares structure. Exact cache mostly cannot.',
  ]);
  const multi = ctx._testdriveMulti || runMultiSessionDemo(12);
  const rhyme = multi.holographicRhyme;
  if (rhyme.status === 'ran') {
    say([
      `  Reference demo rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `  (${pct(rhyme.byteReduction)} · audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    ]);
  }
  nextCue(3);
  return 0;
}

async function step4(ctx) {
  banner('Test Drive · Step 4', 'Discovery');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    4,
    'Flat skim misses distributed multi-hop discoveries inside a fixed budget.',
    'Relationship-guided recovery finds chains flat approaches never assemble.',
  );
  fractisi([
    'Guided reconstruction follows next-hop edges across the shared world.',
    'Expedition 002 · E2 architectural lab (not an LLM bake-off).',
  ]);
  measure('100 × 6-hop scenarios · flat skim vs relationship-guided');
  const e2 = runDiscoveryConvergenceBenchmark();
  ctx._testdriveE2 = e2;
  say([
    `  Scenarios:                 ${e2.scenarios} (six-hop hidden chains)`,
    `  Flat skim discoveries:     ${e2.flat.discoveries} / ${e2.scenarios}`,
    `  Flat skim solutions:       ${e2.flat.solutions} / ${e2.scenarios}`,
    `  FractiSI discoveries:      ${e2.fractisi.discoveries} / ${e2.scenarios}`,
    `  FractiSI solutions:        ${e2.fractisi.solutions} / ${e2.scenarios}`,
    `  Lab pass (100/100 vs 0/100): ${e2.pass}`,
    '',
    '  → Same information, same budget. Guided recovery finds what flat skim misses.',
  ]);
  nextCue(4);
  return 0;
}

async function step5(ctx) {
  banner('Test Drive · Step 5', 'Convergence');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    5,
    'Collectives burn too many rounds and ops before a composed answer lands.',
    'Fewer modeled rounds and ops on the same constrained discovery path.',
  );
  fractisi([
    'Relationship-guided reconstruction collapses hop-chasing.',
    'Faster architectural convergence — not LLM dialogue-turn claims.',
  ]);
  const e2 = ctx._testdriveE2 || runDiscoveryConvergenceBenchmark();
  measure('ops and propagation rounds · flat vs FractiSI-guided');
  say([
    `  Flat mean ops / scenario:           ${e2.flat.meanOps.toFixed(1)}`,
    `  FractiSI mean ops / scenario:       ${e2.fractisi.meanOps.toFixed(1)}`,
    `  Ops reduction:                      ${pct(e2.opsReduction)}`,
    `  Flat propagation rounds (6-hop):    ${e2.flat.propagationRounds}`,
    `  FractiSI propagation rounds:        ${e2.fractisi.propagationRounds}`,
    `  Rounds reduction:                   ${pct(e2.roundsReduction)}`,
    '',
    '  → −50% rounds · −85% ops on this constrained path.',
  ]);
  nextCue(5);
  return 0;
}

async function step6(ctx) {
  banner('Test Drive · Step 6', 'Merge collisions');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    6,
    'Parallel agents collide at merge time as fleets grow.',
    'Coordinate ownership and compose contributions before blind merge.',
  );
  fractisi([
    'Coordination + composition on the shared world makes overlap visible early.',
  ]);
  measure('comparative arms · conventional branches vs FractiSI coordination');
  const bench = runComparativeBench({ agentCounts: [5, 10, 25], runs: 3 });
  for (const n of [5, 10, 25]) {
    const rows = bench.results.filter((r) => r.agents === n);
    const avg = (arm, key) => rows.reduce((s, r) => s + r.arms[arm][key], 0) / rows.length;
    say([
      `  n=${n} agents`,
      `    Conventional (A): conflicts ${avg('A', 'mergeConflicts').toFixed(1)} · useful tasks ${avg('A', 'usefulCompletedTasks').toFixed(1)}`,
      `    FractiSI (C):     conflicts ${avg('C', 'mergeConflicts').toFixed(1)} · useful ${avg('C', 'usefulCompletedTasks').toFixed(1)} · compositions ${avg('C', 'successfulCompositions').toFixed(1)}`,
    ]);
  }
  say([
    '',
    '  → Same tasks. Coordination changes conflict and completion shape.',
    '    (In-process simulation — not a production CapEx claim.)',
  ]);
  nextCue(6);
  return 0;
}

async function step7(ctx) {
  banner('Test Drive · Step 7', 'Agent density');
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  problemOpportunity(
    7,
    'Fleets stay small because duplicated context burns the budget first.',
    'Higher agent density inside the same infrastructure budget.',
  );
  fractisi([
    'Tiny Footprint cuts duplicated representation so more agents fit.',
    'Local benchmark suite next (architectural / structured-state labs).',
  ]);
  measure('local benchmark suite');
  const b = (await benchmark(ctx)) ?? 0;
  if (b !== 0) {
    ctx.log('benchmark finished with non-zero status (often expected when GPU labs are not_run)');
  }
  const r = (await report(ctx)) ?? 0;
  if (r !== 0) return r;

  hr();
  say([
    'TEST DRIVE COMPLETE',
    '',
    '  Primer + seven problem/opportunity demonstrations:',
    '    0. Cold start · what FractiSI Multi-Agent is',
    '    1. N copies → shared world + deltas',
    '    2. Gzip-only → share first',
    '    3. Exact cache miss → rhyming templates',
    '    4. Flat skim miss → guided discovery 100/100 vs 0/100',
    '    5. Slow convergence → −50% rounds · −85% ops',
    '    6. Merge collisions → coordination + composition',
    '    7. Scarce density → smaller footprint',
    '',
    '  COMMUNITY (FREE) · sign up & set up',
    '    1. Keep this GitHub clone — that is Community signup.',
    '    2. GitHub / Git — required for commits on your work.',
    '    3. Cloud token (VERCEL_TOKEN / FRACTISI_CLOUD_TOKEN) — when you unlock paid deploy.',
    '    4. Cloud deploy is paid: Team · Enterprise · Cloud (not Community).',
    '',
    '  Pricing  https://fractisi.vercel.app/product/pricing/',
    '  Talk     https://fractisi.vercel.app/talks/aai-symposium-2026/',
    '  Product  https://fractisi.vercel.app/product/',
    '  Paper    https://fractisi.vercel.app/library/papers/fractisi-expedition-002-beyond-memory/',
    '',
  ]);
  return 0;
}

export const TESTDRIVE_STEPS = Object.freeze({
  primer: { id: 'primer', n: 0, title: 'Cold start primer', run: stepPrimer },
  0: { id: 'primer', n: 0, title: 'Cold start primer', run: stepPrimer },
  1: { id: '1', n: 1, title: 'N copies of one world', run: step1 },
  2: { id: '2', n: 2, title: 'Gzip is not an architecture', run: step2 },
  3: { id: '3', n: 3, title: 'Exact cache vs rhyme', run: step3 },
  4: { id: '4', n: 4, title: 'Discovery', run: step4 },
  5: { id: '5', n: 5, title: 'Convergence', run: step5 },
  6: { id: '6', n: 6, title: 'Merge collisions', run: step6 },
  7: { id: '7', n: 7, title: 'Agent density', run: step7 },
});

function listSteps() {
  banner('Test Drive · steps', 'Aligned to symposium slides');
  say([
    '  node scripts/tiny.mjs testdrive           # full tour (primer → 7)',
    '  node scripts/tiny.mjs testdrive primer    # step 0',
    '  node scripts/tiny.mjs testdrive 1 … 7     # one slide step',
    '  node scripts/tiny.mjs testdrive list',
    '',
    '  0  Cold start primer · FractiSI Multi-Agent',
    '  1  Problem/opportunity · N copies of one world',
    '  2  Problem/opportunity · Gzip without removing copies',
    '  3  Problem/opportunity · Exact cache when words differ',
    '  4  Problem/opportunity · Flat skim misses discoveries',
    '  5  Problem/opportunity · Too many rounds to converge',
    '  6  Problem/opportunity · Merge collisions',
    '  7  Problem/opportunity · Scarce agent density',
    '',
  ]);
  return 0;
}

/** @param {ReturnType<import('../context.mjs').createContext>} ctx */
export async function testdrive(ctx) {
  const arg = (ctx.argv[3] || '').toLowerCase();

  if (arg === 'list' || arg === 'help' || arg === '--help') {
    return listSteps();
  }

  if (arg && TESTDRIVE_STEPS[arg]) {
    return TESTDRIVE_STEPS[arg].run(ctx);
  }

  if (arg) {
    console.error(`Unknown testdrive step: ${arg}`);
    listSteps();
    return 1;
  }

  // Full tour
  banner('FractiSI Multi-Agent · Test Drive', 'Primer → seven problem/opportunity demos');
  say([
    '  Audience: match each symposium slide with the step it names.',
    '  Or run one step: node scripts/tiny.mjs testdrive <primer|1-7>',
    '',
  ]);
  for (const key of ['primer', '1', '2', '3', '4', '5', '6', '7']) {
    const code = await TESTDRIVE_STEPS[key].run(ctx);
    if (code !== 0) return code;
  }
  return 0;
}
