#!/usr/bin/env node
/**
 * FractiSI · ζ-23 PAPER-MATH invent clock
 *
 * Invents / verifies Alpöge–Furman ladder lemmas (arXiv:2608.13637 public outline)
 * into InventMath.lean — Challenge-only Mathlib, NO sealed Anthropic Zeta23.
 *
 * This is the “actual math” arm: close rank–trace / assembly lemmas that feed
 * Theorems A–E. Challenge headline Solution.lean remains a separate invent arm.
 *
 * Usage:
 *   node timing/run-zeta23-invent-math.mjs
 *   node timing/run-zeta23-invent-math.mjs --receipt PATH
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
import { createPlatform } from '../../../../src/platform/create-platform.mjs';
import {
  PAPER_LEMMA_LADDER,
  PAPER_MATH_THEOREM_NAMES,
  PAPER_META,
} from '../../../../src/expeditions/riemann-zeta23-paper-math.mjs';
import { listLlmKeysPresent } from '../../../../src/expeditions/riemann-zeta23-llm.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPEDITION = resolve(__dirname, '../..');
const VENDOR = join(EXPEDITION, 'zeta23');
const INVENT_MATH_SRC = join(resolve(__dirname, '..'), 'invent-math', 'InventMath.lean');
const INVENT_ROOT = join(EXPEDITION, '.invent-sandbox', 'zeta23-invent-math');
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

const FORBIDDEN_IMPORTS = ['Zeta23', 'Solution'];

function parseArgs(argv) {
  const out = { receipt: null, skipLake: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
    else if (a === '--skip-lake') out.skipLake = true;
    else if (a === '--help' || a === '-h') out.help = true;
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

function assertNoSealedLeak(root) {
  const leaks = [];
  if (existsSync(join(root, 'Zeta23'))) leaks.push('Zeta23/');
  if (existsSync(join(root, 'Zeta23.lean'))) leaks.push('Zeta23.lean');
  for (const name of readdirSync(root)) {
    if (name === 'Zeta23' || name.startsWith('Zeta23.')) leaks.push(name);
  }
  return leaks;
}

function writeInventMathLakefile(root) {
  const body = `name = "Zeta23InventMath"
version = "0.1.0"
defaultTargets = ["InventMath"]

[leanOptions]
pp.unicode.fun = true
relaxedAutoImplicit = false

[[require]]
name = "mathlib"
git = "https://github.com/leanprover-community/mathlib4"
rev = "51e6992efd06126df61a496bebf8f49482a4e129"

[[lean_lib]]
name = "InventMath"
roots = ["InventMath"]
`;
  writeFileSync(join(root, 'lakefile.toml'), body);
}

function inventMathImportsZeta23(root) {
  const path = join(root, 'InventMath.lean');
  if (!existsSync(path)) return false;
  const text = readFileSync(path, 'utf8');
  return FORBIDDEN_IMPORTS.some((name) => new RegExp(`import\\s+${name}\\b`).test(text));
}

function countSorries(root) {
  const path = join(root, 'InventMath.lean');
  if (!existsSync(path)) return { sorryCount: -1 };
  const text = readFileSync(path, 'utf8');
  const m = text.match(/\bsorry\b/g);
  return { sorryCount: m ? m.length : 0 };
}

function theoremClosedInSource(text, name) {
  // Declared and not followed by sorry before next theorem/lemma/end at file level — coarse check.
  const re = new RegExp(
    `(?:theorem|lemma)\\s+${name}\\b[\\s\\S]*?:= by([\\s\\S]*?)(?=\\n(?:theorem|lemma|end)\\b)`,
  );
  const m = text.match(re);
  if (!m) return false;
  return !/\bsorry\b/.test(m[1]);
}

function prepareSandbox() {
  rmSync(INVENT_ROOT, { recursive: true, force: true });
  mkdirSync(INVENT_ROOT, { recursive: true });
  for (const name of CHALLENGE_ONLY) {
    const src = join(VENDOR, name);
    if (!existsSync(src)) continue;
    cpSync(src, join(INVENT_ROOT, name), { recursive: true });
  }
  if (!existsSync(INVENT_MATH_SRC)) {
    throw new Error(`missing InventMath source at ${INVENT_MATH_SRC}`);
  }
  cpSync(INVENT_MATH_SRC, join(INVENT_ROOT, 'InventMath.lean'));
  writeInventMathLakefile(INVENT_ROOT);
  const lakeSrc = join(VENDOR, '.lake');
  if (existsSync(lakeSrc)) {
    try {
      symlinkSync(lakeSrc, join(INVENT_ROOT, '.lake'));
    } catch {
      /* optional */
    }
  }
  return {
    challengeOnly: {
      Zeta23DirAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23')),
      Zeta23LeanAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23.lean')),
      sealedCorpusReadableByAgents: false,
    },
    inventMathCopied: true,
    leaks: assertNoSealedLeak(INVENT_ROOT),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node timing/run-zeta23-invent-math.mjs [--skip-lake] [--receipt PATH]');
    process.exit(0);
  }

  const prep = prepareSandbox();
  if (prep.leaks.length) {
    console.error('sealed leak into invent-math sandbox', prep.leaks);
    process.exit(1);
  }
  if (inventMathImportsZeta23(INVENT_ROOT)) {
    console.error('INVARIANT FAIL: InventMath imported Zeta23');
    process.exit(2);
  }

  const startedAt = new Date();
  const t0 = performance.now();
  const steps = [];

  const statePath = join(INVENT_ROOT, '.fractisi', `invent-math-state-${Date.now()}.json`);
  mkdirSync(dirname(statePath), { recursive: true });
  const platform = createPlatform({
    statePath,
    project: { name: 'zeta23-invent-math', root: INVENT_ROOT },
    useWorktrees: false,
    tier: 'enterprise',
  });

  const agentIds = [];
  const taskIds = [];
  const contribIds = [];
  const byAgent = new Map();
  for (const lemma of PAPER_LEMMA_LADDER) {
    if (!byAgent.has(lemma.agent)) byAgent.set(lemma.agent, []);
    byAgent.get(lemma.agent).push(lemma);
  }

  for (const agentName of byAgent.keys()) {
    const agent = platform.coordination.agents.register({
      name: agentName,
      framework: 'expedition-zeta23-invent-math',
    });
    platform.coordination.agents.setStatus(agent.id, 'active');
    agentIds.push(agent.id);

    const lemmas = byAgent.get(agentName);
    const paths = lemmas.map((l) => `InventMath.lean#${l.leanName}`);
    const task = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: `paper-math invent ${agentName} (${lemmas.length} lemmas)`,
      paths,
    });
    taskIds.push(task.id);
    const gate = platform.coordination.conflicts.canProceedIndependently(task.id);
    steps.push({ name: `claim-${agentName}`, ok: gate.ok, lemmas: lemmas.map((l) => l.leanName) });
    if (!gate.ok) continue;

    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: task.id,
      paths,
      summary: `paper-math invent ${agentName}: ${lemmas.map((l) => l.id).join(',')}`,
      files: {},
      meta: {
        inventMath: true,
        sealedCorpus: false,
        arxiv: PAPER_META.arxiv,
      },
    });
    contribIds.push(contrib.id);
    platform.coordination.ownership.setStatus(task.id, 'in_progress');
  }

  let buildOk = false;
  let buildStderr = '';
  if (!args.skipLake) {
    const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
    const build = run(lake, ['build', 'InventMath'], {
      cwd: INVENT_ROOT,
      timeoutMs: 600_000,
    });
    buildOk = build.status === 0;
    buildStderr = (build.stderr || build.stdout || build.error || '').slice(-4000);
    steps.push({
      name: 'lake-build-InventMath',
      ok: buildOk,
      status: build.status,
      stderrTail: buildStderr.slice(-1200),
    });
  } else {
    steps.push({ name: 'lake-build-InventMath', ok: false, skipped: true });
  }

  const source = readFileSync(join(INVENT_ROOT, 'InventMath.lean'), 'utf8');
  const closed = [];
  const open = [];
  for (const name of PAPER_MATH_THEOREM_NAMES) {
    if (theoremClosedInSource(source, name)) closed.push(name);
    else open.push(name);
  }
  // Supporting lemma also counted when present.
  if (theoremClosedInSource(source, 'indicator_pos_ge_two_sub_sq')) {
    if (!closed.includes('indicator_pos_ge_two_sub_sq')) closed.push('indicator_pos_ge_two_sub_sq');
  }

  const sorryEnd = countSorries(INVENT_ROOT);
  const ladderClosed = PAPER_MATH_THEOREM_NAMES.every((n) => closed.includes(n));
  const leanOk = buildOk && ladderClosed && sorryEnd.sorryCount === 0 && !inventMathImportsZeta23(INVENT_ROOT);
  const ok = leanOk;

  if (ok) {
    for (const id of contribIds) {
      const c = platform.store.state.contributions.get(id);
      if (c) platform.coordination.ownership.setStatus(c.taskId, 'done');
    }
    const evaluation = platform.composition.evaluateCompatibility(contribIds);
    if (evaluation.composable) {
      const composed = platform.composition.compose(contribIds);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, {
          passed: true,
          checks: ['zeta23-invent-math-no-sealed-corpus', 'no-zeta23-import', 'invent-math-green'],
        });
        steps.push({ name: 'compose', ok: true, compositionId: composed.composition.id });
      }
    }
  }

  platform.persist();
  const durationSeconds = (performance.now() - t0) / 1000;

  const explanation = [
    'FractiSI paper-math invent: Challenge-only InventMath.lean from public arXiv:2608.13637 outline.',
    `Ladder lemmas closed ${PAPER_MATH_THEOREM_NAMES.filter((n) => closed.includes(n)).length}/${PAPER_MATH_THEOREM_NAMES.length}; lake build ${buildOk ? 'green' : 'failed'}; sorries=${sorryEnd.sorryCount}.`,
    'No sealed Anthropic Zeta23 corpus. Challenge headline Solution.lean not claimed here. RH remains OPEN.',
  ].join(' ');

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-invent-math.v1',
    label: 'riemann-fractisi-zeta23-invent-math',
    mode: 'invent_math',
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
    ok,
    leanOk,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'Paper-guided invent of rank–trace / assembly lemmas (InventMath) from public arXiv outline; Challenge-only; no sealed Zeta23',
      whatThisDoesNotMeasure: [
        'Full Challenge Solution.lean (17 headline theorems)',
        'Find-assemble of sealed Anthropic Zeta23',
        'RH',
      ],
      inventedHere:
        'Lean proofs of paper ladder lemmas (scalar rank–trace, diagonal form, Theorem A constant arithmetic)',
      reusedNotInvented: [
        'Mathlib',
        'Public paper outline arXiv:2608.13637 (ideas, not Anthropic Lean)',
      ],
      sealedCorpusUsed: false,
      paperArxiv: PAPER_META.arxiv,
      apiKeys: listLlmKeysPresent(),
      anthropicBaselinePrimary: 'https://www.anthropic.com/research/riemann-zeta',
      explanation,
    },
    challengeOnlyAtStart: prep.challengeOnly,
    leaksAtStart: prep.leaks,
    invent: {
      kind: 'paper_math_ladder',
      theoremCount: PAPER_MATH_THEOREM_NAMES.length,
      closedCount: PAPER_MATH_THEOREM_NAMES.filter((n) => closed.includes(n)).length,
      openCount: PAPER_MATH_THEOREM_NAMES.filter((n) => !closed.includes(n)).length,
      closed,
      open,
      supportingClosed: closed.filter((n) => !PAPER_MATH_THEOREM_NAMES.includes(n)),
      inventMathImportsZeta23: inventMathImportsZeta23(INVENT_ROOT),
      sorryAtEnd: sorryEnd.sorryCount,
      lakeBuildOk: buildOk,
      ladder: PAPER_LEMMA_LADDER.map((l) => ({
        id: l.id,
        leanName: l.leanName,
        closed: closed.includes(l.leanName),
      })),
    },
    fractisi: {
      agents: agentIds.length,
      agentIds,
      tasks: taskIds.length,
      taskIds,
      contributions: contribIds.length,
      contributionIds: contribIds,
    },
    steps,
    paths: { inventSandbox: INVENT_ROOT, inventMathSrc: INVENT_MATH_SRC },
  };

  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-zeta23-invent-math-${stamp}.json`);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-invent-math-latest.json'),
    JSON.stringify(receipt, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok,
        mode: 'invent_math',
        durationSeconds,
        closedCount: receipt.invent.closedCount,
        theoremCount: receipt.invent.theoremCount,
        sorryAtEnd: sorryEnd.sorryCount,
        lakeBuildOk: buildOk,
        sealedCorpusUsed: false,
        explanation,
      },
      null,
      2,
    ),
  );
  process.exit(ok ? 0 : 1);
}

main();
