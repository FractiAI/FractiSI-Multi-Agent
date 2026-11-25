#!/usr/bin/env node
/**
 * Matched ablation: FractiSI coordination vs sequential no-kit write.
 *
 * Same frozen Lean payload bytes both arms. Work happens inside the clock:
 *   - no-kit: write AgentCritical / AgentProportion / Phase0 / PhaseN, then lake build
 *   - fractisi: four agents claim tasks, submit contributions, compose, git-integrate,
 *     then lake build
 *
 * Hard gate: lake build + forbidden-token scan (sorry / axiom / native_decide).
 *
 * This measures coordination + integration under a Lean gate — not LLM proof search,
 * and not a 30h FLT comparison.
 *
 * Usage:
 *   node timing/run-ablation.mjs
 *   node timing/run-ablation.mjs --receipt /abs/path.json
 *   node timing/run-ablation.mjs --skip-lake   # structure-only (not science)
 */

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlatform } from '../../../../src/platform/create-platform.mjs';
import { runHardGate, AGENT_PAYLOAD_PATHS } from '../../../../src/expeditions/riemann-ablation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEAN_ROOT = resolve(__dirname, '..');
const EXPEDITION_ROOT = resolve(LEAN_ROOT, '..');
const RECEIPTS = join(LEAN_ROOT, 'receipts');
const REPO_ROOT = resolve(LEAN_ROOT, '../../..');

const AGENT_PATHS = [...AGENT_PAYLOAD_PATHS];

const ROLES = [
  { name: 'lemma-critical', path: AGENT_PATHS[0], summary: 'critical-line agent payload' },
  { name: 'lemma-proportion', path: AGENT_PATHS[1], summary: 'proportion-ladder agent payload' },
  { name: 'phase0-composer', path: AGENT_PATHS[2], summary: 'Phase0 composition bundle' },
  { name: 'phasen-composer', path: AGENT_PATHS[3], summary: 'PhaseN composition bundle' },
];

