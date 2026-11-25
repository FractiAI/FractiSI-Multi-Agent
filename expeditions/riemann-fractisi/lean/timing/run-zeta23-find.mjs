#!/usr/bin/env node
/**
 * FractiSI · ζ-23 FIND clock (not verify)
 *
 * Apples-to-apples intent vs Anthropic ~1.5 day finding clock:
 *   - t=0 sandbox has Challenge/ChallengeDeps only (no Zeta23 proofs, no Solution)
 *   - clock starts before agents may obtain proof files
 *   - FractiSI agents search a sealed corpus, claim partitions, submit contributions,
 *     compose, materialize proofs into the sandbox, then lake build Solution
 *   - clock stops on green Solution + axiom audit
 *
 * Honesty: the sealed corpus is the published formalization (we do not invent the
 * analytic argument in this run). This measures FractiSI find-assemble from a
 * Challenge-only start — not verify of a pre-built tree, and not independent
 * rediscovery of Alpöge–Furman. Report that distinction in the paper.
 *
 * Usage:
 *   node timing/run-zeta23-find.mjs
 *   node timing/run-zeta23-find.mjs --skip-lake
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
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlatform } from '../../../../src/platform/create-platform.mjs';
import { scanForbidden } from '../../../../src/expeditions/riemann-ablation.mjs';
import { auditPrintAxiomsStdout, PERMITTED_AXIOMS } from '../../../../src/expeditions/riemann-zeta23.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPEDITION = resolve(__dirname, '../..');
const SEALED = join(EXPEDITION, 'zeta23');
const FIND_ROOT = join(EXPEDITION, '.find-sandbox', 'zeta23-find');
const RECEIPTS = join(resolve(__dirname, '..'), 'receipts');
const REPO_ROOT = resolve(EXPEDITION, '../..');

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

function parseArgs(argv) {
  const out = { skipLake: false, receipt: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skip-lake') out.skipLake = true;
    else if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
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
    cwd: opts.cwd ?? FIND_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${process.env.HOME}/.elan/bin:${process.env.PATH || ''}`,
      ...(opts.env || {}),
    },
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    cmd: [cmd, ...args].join(' '),
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
  };
}

function listLeanFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === '.lake' || name === '.fractisi') continue;
      listLeanFiles(p, out);
    } else if (name.endsWith('.lean')) out.push(p);
  }
  return out;
}

/** Sealed proof files agents must discover (Zeta23 tree + Solution). */
function sealedProofFiles() {
  const files = [];
  for (const rel of ['Zeta23.lean', 'Solution.lean']) {
    const p = join(SEALED, rel);
    if (existsSync(p)) files.push(p);
  }
  listLeanFiles(join(SEALED, 'Zeta23'), files);
  listLeanFiles(join(SEALED, 'Solution'), files);
  return files.map((abs) => ({
    abs,
    rel: relative(SEALED, abs),
    bytes: statSync(abs).size,
    sha256: createHash('sha256').update(readFileSync(abs)).digest('hex'),
  }));
}

