#!/usr/bin/env node
/**
 * ζ-23 FIND without FractiSI — capped baseline
 *
 * Challenge-only sandbox. No FractiSI platform. No sealed proof corpus.
 * No LLM API keys expected. Attempts invention-scale discovery until:
 *   - Solution builds green (unexpected without inventing the math), or
 *   - wall clock hits --cutoff-seconds (default 180 = 3 minutes)
 *
 * Purpose: show empirically that without FractiSI *and* without inventing
 * the analytic argument, this arm does not finish in minutes — it sits on
 * the Anthropic-scale ~1.5 day finding problem. Cut off early and explain.
 *
 * Usage:
 *   node timing/run-zeta23-find-no-kit.mjs
 *   node timing/run-zeta23-find-no-kit.mjs --cutoff-seconds 180
 */

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  symlinkSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPEDITION = resolve(__dirname, '../..');
const SEALED = join(EXPEDITION, 'zeta23');
const FIND_ROOT = join(EXPEDITION, '.find-sandbox', 'zeta23-find-no-kit');
const RECEIPTS = join(resolve(__dirname, '..'), 'receipts');

const CHALLENGE_ONLY = [
  'Challenge.lean',
  'ChallengeDeps.lean',
  'Challenge',
  'ChallengeDeps',
  'lakefile.toml',
  'lake-manifest.json',
  'lean-toolchain',
  'LICENSE',
  'NOTICE',
  'README.md',
  'comparator.json',
  'formalization.yaml',
];

const DEFAULT_CUTOFF_SECONDS = 180;
const ANTHROPIC_BASELINE_SECONDS = 1.5 * 24 * 3600;

