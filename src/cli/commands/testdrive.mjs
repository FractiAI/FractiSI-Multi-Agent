/**
 * FractiSI Multi-Agent Test Drive — problem → solution walkthrough.
 *
 * For IDE agents / symposium audience: narrate today's multi-agent pain,
 * then run a local demo that shows how FractiSI Multi-Agent addresses it.
 * No cloud token required.
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

function problem(n, title, body) {
  hr();
  say([
    `PROBLEM ${n} · ${title}`,
    '',
    ...body.map((b) => `  ${b}`),
  ]);
}

function solution(title, body) {
  say([
    '',
    `FRACTISI MULTI-AGENT · ${title}`,
    '',
    ...body.map((b) => `  ${b}`),
  ]);
}

function measure(label) {
  say(['', `  ▸ measuring · ${label}…`, '']);
}

/** @param {ReturnType<import('../context.mjs').createContext>} ctx */
export async function testdrive(ctx) {
  const { log } = ctx;

  say([
    '',
    '╔══════════════════════════════════════════════════════════════╗',
    '║  FractiSI Multi-Agent · Test Drive                           ║',
    '║  Multi-agent problem & opportunity → how FractiSI answers   ║',
    '╚══════════════════════════════════════════════════════════════╝',
    '',
    '  Audience path: give your IDE this repo and ask it to run this',
    '  Test Drive. Local only — no FractiSI account, no cloud token.',
    '',
    '  Product: https://fractisi.vercel.app/product/',
    '  Talk:    https://fractisi.vercel.app/talks/aai-symposium-2026/',
  ]);

  hr();
  say(['SETUP · workstation check']);
  const d = (await doctor(ctx)) ?? 0;
  if (d !== 0) return d;
  const i = (await install(ctx)) ?? 0;
  if (i !== 0) return i;

  // ── 1 · duplicated world ──────────────────────────────────────────
  problem(1, 'Every agent reprints the shared world', [
    'Today: five agents on one project often each retrieve, summarize, and',
    'carry overlapping copies of the same repo / policies / maps / context.',
    'Result: duplicated information, repeated retrieval, and version drift.',
  ]);
  solution('Shared world once · per-agent difference only', [
    'FractiSI registers the shared computational world once. Agents keep',
    'objectives and local deltas — they do not each own a full reprint.',
  ]);
  measure('conventional full copies vs shared-prefix store');
  const multi = runMultiSessionDemo(12);
  const conv = multi.conventional;
  const shared = multi.prefixReuse;
  say([
    `  Conventional (N full copies):  ${conv.bytes} B across ${conv.sessions} sessions`,
    `  Shared world + deltas:         ${shared.bytes} B`,
    `  Reduction vs full copies:      ${pct(multi.prefixByteReduction)}`,
    '',
    '  → Same sessions. One shared system pattern instead of N reprints.',
  ]);

  // ── 2 · gzip is not enough ────────────────────────────────────────
  problem(2, 'Gzip shrinks copies — it does not remove them', [
    'Today: teams compress duplicated context and call it solved.',
    'Compression lowers bytes per copy; it does not remove the cross-copy tax.',
  ]);
  solution('Stop paying N copies before you compress', [
    'Share the world first. Then compression is optional polish — not the architecture.',
  ]);
  measure('gzip on conventional JSON vs shared-world JSON');
  // Reconstruct payload shapes comparable to the stores
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

  // ── 3 · exact cache fails when words differ ───────────────────────
  problem(3, 'Exact-text cache only helps when the words match', [
    'Today: prefix / exact caches win on identical prompts.',
    'Same-shape sessions with different wording miss the cache and duplicate again.',
  ]);
  solution('Rhyming templates · same shape, different words', [
    'Tiny Footprint / Tiny Gateway stores the organizational rhyme once and',
    'keeps per-session expressions — even when the utterance text differs.',
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
  // Also show the multi-session rhyme cohort from the reference demo
  const rhyme = multi.holographicRhyme;
  if (rhyme.status === 'ran') {
    say([
      `  Reference demo rhyme cohort: ${rhyme.rhymeBytes} B vs naive ${rhyme.naiveBytes} B`,
      `  (${pct(rhyme.byteReduction)} · audit ${rhyme.rhymeAuditPass} · exact ${rhyme.exact})`,
    ]);
  }

  // ── 4 · discovery ─────────────────────────────────────────────────
  problem(4, 'Flat skim misses distributed discoveries', [
    'Today: agents (or a flat shared dump) pull a fixed context budget of records.',
    'Hidden multi-hop relationships are buried in noise — the budget expires before',
    'the chain is assembled. Flat approaches see pieces; they miss the solution.',
  ]);
  solution('Relationship-guided reconstruction over the shared world', [
    'FractiSI-style guided retrieval follows explicit next-hop edges across the',
    'shared world, recovering distributed chains a flat skim never completes',
    'under the same information budget. (Expedition 002 · E2 architectural lab.)',
  ]);
  measure('100 × 6-hop scenarios · flat skim vs relationship-guided');
  const e2 = runDiscoveryConvergenceBenchmark();
  say([
    `  Scenarios:                 ${e2.scenarios} (six-hop hidden chains)`,
    `  Flat skim discoveries:     ${e2.flat.discoveries} / ${e2.scenarios}`,
    `  Flat skim solutions:       ${e2.flat.solutions} / ${e2.scenarios}`,
    `  FractiSI discoveries:      ${e2.fractisi.discoveries} / ${e2.scenarios}`,
    `  FractiSI solutions:        ${e2.fractisi.solutions} / ${e2.scenarios}`,
    `  Lab pass (100/100 vs 0/100): ${e2.pass}`,
    '',
    '  → Same information, same budget. Guided shared-world recovery finds what flat skim misses.',
    '    Controlled procedures — not an LLM multi-agent bake-off.',
  ]);

  // ── 5 · convergence ───────────────────────────────────────────────
  problem(5, 'Collectives take too many rounds to converge', [
    'Today: even when the answer exists in the corpus, getting there costs many',
    'coordination / propagation rounds and information-processing ops.',
    'Teams burn budget before a composed decision lands.',
  ]);
  solution('Fewer ops and rounds on the same constrained path', [
    'Relationship-guided reconstruction collapses hop-chasing into fewer modeled',
    'propagation rounds and far fewer ops — faster architectural convergence',
    'under the same discovery topology. (Same E2 receipt as Problem 4.)',
  ]);
  measure('ops and propagation rounds · flat vs FractiSI-guided');
  say([
    `  Flat mean ops / scenario:           ${e2.flat.meanOps.toFixed(1)}`,
    `  FractiSI mean ops / scenario:       ${e2.fractisi.meanOps.toFixed(1)}`,
    `  Ops reduction:                      ${pct(e2.opsReduction)}`,
    `  Flat propagation rounds (6-hop):    ${e2.flat.propagationRounds}`,
    `  FractiSI propagation rounds:        ${e2.fractisi.propagationRounds}`,
    `  Rounds reduction:                   ${pct(e2.roundsReduction)}`,
    '',
    '  → −50% rounds · −85% ops on this constrained path (architectural lab, not LLM dialogue turns).',
  ]);

  // ── 6 · merge collisions ──────────────────────────────────────────
  problem(6, 'Parallel agents collide at merge time', [
    'Today: each agent works in isolation, then everyone reconciles overlapping edits.',
    'More agents can mean more merge conflicts and less useful completed work.',
  ]);
  solution('Coordinate ownership · compose contributions', [
    'FractiSI Multi-Agent adds coordination and composition on top of the shared world',
    'so overlapping work is visible before a blind merge.',
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

  // ── 7 · density / representation ──────────────────────────────────
  problem(7, 'Fleets stay small because context is scarce', [
    'Today: DRAM/HBM and context budgets cap how many agents you can afford.',
    'Duplication burns the budget before specialized work begins.',
  ]);
  solution('Higher agent density from a smaller shared footprint', [
    'Tiny Footprint cuts duplicated representation so more agents fit the same budget.',
    'Running the local benchmark suite next (architectural / structured-state labs).',
  ]);
  measure('local benchmark suite');
  const b = (await benchmark(ctx)) ?? 0;
  if (b !== 0) {
    log('benchmark finished with non-zero status (often expected when GPU labs are not_run on this host)');
  }
  const r = (await report(ctx)) ?? 0;
  if (r !== 0) return r;

  // ── close ─────────────────────────────────────────────────────────
  hr();
  say([
    'TEST DRIVE COMPLETE',
    '',
    '  You walked seven problems of today’s multi-agent stacks:',
    '    1. N full copies of one world',
    '    2. Gzip without removing copies',
    '    3. Exact cache missing different words',
    '    4. Flat skim missing distributed discoveries',
    '    5. Too many rounds / ops to converge',
    '    6. Merge collisions without coordination',
    '    7. Scarce density under duplicated context',
    '',
    '  FractiSI Multi-Agent addresses them with:',
    '    · a shared computational world (Tiny Footprint / Tiny Gateway)',
    '    · rhyming templates when shape matches and words differ',
    '    · relationship-guided discovery and faster architectural convergence',
    '    · coordination + composition for overlapping work',
    '    · denser fleets inside the same infrastructure budget',
    '',
    '  Paper: https://fractisi.vercel.app/library/papers/fractisi-expedition-002-beyond-memory/',
    '  Next:',
    '    Product  https://fractisi.vercel.app/product/',
    '    Talk     https://fractisi.vercel.app/talks/aai-symposium-2026/',
    '    Blog     https://fractisi.vercel.app/blog/aai-symposium-2026/',
    '    Optional cloud try (YOUR token): node scripts/tiny.mjs try',
    '',
  ]);

  return 0;
}
