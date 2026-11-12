/**
 * Real Git awareness lab — measured improvement on temporary repositories.
 *
 * Arm A (conventional): each agent gets a git worktree branch, commits edits,
 * then we merge every branch into main. Overlapping paths produce real merge conflicts.
 *
 * Arm F (FractiSI): ownership + composition gate first; only non-overlapping work
 * is integrated with one `integrateComposition` commit on main. Overlaps are blocked
 * before they hit Git.
 *
 * Honesty: kit-orchestrated Git on a temp repo — not a production CapEx claim,
 * not Cursor/Claude fleet telemetry.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createPlatform } from './create-platform.mjs';
import { buildWorkload } from './comparative-bench.mjs';

function runGit(cwd, args, opts = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_AUTHOR_NAME: 'FractiSI Lab',
      GIT_AUTHOR_EMAIL: 'fractisi-lab@local',
      GIT_COMMITTER_NAME: 'FractiSI Lab',
      GIT_COMMITTER_EMAIL: 'fractisi-lab@local',
    },
  });
  const statusOk = result.status === 0;
  return {
    // allowFail only suppresses throws for the caller; ok still reflects exit status.
    ok: statusOk,
    allowedFail: Boolean(opts.allowFail),
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function seedRepo(root) {
  fs.mkdirSync(root, { recursive: true });
  runGit(root, ['init']);
  runGit(root, ['config', 'user.name', 'FractiSI Lab']);
  runGit(root, ['config', 'user.email', 'fractisi-lab@local']);
  // Default branch name for predictable merges.
  runGit(root, ['checkout', '-b', 'main'], { allowFail: true });
  fs.writeFileSync(path.join(root, 'README.md'), '# FractiSI Git lab\n');
  fs.mkdirSync(path.join(root, 'src', 'shared'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'api'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'shared', 'base.mjs'), 'export const base = 1;\n');
  fs.writeFileSync(path.join(root, 'src', 'api', 'router.mjs'), 'export const router = {};\n');
  runGit(root, ['add', '-A']);
  runGit(root, ['commit', '-m', 'chore: seed git lab']);
}

function writeRel(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

function armConventionalGit(workload, parentTmp) {
  const root = fs.mkdtempSync(path.join(parentTmp, 'conv-'));
  seedRepo(root);
  const branches = [];
  let commits = 0;

  for (const task of workload.tasks) {
    const branch = `agent/${task.agent}`;
    const wt = path.join(root, '.worktrees', task.agent);
    fs.mkdirSync(path.dirname(wt), { recursive: true });
    const add = runGit(root, ['worktree', 'add', '-b', branch, wt]);
    if (!add.ok) {
      return {
        arm: 'A_conventional_git',
        ok: false,
        error: add.stderr || add.stdout || 'worktree_add_failed',
        mergeConflicts: 0,
        failedMerges: 0,
        successfulMerges: 0,
        commitsOnMain: 1,
        agents: workload.tasks.length,
      };
    }
    for (const p of task.paths) {
      writeRel(wt, p, `// ${task.agent} · ${task.title}\nexport const mark = '${task.agent}';\n`);
    }
    runGit(wt, ['add', '-A']);
    const commit = runGit(wt, ['commit', '-m', `feat(${task.agent}): ${task.title}`], { allowFail: true });
    if (commit.ok || (commit.stdout + commit.stderr).includes('nothing to commit')) commits += 1;
    branches.push({ branch, agent: task.agent });
  }

  let failedMerges = 0;
  let successfulMerges = 0;
  let conflictedPaths = new Set();
  for (const { branch } of branches) {
    const merge = runGit(root, ['merge', '--no-ff', '--no-edit', branch], { allowFail: true });
    if (!merge.ok) {
      failedMerges += 1;
      const unmerged = runGit(root, ['diff', '--name-only', '--diff-filter=U'], { allowFail: true });
      for (const line of unmerged.stdout.split('\n').filter(Boolean)) conflictedPaths.add(line);
      runGit(root, ['merge', '--abort'], { allowFail: true });
    } else {
      successfulMerges += 1;
    }
  }

  // cleanup worktrees best-effort
  for (const { branch, agent } of branches) {
    const wt = path.join(root, '.worktrees', agent);
    runGit(root, ['worktree', 'remove', '--force', wt], { allowFail: true });
    runGit(root, ['branch', '-D', branch], { allowFail: true });
  }

  const log = runGit(root, ['rev-list', '--count', 'HEAD'], { allowFail: true });
  return {
    arm: 'A_conventional_git',
    ok: true,
    agents: workload.tasks.length,
    agentCommits: commits,
    mergeConflicts: conflictedPaths.size,
    failedMerges,
    successfulMerges,
    commitsOnMain: Number(log.stdout) || 1,
    conflictedPaths: [...conflictedPaths],
  };
}

function armFractisiGit(workload, parentTmp) {
  const root = fs.mkdtempSync(path.join(parentTmp, 'fractisi-'));
  seedRepo(root);
  const statePath = path.join(root, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: 'git-lab', root },
    useWorktrees: true,
    tier: 'community',
  });
  platform.coordination.connectProject({ name: 'git-lab', root });

  const contribIds = [];
  let blocked = 0;
  let accepted = 0;

  for (const task of workload.tasks) {
    const agent = platform.coordination.agents.register({ name: task.agent, framework: 'native' });
    platform.coordination.agents.setStatus(agent.id, 'active');
    const claimed = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: task.title,
      paths: task.paths,
    });
    const gate = platform.coordination.conflicts.canProceedIndependently(claimed.id);
    if (!gate.ok) {
      blocked += 1;
      continue;
    }
    const files = {};
    for (const p of task.paths) {
      files[p] = `// ${task.agent} · ${task.title}\nexport const mark = '${task.agent}';\n`;
    }
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: claimed.id,
      paths: task.paths,
      summary: task.title,
      files,
    });
    contribIds.push(contrib.id);
    accepted += 1;
  }

  let successfulCompositions = 0;
  let integratedOk = false;
  let sha = null;
  let written = [];
  let failedMerges = 0;

  if (contribIds.length) {
    // Greedy independent batches (same spirit as comparative-bench arm C)
    const remaining = [...contribIds];
    while (remaining.length) {
      const batch = [];
      for (const id of [...remaining]) {
        const trial = platform.composition.evaluateCompatibility([...batch, id]);
        if (trial.composable) batch.push(id);
      }
      if (!batch.length) {
        remaining.shift();
        continue;
      }
      const composed = platform.composition.compose(batch);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, {
          passed: true,
          checks: ['git-lab'],
        });
        const integrated = platform.git.integrateComposition(composed.composition.id, {
          cwd: root,
          message: `fractisi: git-lab integrate ${composed.composition.id}`,
        });
        if (integrated.ok) {
          successfulCompositions += 1;
          integratedOk = true;
          sha = integrated.sha;
          written = written.concat(integrated.written || []);
        } else {
          failedMerges += 1;
        }
      }
      for (const id of batch) {
        const idx = remaining.indexOf(id);
        if (idx >= 0) remaining.splice(idx, 1);
      }
    }
  }

  const unmerged = runGit(root, ['diff', '--name-only', '--diff-filter=U'], { allowFail: true });
  const conflictedPaths = unmerged.stdout.split('\n').filter(Boolean);
  const log = runGit(root, ['rev-list', '--count', 'HEAD'], { allowFail: true });

  return {
    arm: 'F_fractisi_git',
    ok: true,
    agents: workload.tasks.length,
    blockedBeforeGit: blocked,
    acceptedTasks: accepted,
    mergeConflicts: conflictedPaths.length,
    failedMerges,
    successfulCompositions,
    integratedOk,
    sha,
    writtenPaths: written.length,
    commitsOnMain: Number(log.stdout) || 1,
    conflictedPaths,
  };
}

/**
 * @param {object} [opts]
 * @param {number} [opts.agents=8]
 * @param {number} [opts.seed=20261112]
 */
