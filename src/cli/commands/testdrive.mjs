/**
 * FractiSI Multi-Agent Test Drive — slide-aligned steps.
 *
 *   node scripts/tiny.mjs testdrive           # full tour
 *   node scripts/tiny.mjs testdrive list
 *   node scripts/tiny.mjs testdrive primer    # cold start (step 0)
 *   node scripts/tiny.mjs testdrive 1 … 7 | git     # one product-layer demo
 *
 * Narrative source of truth: src/testdrive/run-step.mjs
 * (Infinite Octaves · Tiny Gateway Rhyming Templates · Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy)
 */
import { doctor } from './doctor.mjs';
import { install } from './install.mjs';
import { listTestDriveSteps, runTestDriveStep } from '../../testdrive/run-step.mjs';

function say(lines) {
  for (const line of lines) console.log(line);
}

function hr() {
  console.log('');
  console.log('─'.repeat(64));
  console.log('');
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

function printStep(out) {
  const s = out.step;
  hr();
  say([
    `STEP ${s.n} · ${s.title}`,
    `  Layer:      ${s.layer}`,
    `  Component:  ${s.component}`,
  ]);
  if (s.problem) {
    say([
      '',
      '  PROBLEM & OPPORTUNITY',
      `    Problem:      ${s.problem}`,
      `    Opportunity:  ${s.opportunity}`,
    ]);
  }
  if (s.fractisi?.length) {
    say(['', '  FRACTISI MULTI-AGENT', ...s.fractisi.map((b) => `    · ${b}`)]);
  }
  say(['', `  ▸ live lab · ${out.ms} ms`, '']);
  for (const line of s.lines) console.log(`  ${line}`);
  const r = s.readout;
  if (r && (r.done || r.implication || r.beyondTheory)) {
    say([
      '',
      '  PLAIN-LANGUAGE REPORT',
      r.done ? `    What we did:       ${r.done}` : null,
      r.tested ? `    What we measured: ${r.tested}` : null,
      r.summary ? `    What came back:   ${r.summary}` : null,
      r.also ? `    Also:             ${r.also}` : null,
      r.implication ? `    What it means:    ${r.implication}` : null,
      r.beyondTheory ? `    Beyond theory:    ${r.beyondTheory}` : null,
      '',
    ].filter(Boolean));
  }
  if (s.next) {
    say(['', `  Next: node scripts/tiny.mjs testdrive ${s.next}`, '']);
  } else {
    say([
      '',
      '  Tour complete · Community signup on the closing talk slide / Test Drive finish.',
      '  Test Drive: https://fractisi.vercel.app/test-drive/',
      '',
    ]);
  }
}

async function runOne(ctx, id) {
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  banner('Test Drive', `Step ${id}`);
  printStep(await runTestDriveStep(id));
  return 0;
}

function listSteps() {
  banner('Test Drive · steps', 'Product-aligned · Infinite Octaves → Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy');
  say([
    '  node scripts/tiny.mjs testdrive           # full tour',
    '  node scripts/tiny.mjs testdrive primer',
    '  node scripts/tiny.mjs testdrive 1 … 7 | git',
    '  Test Drive (browser): https://fractisi.vercel.app/test-drive/',
    '',
  ]);
  for (const s of listTestDriveSteps()) {
    say([`  ${String(s.n).padStart(2)}  ${s.title}`, `      ${s.short} · ${s.component}`]);
  }
  say(['']);
  return 0;
}

export const TESTDRIVE_STEPS = Object.freeze(
  Object.fromEntries(
    listTestDriveSteps().flatMap((s) => {
      const entry = { id: s.id, n: s.n, title: s.title, run: (ctx) => runOne(ctx, s.id) };
      return s.id === 'primer'
        ? [['primer', entry], ['0', entry]]
        : [[s.id, entry]];
    }),
  ),
);

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

  banner('FractiSI Multi-Agent · Test Drive', 'Infinite Octaves · Tiny Gateway · Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy');
  say([
    '  Product tour: primer → Tiny Footprint → Rhyming Templates → selective reconstruct',
    '  → coordination/composition → density / Git / paid deploy.',
    '  Test Drive: https://fractisi.vercel.app/test-drive/',
    '',
  ]);
  for (const key of ['primer', '1', '2', '3', '4', '5', '6', 'git', '7']) {
    const code = await runOne(ctx, key);
    if (code !== 0) return code;
  }
  return 0;
}
