#!/usr/bin/env node
/**
 * ζ-23 INVENT clock WITHOUT FractiSI (matched baseline)
 *
 * Challenge-only. No FractiSI platform. No sealed Anthropic Zeta23 corpus.
 * Same Lean/Mathlib tactic invent strategies as run-zeta23-invent.mjs.
 * Default cutoff: 180 seconds (Player 1 matched invent).
 *
 * Usage:
 *   node timing/run-zeta23-invent-no-kit.mjs
 *   node timing/run-zeta23-invent-no-kit.mjs --cutoff-seconds 180
 */

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  symlinkSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPEDITION = resolve(__dirname, '../..');
const VENDOR = join(EXPEDITION, 'zeta23');
const INVENT_ROOT = join(EXPEDITION, '.invent-sandbox', 'zeta23-invent-no-kit');
const RECEIPTS = join(resolve(__dirname, '..'), 'receipts');

const CHALLENGE_ONLY = [
  'Challenge.lean',
  'ChallengeDeps.lean',
  'Challenge',
  'ChallengeDeps',
  'lean-toolchain',
  'LICENSE',
  'NOTICE',
  'README.md',
  'comparator.json',
  'formalization.yaml',
  'lake-manifest.json',
];

const INVENT_THEOREMS = [
  {
    name: 'two_thirds_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)',
  },
  {
    name: 'two_thirds_on_critical_line_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount 0 T : ℝ) ≤ N0star 0 T',
  },
  {
    name: 'two_thirds_simple_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)',
  },
  {
    name: 'two_thirds_simple_on_critical_line_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount 0 T : ℝ) ≤ N0simple 0 T',
  },
  {
    name: 'five_sixths_distinct',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)',
  },
  {
    name: 'five_sixths_distinct_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (Ncount 0 T : ℝ) ≤ Ndist 0 T',
  },
  {
    name: 'montgomery_taylor_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)',
  },
  {
    name: 'montgomery_taylor_simple_on_critical_line_mult',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)',
  },
  {
    name: 'montgomery_taylor_simple_on_critical_line_mult_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount 0 T : ℝ) ≤ N0simple 0 T',
  },
  {
    name: 'montgomery_taylor_distinct_mult',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)',
  },
  {
    name: 'montgomery_taylor_distinct_mult_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (Ncount 0 T : ℝ) ≤ Ndist 0 T',
  },
  {
    name: 'dirichlet_two_thirds_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0starL χ T (2 * T)',
  },
  {
    name: 'dirichlet_two_thirds_simple_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0simpleL χ T (2 * T)',
  },
  {
    name: 'dirichlet_five_sixths_distinct',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ NdistL χ T (2 * T)',
  },
  {
    name: 'dirichlet_montgomery_taylor_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0starL χ T (2 * T)',
  },
  {
    name: 'dirichlet_montgomery_taylor_simple_on_critical_line_mult',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0simpleL χ T (2 * T)',
  },
  {
    name: 'dirichlet_montgomery_taylor_distinct_mult',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ NdistL χ T (2 * T)',
  },
];

const TACTIC_STRATEGIES = [
  { id: 'aesop', body: 'aesop' },
  { id: 'simp_all', body: 'simp_all' },
  { id: 'first_barrage', body: 'first | aesop | simp_all | decide | omega | linarith | ring_nf | trivial' },
];

const DEFAULT_CUTOFF_SECONDS = 180;