export function runGitAwarenessBench(opts = {}) {
  const agents = opts.agents ?? 8;
  const seed = opts.seed ?? 20261112;
  const parentTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-git-lab-'));
  const workload = buildWorkload(agents, seed, {
    interdependFraction: opts.interdependFraction ?? 0.45,
    sharedFiles: opts.sharedFiles ?? 12,
  });

  const started = Date.now();
  const conventional = armConventionalGit(workload, parentTmp);
  const fractisi = armFractisiGit(workload, parentTmp);
  const ms = Date.now() - started;

  // Prefer keeping temp dirs for debugging only when asked.
  if (!opts.keepTmp) {
    try {
      fs.rmSync(parentTmp, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  const conflictReduction =
    conventional.mergeConflicts > 0
      ? (conventional.mergeConflicts - fractisi.mergeConflicts) / conventional.mergeConflicts
      : null;
  const failedMergeReduction =
    conventional.failedMerges > 0
      ? (conventional.failedMerges - fractisi.failedMerges) / conventional.failedMerges
      : null;

  const improved =
    conventional.failedMerges > fractisi.failedMerges ||
    conventional.mergeConflicts > fractisi.mergeConflicts;

  return {
    ok: conventional.ok && fractisi.ok,
    ms,
    agents,
    seed,
    conventional,
    fractisi,
    conflictReduction,
    failedMergeReduction,
    improved,
    honesty:
      'Real git worktrees + merges on a temporary repo. Kit orchestration lab — not production CapEx, not IDE fleet telemetry.',
  };
}