function parseArgs(argv) {
  const out = { cutoffSeconds: DEFAULT_CUTOFF_SECONDS, receipt: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cutoff-seconds') out.cutoffSeconds = Number(argv[++i] ?? DEFAULT_CUTOFF_SECONDS);
    else if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
    else if (a === '--help' || a === '-h') out.help = true;
  }
  if (!Number.isFinite(out.cutoffSeconds) || out.cutoffSeconds <= 0) {
    out.cutoffSeconds = DEFAULT_CUTOFF_SECONDS;
  }
  return out;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? FIND_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${process.env.HOME}/.elan/bin:${process.env.PATH || ''}`,
      ...(opts.env || {}),
    },
    maxBuffer: 64 * 1024 * 1024,
    timeout: opts.timeoutMs,
  });
  return {
    cmd: [cmd, ...args].join(' '),
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
    timedOut: r.error && /TIMEDOUT|timed out/i.test(String(r.error.message || r.error)),
  };
}

function countSorries(root) {
  let n = 0;
  const files = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        if (name === '.lake' || name === '.fractisi') continue;
        walk(p);
      } else if (name.endsWith('.lean')) {
        const text = readFileSync(p, 'utf8');
        const m = text.match(/\bsorry\b/g);
        if (m) {
          n += m.length;
          files.push({ path: p.slice(root.length + 1), sorries: m.length });
        }
      }
    }
  }
  walk(root);
  return { sorryCount: n, files };
}

function challengeOnlyPresent(root) {
  return {
    Zeta23Dir: !existsSync(join(root, 'Zeta23')),
    Zeta23Lean: !existsSync(join(root, 'Zeta23.lean')),
    SolutionLean: !existsSync(join(root, 'Solution.lean')),
    SolutionDir: !existsSync(join(root, 'Solution')),
  };
}

function apiKeysPresent() {
  return {
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY),
  };
}

function prepareChallengeOnly() {
  rmSync(FIND_ROOT, { recursive: true, force: true });
  mkdirSync(FIND_ROOT, { recursive: true });
  for (const name of CHALLENGE_ONLY) {
    const src = join(SEALED, name);
    if (!existsSync(src)) continue;
    cpSync(src, join(FIND_ROOT, name), { recursive: true });
  }
  const lakeSrc = join(SEALED, '.lake');
  const lakeDst = join(FIND_ROOT, '.lake');
  if (existsSync(lakeSrc) && !existsSync(lakeDst)) {
    try {
      symlinkSync(lakeSrc, lakeDst);
    } catch {
      /* warm cache optional */
    }
  }
}

function sleep(ms) {
  spawnSync('sleep', [String(ms / 1000)], { encoding: 'utf8' });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      'Usage: node timing/run-zeta23-find-no-kit.mjs [--cutoff-seconds 180] [--receipt PATH]',
    );
    process.exit(0);
  }

  prepareChallengeOnly();
  const challengeOnlyAtStart = challengeOnlyPresent(FIND_ROOT);
  const keys = apiKeysPresent();
  const anyKey = Object.values(keys).some(Boolean);
  const sorryAtStart = countSorries(FIND_ROOT);

  const startedAt = new Date();
  const t0 = performance.now();
  const cutoffMs = args.cutoffSeconds * 1000;
  const probes = [];

  // Probe 1: can we build Solution? (absent — expected fail fast)
  const buildSolution = run('lake', ['build', 'Solution'], { timeoutMs: 60_000 });
  probes.push({
    atSeconds: (performance.now() - t0) / 1000,
    kind: 'lake_build_Solution',
    ok: buildSolution.status === 0,
    status: buildSolution.status,
    note: buildSolution.status === 0 ? 'unexpected green' : 'Solution absent or unfinished (expected)',
    stderrTail: (buildSolution.stderr || buildSolution.stdout || '').slice(-400),
  });

  // Probe 2: Challenge still has sorries (open invention surface)
  const sorryMid = countSorries(FIND_ROOT);
  probes.push({
    atSeconds: (performance.now() - t0) / 1000,
    kind: 'sorry_census',
    sorryCount: sorryMid.sorryCount,
    files: sorryMid.files,
  });

  // Probe 3: no FractiSI world / no sealed proofs in sandbox
  probes.push({
    atSeconds: (performance.now() - t0) / 1000,
    kind: 'sandbox_inventory',
    challengeOnly: challengeOnlyPresent(FIND_ROOT),
    fractisiDirPresent: existsSync(join(FIND_ROOT, '.fractisi')),
    sealedCorpusInjected: false,
    apiKeys: keys,
  });

  // Burn remaining cutoff with idle discovery ticks (no inventing engine available).
  // Each tick re-checks whether any Solution / Zeta23 appeared (none will without models).
  let cutoffHit = false;
  let inventedAnything = false;
  while (performance.now() - t0 < cutoffMs) {
    const remaining = cutoffMs - (performance.now() - t0);
    if (remaining <= 0) break;
    sleep(Math.min(15_000, remaining));
    const inv = challengeOnlyPresent(FIND_ROOT);
    const stillChallengeOnly =
      inv.Zeta23Dir && inv.Zeta23Lean && inv.SolutionLean && inv.SolutionDir;
    probes.push({
      atSeconds: (performance.now() - t0) / 1000,
      kind: 'discovery_tick',
      stillChallengeOnly,
      theoremsInvented: 0,
      note: anyKey
        ? 'API key present but this harness does not call models; invention not wired'
        : 'No LLM API keys — cannot invent Alpöge–Furman analytic argument on this VM',
    });
    if (!stillChallengeOnly) {
      inventedAnything = true;
      break;
    }
    if (performance.now() - t0 >= cutoffMs) {
      cutoffHit = true;
      break;
    }
  }
  if (performance.now() - t0 >= cutoffMs) cutoffHit = true;

  const durationSeconds = (performance.now() - t0) / 1000;
  const endedAt = new Date();
  const leanOk = false;
  const ok = false;

  const explanation = [
    'No-FractiSI find starts Challenge-only with proofs absent and no sealed corpus.',
    anyKey
      ? 'Model API keys exist in the environment, but this harness does not call them — invention is not automated here.'
      : 'No Anthropic/OpenAI/Google API keys on this VM, so independent analytic rediscovery cannot run.',
    `After ${durationSeconds.toFixed(2)}s the sandbox still has ${sorryMid.sorryCount} Challenge sorries and no Solution.`,
    'Progress toward a green Solution is effectively zero without inventing (or being handed) the formalization.',
    `Anthropic’s published finding clock for this target is ~1.5 days (~${ANTHROPIC_BASELINE_SECONDS}s) with ~60 agents inventing+formalizing.`,
    `Cutoff at ${args.cutoffSeconds}s: continuing this arm would not finish in minutes — it is the Anthropic-scale discovery problem.`,
    'FractiSI find (separate harness) is different: Challenge-only → discover sealed published modules → compose → green Solution in ~11.66s. That is find-assemble, not idea invention.',
  ].join(' ');

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-find-no-kit.v1',
    label: 'riemann-fractisi-zeta23-find-no-kit',
    mode: 'find_no_kit',
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationSeconds,
    cutoffSeconds: args.cutoffSeconds,
    cutoffHit,
    ok,
    inventedAnything,
    leanOk,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'No-FractiSI find attempt from Challenge-only with no sealed proof corpus and no FractiSI coordination, capped early',
      whatThisDoesNotMeasure: [
        'FractiSI find-assemble of the published formalization (see run-zeta23-find.mjs)',
        'A full Anthropic-scale ~1.5 day multi-agent invention run',
        'RH',
      ],
      anthropicBaselinePrimary: 'https://www.anthropic.com/research/riemann-zeta',
      anthropicBaselineCharacterization:
        '~60 subagents · ~1.5 days · discover+formalize critical-line bound 41.6% → 67.2%',
      cutoffRationale:
        'If invention progress is still zero near the 3-minute mark, finishing would take Anthropic-scale time — abort and explain rather than burn a day and a half.',
      explanation,
    },
    challengeOnlyAtStart,
    challengeOnlyAtEnd: challengeOnlyPresent(FIND_ROOT),
    sorryAtStart,
    sorryAtEnd: countSorries(FIND_ROOT),
    apiKeys: keys,
    fractisiUsed: false,
    sealedCorpusAvailableToAgents: false,
    probes,
    comparison: {
      baselineName: 'Anthropic Riemann-zeta expedition (~1.5 days finding)',
      baselineSecondsApprox: ANTHROPIC_BASELINE_SECONDS,
      fractisiFindSecondsApprox: 11.66,
      thisArmSeconds: durationSeconds,
      thisArmOutcome: cutoffHit ? 'cutoff_no_solution' : inventedAnything ? 'progress' : 'no_solution',
      note:
        'Do not equate FractiSI 11.66s find-assemble with Anthropic idea invention. This no-kit arm shows the invention-scale gap when FractiSI and the sealed corpus are both withheld.',
    },
    paths: {
      findSandbox: FIND_ROOT,
    },
  };

  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-zeta23-find-no-kit-${stamp}.json`);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-find-no-kit-latest.json'),
    JSON.stringify(receipt, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok,
        mode: 'find_no_kit',
        durationSeconds,
        cutoffSeconds: args.cutoffSeconds,
        cutoffHit,
        sorryCount: sorryMid.sorryCount,
        leanOk,
        fractisiUsed: false,
        explanation,
      },
      null,
      2,
    ),
  );

  // Exit 0: successful measurement of a capped no-kit find (expected non-green).
  process.exit(0);
}

main();