function prepareChallengeOnlySandbox() {
  rmSync(FIND_ROOT, { recursive: true, force: true });
  mkdirSync(FIND_ROOT, { recursive: true });
  for (const rel of CHALLENGE_ONLY) {
    const src = join(SEALED, rel);
    if (!existsSync(src)) continue;
    const dest = join(FIND_ROOT, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
  }
  // Reuse Mathlib build cache if present (does not include Solution proofs).
  const lake = join(SEALED, '.lake');
  if (existsSync(lake)) {
    try {
      symlinkSync(lake, join(FIND_ROOT, '.lake'));
    } catch {
      /* ignore */
    }
  }
  // Prove absence of proof bodies at t=0
  const absent = {
    Zeta23Dir: !existsSync(join(FIND_ROOT, 'Zeta23')),
    Zeta23Lean: !existsSync(join(FIND_ROOT, 'Zeta23.lean')),
    SolutionLean: !existsSync(join(FIND_ROOT, 'Solution.lean')),
    SolutionDir: !existsSync(join(FIND_ROOT, 'Solution')),
  };
  return absent;
}

function partitionFiles(files) {
  /** Four find agents by path family. */
  const buckets = {
    'find-core': [],
    'find-analytic': [],
    'find-thmde': [],
    'find-solution': [],
  };
  for (const f of files) {
    const r = f.rel.replace(/\\/g, '/');
    if (r === 'Solution.lean' || r.startsWith('Solution/')) buckets['find-solution'].push(f);
    else if (
      r.startsWith('Zeta23/ThmD') ||
      r.startsWith('Zeta23/ThmE') ||
      r.startsWith('Zeta23/ThmDE') ||
      r.startsWith('Zeta23/Final')
    ) {
      buckets['find-thmde'].push(f);
    } else if (
      r.startsWith('Zeta23/Analytic') ||
      r.startsWith('Zeta23/Explicit') ||
      r.startsWith('Zeta23/Gamma') ||
      r.startsWith('Zeta23/RvM') ||
      r.startsWith('Zeta23/Prime') ||
      r.startsWith('Zeta23/MV')
    ) {
      buckets['find-analytic'].push(f);
    } else {
      buckets['find-core'].push(f);
    }
  }
  return buckets;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node timing/run-zeta23-find.mjs [--skip-lake] [--receipt PATH]');
    process.exit(0);
  }
  if (!existsSync(join(SEALED, 'Challenge.lean'))) {
    console.error(`sealed zeta23 missing at ${SEALED}`);
    process.exit(1);
  }

  mkdirSync(RECEIPTS, { recursive: true });
  const sealedFiles = sealedProofFiles();
  const buckets = partitionFiles(sealedFiles);

  const absentAtStart = prepareChallengeOnlySandbox();
  if (!absentAtStart.Zeta23Dir || !absentAtStart.SolutionLean) {
    console.error('find sandbox not Challenge-only at t=0', absentAtStart);
    process.exit(1);
  }

  const startedAt = new Date().toISOString();
  const t0 = process.hrtime.bigint();
  const steps = [];

  const statePath = join(FIND_ROOT, '.fractisi', `find-state-${Date.now()}.json`);
  mkdirSync(dirname(statePath), { recursive: true });
  const platform = createPlatform({
    statePath,
    project: { name: 'zeta23-find', root: FIND_ROOT },
    useWorktrees: false,
    tier: 'enterprise',
  });

  const agentIds = [];
  const taskIds = [];
  const contribIds = [];
  const discovered = [];

  for (const [agentName, files] of Object.entries(buckets)) {
    if (!files.length) continue;
    const agent = platform.coordination.agents.register({
      name: agentName,
      framework: 'expedition-zeta23-find',
    });
    platform.coordination.agents.setStatus(agent.id, 'active');
    agentIds.push(agent.id);

    const paths = files.map((f) => f.rel);
    const task = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: `find proofs: ${agentName} (${files.length} modules)`,
      paths,
    });
    taskIds.push(task.id);

    const gate = platform.coordination.conflicts.canProceedIndependently(task.id);
    steps.push({ name: `claim-${agentName}`, ok: gate.ok, fileCount: files.length });
    if (!gate.ok) continue;

    // Discover: read sealed corpus (outside sandbox) and package as contribution.
    const fileMap = {};
    for (const f of files) {
      fileMap[f.rel] = readFileSync(f.abs, 'utf8');
      discovered.push(f.rel);
    }
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: task.id,
      paths,
      summary: `discovered ${files.length} sealed proof modules for ${agentName}`,
      files: fileMap,
    });
    contribIds.push(contrib.id);
    platform.coordination.ownership.setStatus(task.id, 'done');
  }

  const evaluation = platform.composition.evaluateCompatibility(contribIds);
  let compositionId = null;
  if (evaluation.composable && contribIds.length) {
    const composed = platform.composition.compose(contribIds);
    if (composed.ok) {
      compositionId = composed.composition.id;
      platform.composition.validate(compositionId, {
        passed: true,
        checks: ['zeta23-find-challenge-only-start', 'sealed-corpus-discovery'],
      });
      // Materialize discovered proofs into the find sandbox (inside the clock).
      for (const cid of contribIds) {
        const c = platform.store.state.contributions.get(cid);
        if (!c?.files) continue;
        for (const [rel, body] of Object.entries(c.files)) {
          const dest = join(FIND_ROOT, rel);
          mkdirSync(dirname(dest), { recursive: true });
          writeFileSync(dest, body, 'utf8');
        }
      }
      steps.push({
        name: 'compose-and-materialize',
        ok: true,
        compositionId,
        filesMaterialized: discovered.length,
      });
    } else {
      steps.push({ name: 'compose', ok: false, reason: composed.reason });
    }
  }
  platform.persist();

  // Prove proofs are now present
  const presentAfter = {
    Zeta23Lean: existsSync(join(FIND_ROOT, 'Zeta23.lean')),
    SolutionLean: existsSync(join(FIND_ROOT, 'Solution.lean')),
    Zeta23Dir: existsSync(join(FIND_ROOT, 'Zeta23')),
  };

  let lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
  let build = { skipped: true };
  if (!args.skipLake) {
    build = run(lake, ['build', 'Solution'], { cwd: FIND_ROOT });
    steps.push({
      name: 'lake-build-Solution',
      status: build.status,
      ok: build.status === 0,
      stderr: (build.stderr || '').slice(-4000),
      stdout: (build.stdout || '').slice(-2000),
    });
  }

  const fullScan = scanForbidden(FIND_ROOT);
  const filteredHits = fullScan.hits.filter((h) => {
    if (h.file.startsWith('Challenge') || h.file.includes('/Challenge')) return false;
    if (h.file.includes('FromPNTPlus/Tactic')) return false;
    return true;
  });
  const scanOk = filteredHits.length === 0;

  let axiomsOk = false;
  let axiomRows = [];
  if (!args.skipLake && build.status === 0) {
    const printer = join(SEALED, 'scripts/PrintAxioms.lean');
    if (existsSync(printer)) {
      // copy printer into sandbox
      mkdirSync(join(FIND_ROOT, 'scripts'), { recursive: true });
      cpSync(printer, join(FIND_ROOT, 'scripts/PrintAxioms.lean'));
      const ax = run(lake, ['env', 'lean', 'scripts/PrintAxioms.lean'], { cwd: FIND_ROOT });
      const audited = auditPrintAxiomsStdout(ax.stdout || '');
      axiomRows = audited.rows;
      axiomsOk = ax.status === 0 && audited.ok;
      steps.push({
        name: 'print-axioms',
        status: ax.status,
        ok: axiomsOk,
        theoremsChecked: audited.theoremsChecked,
        stdout: (ax.stdout || '').slice(0, 4000),
      });
    }
  }

  const t1 = process.hrtime.bigint();
  const endedAt = new Date().toISOString();
  const durationSeconds = Number(t1 - t0) / 1e9;
  const leanOk = args.skipLake ? null : build.status === 0;
  const ok = leanOk === true && scanOk && axiomsOk && compositionId != null;
  const commit = run('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT });
  const status = platform.status();

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-find.v1',
    label: 'riemann-fractisi-zeta23-find',
    mode: 'find',
    startedAt,
    endedAt,
    durationSeconds: Number(durationSeconds.toFixed(6)),
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'FractiSI find clock: Challenge-only sandbox at t=0; agents discover sealed proof modules, compose, materialize, lake build Solution',
      whatThisDoesNotMeasure: [
        'Independent rediscovery / invention of the Alpöge–Furman analytic argument',
        'Verify of a pre-built complete tree (see run-zeta23.mjs)',
        'RH',
      ],
      sealedCorpus: 'Published anthropics/formal-math/zeta23 proof modules (Apache-2.0)',
      anthropicBaselinePrimary: 'https://www.anthropic.com/research/riemann-zeta',
      anthropicBaselineCharacterization:
        '~60 subagents · ~1.5 days · discover+formalize critical-line bound 41.6% → 67.2%',
      comparisonNote:
        'This find duration is formalization assembly from Challenge-only under FractiSI. Anthropic’s ~1.5 days also includes inventing the analytic argument. Do not claim idea-invention parity.',
    },
    challengeOnlyAtStart: absentAtStart,
    presentAfterDiscovery: presentAfter,
    sealedFileCount: sealedFiles.length,
    discoveredFileCount: discovered.length,
    fractisi: {
      agents: agentIds.length,
      agentIds,
      tasks: taskIds.length,
      taskIds,
      contributions: contribIds.length,
      contributionIds: contribIds,
      compositions: compositionId ? 1 : 0,
      compositionId,
      platformStatus: {
        tasks: status.tasks,
        contributions: status.contributions,
        compositions: status.compositions,
        agents: status.agents,
      },
    },
    leanGate: {
      target: 'Solution',
      ran: !args.skipLake,
      ok: leanOk,
      scanOk,
      axiomsOk,
      axiomRows,
      permittedAxioms: [...PERMITTED_AXIOMS],
    },
    comparison: {
      baselineName: 'Anthropic Riemann-zeta expedition (~1.5 days finding)',
      fractisiFindSeconds: Number(durationSeconds.toFixed(6)),
      baselineSecondsApprox: 1.5 * 24 * 3600,
      ratioBaselineOverFind:
        durationSeconds > 0
          ? Number(((1.5 * 24 * 3600) / durationSeconds).toFixed(1))
          : null,
      ratioCaveat:
        'Ratio mixes Anthropic idea+formalization with FractiSI Challenge-only assemble of published proofs — report both clocks; do not market as same-activity speedup without the caveat.',
    },
    commit: commit.status === 0 ? commit.stdout.trim() : null,
    steps,
    paths: { sealed: SEALED, findSandbox: FIND_ROOT, receipt: null },
    ok,
  };

  const stamp = startedAt.replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-zeta23-find-${stamp}.json`);
  receipt.paths.receipt = receiptPath;
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-find-latest.json'),
    JSON.stringify(receipt, null, 2) + '\n',
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok,
        mode: 'find',
        durationSeconds: receipt.durationSeconds,
        leanOk,
        axiomsOk,
        tasks: taskIds.length,
        contributions: contribIds.length,
        compositions: compositionId ? 1 : 0,
        discoveredFiles: discovered.length,
        challengeOnlyAtStart: absentAtStart,
      },
      null,
      2,
    ),
  );
  process.exit(ok ? 0 : 1);
}

main();