function parseArgs(argv) {
  const out = { skipLake: false, receipt: null, sandbox: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skip-lake') out.skipLake = true;
    else if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
    else if (a === '--sandbox') out.sandbox = resolve(argv[++i] ?? '');
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function which(bin) {
  const r = spawnSync('bash', ['-lc', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function runGit(cwd, args) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

function loadPayloads() {
  const files = {};
  const hashes = {};
  for (const rel of AGENT_PATHS) {
    const text = readFileSync(join(LEAN_ROOT, rel), 'utf8');
    files[rel] = text;
    hashes[rel] = sha256(text);
  }
  return { files, hashes };
}

function prepareSandbox(sandboxRoot, payloads) {
  rmSync(sandboxRoot, { recursive: true, force: true });
  mkdirSync(sandboxRoot, { recursive: true });

  // Copy Lean project skeleton without agent payloads (those are written in-clock).
  const copyList = [
    'lakefile.lean',
    'lean-toolchain',
    'lake-manifest.json',
    'Main.lean',
    'RiemannExpedition.lean',
    'RiemannExpedition/Honesty.lean',
    'RiemannExpedition/CriticalLine.lean',
    'RiemannExpedition/ProportionLadder.lean',
    'RiemannExpedition/README.md',
    'RiemannExpedition/AGENTS.md',
    'AGENTS.md',
    'README.md',
    '.gitignore',
  ];
  for (const rel of copyList) {
    const src = join(LEAN_ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(sandboxRoot, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }

  // Ensure agent payload paths are absent before the clocked write.
  for (const rel of AGENT_PATHS) {
    rmSync(join(sandboxRoot, rel), { force: true });
  }

  // Init git so FractiSI worktrees / integrateComposition can run.
  runGit(sandboxRoot, ['init', '-q']);
  runGit(sandboxRoot, ['config', 'user.email', 'ablation@fractisi.local']);
  runGit(sandboxRoot, ['config', 'user.name', 'Riemann Ablation']);
  runGit(sandboxRoot, ['add', '-A']);
  runGit(sandboxRoot, ['commit', '-q', '-m', 'ablation: base library (no agent payloads)']);

  return {
    sandboxRoot,
    payloadHashes: payloads.hashes,
    missingBefore: AGENT_PATHS.map((p) => !existsSync(join(sandboxRoot, p))),
  };
}

function armNoKit(sandboxRoot, payloads, opts) {
  const t0 = process.hrtime.bigint();
  const startedAt = new Date().toISOString();
  const written = [];
  for (const rel of AGENT_PATHS) {
    const dest = join(sandboxRoot, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, payloads.files[rel], 'utf8');
    written.push(rel);
  }
  const writeEnded = process.hrtime.bigint();

  const lake = which('lake');
  const gate = runHardGate(sandboxRoot, {
    lakeBin: lake || 'lake',
    skipLake: opts.skipLake || !lake,
    printAxiomsConstant: 'RiemannExpedition.Phase0.critical_line_bundle',
  });

  const t1 = process.hrtime.bigint();
  return {
    arm: 'no_kit_sequential_write',
    startedAt,
    endedAt: new Date().toISOString(),
    durationSeconds: Number(t1 - t0) / 1e9,
    writeSeconds: Number(writeEnded - t0) / 1e9,
    written,
    tasks: 0,
    contributions: 0,
    compositions: 0,
    agents: 0,
    coordination: false,
    hardGate: gate,
    ok: gate.ok === true,
  };
}

function armFractisi(sandboxRoot, payloads, opts) {
  const t0 = process.hrtime.bigint();
  const startedAt = new Date().toISOString();
  const statePath = join(sandboxRoot, '.fractisi', 'state.json');
  mkdirSync(dirname(statePath), { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: 'riemann-ablation', root: sandboxRoot },
    useWorktrees: true,
    tier: 'enterprise',
  });
  platform.git.ensureGitRepo(sandboxRoot);
  platform.persist();

  const contribIds = [];
  const agentIds = [];
  const taskIds = [];
  const steps = [];

  for (const role of ROLES) {
    const agent = platform.coordination.agents.register({
      name: role.name,
      framework: 'expedition',
    });
    platform.coordination.agents.setStatus(agent.id, 'active');
    agentIds.push(agent.id);

    const wt = platform.git.allocateScopedWorkspace(agent.id, {
      cwd: sandboxRoot,
      useWorktree: true,
    });
    steps.push({ name: `worktree-${role.name}`, ok: wt.ok, path: wt.scope?.path });

    const task = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: `write ${role.path}`,
      paths: [role.path],
    });
    taskIds.push(task.id);

    const gate = platform.coordination.conflicts.canProceedIndependently(task.id);
    if (!gate.ok) {
      steps.push({ name: `blocked-${role.name}`, conflicts: gate.conflicts });
      continue;
    }

    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: task.id,
      paths: [role.path],
      summary: role.summary,
      files: { [role.path]: payloads.files[role.path] },
    });
    contribIds.push(contrib.id);

    const applied = platform.git.applyContribution(
      agent.id,
      platform.store.state.contributions.get(contrib.id),
    );
    steps.push({ name: `apply-${role.name}`, ok: applied.ok, written: applied.written });
    platform.git.commitWorkspace(agent.id, `fractisi(${role.name}): ${role.path}`);
    platform.coordination.ownership.setStatus(task.id, 'done');
  }

  const evaluation = platform.composition.evaluateCompatibility(contribIds);
  steps.push({
    name: 'evaluateCompatibility',
    composable: evaluation.composable,
    issues: evaluation.issues || [],
  });

  let compositionId = null;
  let integrated = null;
  if (evaluation.composable && contribIds.length === ROLES.length) {
    const composed = platform.composition.compose(contribIds);
    if (composed.ok) {
      compositionId = composed.composition.id;
      platform.composition.validate(compositionId, {
        passed: true,
        checks: ['ablation-path-disjoint', 'frozen-payload-bytes'],
      });
      integrated = platform.git.integrateComposition(compositionId, {
        cwd: sandboxRoot,
        message: `fractisi: integrate ablation composition ${compositionId}`,
      });
      steps.push({
        name: 'integrateComposition',
        ok: integrated.ok,
        sha: integrated.sha,
        written: integrated.written,
      });
    } else {
      steps.push({ name: 'compose', ok: false, reason: composed.reason });
    }
  }

  platform.persist();
  const snap = platform.store.snapshot();
  const status = platform.status();

  const lake = which('lake');
  const gate = runHardGate(sandboxRoot, {
    lakeBin: lake || 'lake',
    skipLake: opts.skipLake || !lake,
    printAxiomsConstant: 'RiemannExpedition.Phase0.critical_line_bundle',
  });

  const t1 = process.hrtime.bigint();
  return {
    arm: 'fractisi_coordinated_compose',
    startedAt,
    endedAt: new Date().toISOString(),
    durationSeconds: Number(t1 - t0) / 1e9,
    agents: agentIds.length,
    agentIds,
    tasks: taskIds.length,
    taskIds,
    contributions: contribIds.length,
    contributionIds: contribIds,
    compositions: compositionId ? 1 : 0,
    compositionId,
    coordination: true,
    platformStatus: {
      tasks: status.tasks,
      contributions: status.contributions,
      compositions: status.compositions,
      agents: status.agents,
    },
    snapshotCounts: {
      tasks: snap.tasks.length,
      contributions: snap.contributions.length,
      compositions: snap.compositions.length,
      agents: snap.agents.length,
    },
    evaluation,
    integrated: integrated
      ? { ok: integrated.ok, sha: integrated.sha, written: integrated.written }
      : null,
    steps,
    hardGate: gate,
    ok: gate.ok === true && contribIds.length === ROLES.length && compositionId != null,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node timing/run-ablation.mjs [--receipt PATH] [--skip-lake] [--sandbox DIR]');
    process.exit(0);
  }

  mkdirSync(RECEIPTS, { recursive: true });
  const payloads = loadPayloads();
  const sandboxBase =
    args.sandbox || join(EXPEDITION_ROOT, '.ablation-sandbox');
  const noKitRoot = join(sandboxBase, 'no-kit');
  const fractisiRoot = join(sandboxBase, 'fractisi');

  const prepNoKit = prepareSandbox(noKitRoot, payloads);
  const prepFractisi = prepareSandbox(fractisiRoot, payloads);

  const trialStartedAt = new Date().toISOString();
  const noKit = armNoKit(noKitRoot, payloads, args);
  const fractisi = armFractisi(fractisiRoot, payloads, args);
  const trialEndedAt = new Date().toISOString();

  const commit = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });

  const receipt = {
    schema: 'fractisi.riemann-expedition.ablation.v1',
    label: 'riemann-fractisi-matched-ablation',
    trialStartedAt,
    trialEndedAt,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'Matched ablation of FractiSI task/claim/contribute/compose/git-integrate + lake build vs sequential no-kit file write + lake build, same frozen Lean payload bytes',
      whatThisDoesNotMeasure: [
        'LLM proof search or model reasoning time',
        'Mathlib analytic number theory / ζ formalization',
        'Anthropic ~30h FLT formalization (unlike activity — withdrawn as a speed lead)',
        'RH',
      ],
      payloadsFrozenBeforeClock: true,
      authoringOfPayloadBytes: 'pre-authored; identical SHA-256 both arms; written into sandbox inside the clock',
    },
    payloadHashes: payloads.hashes,
    commit: commit.status === 0 ? commit.stdout.trim() : null,
    prep: {
      noKitMissingBefore: prepNoKit.missingBefore,
      fractisiMissingBefore: prepFractisi.missingBefore,
    },
    arms: {
      no_kit: {
        ...noKit,
        durationSeconds: Number(noKit.durationSeconds.toFixed(6)),
        writeSeconds: Number(noKit.writeSeconds.toFixed(6)),
        sandbox: noKitRoot,
      },
      fractisi: {
        ...fractisi,
        durationSeconds: Number(fractisi.durationSeconds.toFixed(6)),
        sandbox: fractisiRoot,
      },
    },
    comparison: {
      bothHardGateOk: noKit.ok && fractisi.ok,
      noKitSeconds: Number(noKit.durationSeconds.toFixed(6)),
      fractisiSeconds: Number(fractisi.durationSeconds.toFixed(6)),
      deltaSeconds: Number((fractisi.durationSeconds - noKit.durationSeconds).toFixed(6)),
      fractisiOverheadRatio:
        noKit.durationSeconds > 0
          ? Number((fractisi.durationSeconds / noKit.durationSeconds).toFixed(4))
          : null,
      coordinationEvidence: {
        noKit: { tasks: 0, contributions: 0, compositions: 0 },
        fractisi: {
          tasks: fractisi.tasks,
          contributions: fractisi.contributions,
          compositions: fractisi.compositions,
          agents: fractisi.agents,
        },
      },
      interpretation:
        'Positive delta means FractiSI coordination path took longer than sequential write for this frozen-payload rebuild. That is an honest kit-overhead / coordination measurement, not a proof-search speedup.',
    },
    paths: {
      leanRoot: LEAN_ROOT,
      receipt: null,
      sandboxBase,
    },
  };

  const stamp = trialStartedAt.replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-ablation-${stamp}.json`);
  receipt.paths.receipt = receiptPath;
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');

  console.log(
    JSON.stringify(
      {
        receiptPath,
        bothOk: receipt.comparison.bothHardGateOk,
        noKitSeconds: receipt.comparison.noKitSeconds,
        fractisiSeconds: receipt.comparison.fractisiSeconds,
        deltaSeconds: receipt.comparison.deltaSeconds,
        fractisiTasks: fractisi.tasks,
        fractisiContributions: fractisi.contributions,
        fractisiCompositions: fractisi.compositions,
      },
      null,
      2,
    ),
  );

  process.exit(receipt.comparison.bothHardGateOk ? 0 : 1);
}

main();