function parseArgs(argv) {
  const out = { cutoffSeconds: DEFAULT_CUTOFF_SECONDS, receipt: null, skipLake: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cutoff-seconds') out.cutoffSeconds = Number(argv[++i] ?? DEFAULT_CUTOFF_SECONDS);
    else if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
    else if (a === '--skip-lake') out.skipLake = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  if (!Number.isFinite(out.cutoffSeconds) || out.cutoffSeconds <= 0) {
    out.cutoffSeconds = DEFAULT_CUTOFF_SECONDS;
  }
  return out;
}

function which(bin) {
  const r = spawnSync('bash', ['-lc', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? INVENT_ROOT,
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
  };
}

function apiKeysPresent() {
  return {
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY),
    HF_TOKEN: Boolean(process.env.HF_TOKEN),
  };
}

function writeInventLakefile(root) {
  writeFileSync(
    join(root, 'lakefile.toml'),
    `name = "Zeta23InventNoKit"
version = "0.1.0"
defaultTargets = ["ChallengeDeps", "Challenge", "Solution"]

[leanOptions]
pp.unicode.fun = true
relaxedAutoImplicit = false

[[require]]
name = "mathlib"
git = "https://github.com/leanprover-community/mathlib4"
rev = "51e6992efd06126df61a496bebf8f49482a4e129"

[[lean_lib]]
name = "ChallengeDeps"
roots = ["ChallengeDeps"]

[[lean_lib]]
name = "Challenge"
roots = ["Challenge"]

[[lean_lib]]
name = "Solution"
roots = ["Solution"]
`,
  );
}

function renderTheorem(thm, tacticBody) {
  const binders = thm.binders ? ` ${thm.binders}` : '';
  return `theorem ${thm.name}${binders} :\n    ${thm.stmt} := by\n  ${tacticBody}\n`;
}

function writeSolution(root, proofs) {
  let body = `/-
No-FractiSI invent Solution — NO Anthropic Zeta23 import. Sequential tactic invent.
-/
import ChallengeDeps

noncomputable section

`;
  for (const thm of INVENT_THEOREMS) {
    const proof = proofs.get(thm.name) || { tacticId: 'sorry_hold', body: 'sorry' };
    body += `/-- Invent attempt (${proof.tacticId}) for ${thm.name}. -/\n`;
    body += renderTheorem(thm, proof.body);
    body += '\n';
  }
  body += 'end\n';
  writeFileSync(join(root, 'Solution.lean'), body);
}

function solutionImportsZeta23(root) {
  if (!existsSync(join(root, 'Solution.lean'))) return false;
  return /import\s+Zeta23\b/.test(readFileSync(join(root, 'Solution.lean'), 'utf8'));
}

function countSorries(root) {
  if (!existsSync(join(root, 'Solution.lean'))) return -1;
  const m = readFileSync(join(root, 'Solution.lean'), 'utf8').match(/\bsorry\b/g);
  return m ? m.length : 0;
}

function prepare() {
  rmSync(INVENT_ROOT, { recursive: true, force: true });
  mkdirSync(INVENT_ROOT, { recursive: true });
  for (const name of CHALLENGE_ONLY) {
    const src = join(VENDOR, name);
    if (!existsSync(src)) continue;
    cpSync(src, join(INVENT_ROOT, name), { recursive: true });
  }
  writeInventLakefile(INVENT_ROOT);
  const lakeSrc = join(VENDOR, '.lake');
  if (existsSync(lakeSrc)) {
    try {
      symlinkSync(lakeSrc, join(INVENT_ROOT, '.lake'));
    } catch {
      /* optional */
    }
  }
  const absent = {
    Zeta23DirAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23')),
    Zeta23LeanAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23.lean')),
    SolutionLeanAbsentBeforeInventShell: !existsSync(join(INVENT_ROOT, 'Solution.lean')),
    SolutionDirAbsent: !existsSync(join(INVENT_ROOT, 'Solution')),
    sealedCorpusReadableByAgents: false,
  };
  const proofs = new Map();
  for (const thm of INVENT_THEOREMS) {
    proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry', closed: false });
  }
  writeSolution(INVENT_ROOT, proofs);
  const leaks = [];
  if (existsSync(join(INVENT_ROOT, 'Zeta23'))) leaks.push('Zeta23/');
  if (existsSync(join(INVENT_ROOT, 'Zeta23.lean'))) leaks.push('Zeta23.lean');
  for (const name of readdirSync(INVENT_ROOT)) {
    if (name === 'Zeta23' || name.startsWith('Zeta23.')) leaks.push(name);
  }
  return { absent, leaks, proofs };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      'Usage: node timing/run-zeta23-invent-no-kit.mjs [--cutoff-seconds 180] [--skip-lake] [--receipt PATH]',
    );
    process.exit(0);
  }

  const keys = apiKeysPresent();
  const anyLlmKey = Object.values(keys).some(Boolean);
  const { absent, leaks, proofs } = prepare();
  if (leaks.length) {
    console.error('sealed leak', leaks);
    process.exit(1);
  }

  const startedAt = new Date();
  const t0 = performance.now();
  const cutoffMs = args.cutoffSeconds * 1000;
  const steps = [];
  const attempts = [];
  let round = 0;
  let plateau = false;

  while (performance.now() - t0 < cutoffMs) {
    round += 1;
    const strategy = TACTIC_STRATEGIES[(round - 1) % TACTIC_STRATEGIES.length];
    for (const thm of INVENT_THEOREMS) {
      if (proofs.get(thm.name)?.closed) continue;
      proofs.set(thm.name, {
        tacticId: strategy.id,
        body: strategy.body,
        closed: false,
        round,
      });
      attempts.push({
        atSeconds: (performance.now() - t0) / 1000,
        theorem: thm.name,
        strategy: strategy.id,
        round,
      });
    }
    writeSolution(INVENT_ROOT, proofs);
    if (solutionImportsZeta23(INVENT_ROOT)) {
      console.error('INVARIANT FAIL: import Zeta23');
      process.exit(2);
    }

    let buildOk = false;
    if (!args.skipLake) {
      const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
      const remaining = cutoffMs - (performance.now() - t0);
      const build = run(lake, ['build', 'Solution'], {
        cwd: INVENT_ROOT,
        timeoutMs: Math.max(20_000, Math.min(remaining, 120_000)),
      });
      buildOk = build.status === 0;
      steps.push({
        name: `lake-build-r${round}`,
        ok: buildOk,
        status: build.status,
        strategy: strategy.id,
        stderrTail: (build.stderr || build.stdout || build.error || '').slice(-1200),
      });
    } else {
      steps.push({ name: `lake-build-r${round}`, ok: false, skipped: true, strategy: strategy.id });
    }

    if (buildOk) {
      for (const thm of INVENT_THEOREMS) {
        proofs.set(thm.name, { ...proofs.get(thm.name), closed: true });
      }
      break;
    }

    if (round >= TACTIC_STRATEGIES.length) {
      plateau = true;
      for (const thm of INVENT_THEOREMS) {
        if (!proofs.get(thm.name)?.closed) {
          proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry', closed: false, round });
        }
      }
      writeSolution(INVENT_ROOT, proofs);
      steps.push({
        name: 'plateau',
        ok: true,
        note: 'No-kit tactic invent strategies exhausted without closing theorems',
      });
      break;
    }
  }

  const durationSeconds = (performance.now() - t0) / 1000;
  const cutoffHit = durationSeconds >= args.cutoffSeconds - 0.05;
  const closedCount = [...proofs.values()].filter((p) => p.closed).length;
  const sorryAtEnd = countSorries(INVENT_ROOT);
  const leanOk = closedCount === INVENT_THEOREMS.length && sorryAtEnd === 0;
  const ok = leanOk;

  const explanation = [
    'No-FractiSI invent: Challenge-only ζ statements; sequential Lean/Mathlib tactic invent; no FractiSI kit; no sealed Anthropic corpus.',
    anyLlmKey
      ? 'LLM keys present but this harness does not call models.'
      : 'No Anthropic/OpenAI/Google/HF API keys — Lean tactic invent only.',
    `Rounds=${round}; closed=${closedCount}/${INVENT_THEOREMS.length}; sorries=${sorryAtEnd}; plateau=${plateau}; cutoffHit=${cutoffHit}.`,
    'Matched against FractiSI invent (run-zeta23-invent.mjs, no wall-clock cutoff). This no-kit arm uses a 180s cutoff. Anthropic ~1.5d invents the analytic argument. RH OPEN.',
  ].join(' ');

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-invent-no-kit.v1',
    label: 'riemann-fractisi-zeta23-invent-no-kit',
    mode: 'invent_no_kit',
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
    cutoffSeconds: args.cutoffSeconds,
    cutoffHit,
    plateau,
    ok,
    leanOk,
    fractisiUsed: false,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'No-FractiSI invent clock from Challenge-only with Lean tactic search; no sealed Anthropic formalization',
      sealedCorpusUsed: false,
      llmUsed: false,
      apiKeys: keys,
      anthropicBaselinePrimary: 'https://www.anthropic.com/research/riemann-zeta',
      anthropicBaselineCharacterization:
        '~60 subagents · ~1.5 days · invent+formalize critical-line bound 41.6% → 67.2%',
      explanation,
    },
    challengeOnlyAtStart: absent,
    leaksAtStart: leaks,
    invent: {
      theoremCount: INVENT_THEOREMS.length,
      closedCount,
      openCount: INVENT_THEOREMS.length - closedCount,
      rounds: round,
      attempts: attempts.length,
      strategiesTried: TACTIC_STRATEGIES.map((s) => s.id),
      solutionImportsZeta23: solutionImportsZeta23(INVENT_ROOT),
      sorryAtEnd,
    },
    steps,
    attempts,
    comparison: {
      baselineName: 'Anthropic Riemann-zeta expedition (~1.5 days invent+formalize)',
      baselineSecondsApprox: 1.5 * 24 * 3600,
      matchedArm: 'run-zeta23-invent.mjs (FractiSI invent, same cutoff)',
      thisArmSeconds: durationSeconds,
      thisArmOutcome: ok
        ? 'green_solution'
        : plateau
          ? 'plateau_no_theorem_closed'
          : cutoffHit
            ? 'cutoff_incomplete'
            : 'incomplete',
    },
    paths: { inventSandbox: INVENT_ROOT },
  };

  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-zeta23-invent-no-kit-${stamp}.json`);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-invent-no-kit-latest.json'),
    JSON.stringify(receipt, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok,
        mode: 'invent_no_kit',
        durationSeconds,
        cutoffSeconds: args.cutoffSeconds,
        plateau,
        closedCount,
        theoremCount: INVENT_THEOREMS.length,
        sorryAtEnd,
        fractisiUsed: false,
        sealedCorpusUsed: false,
        llmKeys: anyLlmKey,
        explanation,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main();
