/**
 * FractiSI Multi-Agent Test Drive — slide-aligned steps.
 *
 *   node scripts/tiny.mjs testdrive           # full tour
 *   node scripts/tiny.mjs testdrive list
 *   node scripts/tiny.mjs testdrive primer    # cold start (step 0)
 *   node scripts/tiny.mjs testdrive 1 … 7     # one product-layer demo
 *
 * Narrative source of truth: src/testdrive/run-step.mjs
 * (Infinite Octaves · Tiny Gateway Rhyming Templates · Tiny Footprint · Layers B–F)
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
  if (s.next) {
    say(['', `  IDE / self-paced next: node scripts/tiny.mjs testdrive ${s.next}`, '']);
  } else {
    say([
      '',
      '  Tour complete · Community signup on the closing talk slide / self-paced finish.',
      '  Self-paced: https://fractisi.vercel.app/test-drive/self-paced/',
      '',
    ]);
  }
}

async function runOne(ctx, id) {
  const setup = await ensureSetup(ctx);
  if (setup !== 0) return setup;
  banner('Test Drive', `Step ${id}`);
  printStep(runTestDriveStep(id));
  return 0;
}

function listSteps() {
  banner('Test Drive · steps', 'Product-aligned · Infinite Octaves → Tiny Footprint · Layers B–F');
  say([
    '  node scripts/tiny.mjs testdrive           # full tour',
    '  node scripts/tiny.mjs testdrive primer',
    '  node scripts/tiny.mjs testdrive 1 … 7',
    '  Self-paced (no IDE): https://fractisi.vercel.app/test-drive/self-paced/',
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

  banner('FractiSI Multi-Agent · Test Drive', 'Infinite Octaves · Tiny Gateway · Tiny Footprint · Layers B–F');
  say([
    '  Product tour: primer → Tiny Footprint → Rhyming Templates → selective reconstruct',
    '  → coordination/composition → density / Git / paid deploy.',
    '  Self-paced twin: https://fractisi.vercel.app/test-drive/self-paced/',
    '',
  ]);
  for (const key of ['primer', '1', '2', '3', '4', '5', '6', '7']) {
    const code = await runOne(ctx, key);
    if (code !== 0) return code;
  }
  return 0;
}
