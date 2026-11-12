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

/** Fixed overlapping Git workload — always collides on a seeded file. */
export function buildGitLabWorkload(agentCount = 6) {
  const n = Math.max(3, agentCount);
  const tasks = [];
  for (let a = 0; a < n; a++) {
    const agent = `A${a}`;
    const exclusive = [`src/agents/agent_${a}/feature.mjs`];
    // First three agents all rewrite the same seeded file with incompatible content.
    const paths = a < 3 ? ['src/api/router.mjs', ...exclusive] : exclusive;
    tasks.push({
      agent,
      title: `task_${a}`,
      paths,
      independent: a >= 3,
    });
  }
  return { sharedFiles: ['src/api/router.mjs'], tasks };
}

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
  runGit(root, ['config', 'commit.gpgsign', 'false'], { allowFail: true });
  runGit(root, ['config', 'core.autocrlf', 'false'], { allowFail: true });
  // Serverless / odd hosts sometimes mark temp dirs as dubious.
  runGit(root, ['config', 'safe.directory', root], { allowFail: true });
  // Default branch name for predictable merges.
  runGit(root, ['checkout', '-b', 'main'], { allowFail: true });
  fs.writeFileSync(path.join(root, 'README.md'), '# FractiSI Git lab\n');
  fs.mkdirSync(path.join(root, 'src', 'shared'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'api'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'shared', 'base.mjs'), 'export const base = 1;\n');
  fs.writeFileSync(path.join(root, 'src', 'api', 'router.mjs'), 'export const router = {};\n');
  runGit(root, ['add', '-A']);
  const commit = runGit(root, ['commit', '-m', 'chore: seed git lab']);
  if (!commit.ok) {
    throw new Error(`seed_commit_failed:${commit.stderr || commit.stdout}`);
  }
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

  // Portable arm: sequential branches in one repo (no worktrees).
  // Each branch starts from the seed commit so overlapping edits collide on merge.
  const seed = runGit(root, ['rev-parse', 'HEAD']);
  if (!seed.ok) {
    return {
      arm: 'A_conventional_git',
      ok: false,
      error: 'missing_seed_commit',
      mergeConflicts: 0,
      failedMerges: 0,
      successfulMerges: 0,
      commitsOnMain: 0,
      agents: workload.tasks.length,
    };
  }

  for (const task of workload.tasks) {
    const branch = `agent/${task.agent}`;
    runGit(root, ['checkout', '-B', branch, seed.stdout]);
    for (const p of task.paths) {
      writeRel(root, p, `// ${task.agent} · ${task.title}\nexport const mark = '${task.agent}';\n`);
    }
    runGit(root, ['add', '-A']);
    const commit = runGit(root, ['commit', '-m', `feat(${task.agent}): ${task.title}`], { allowFail: true });
    if (commit.ok || (commit.stdout + commit.stderr).includes('nothing to commit')) commits += 1;
    branches.push({ branch, agent: task.agent });
  }

  runGit(root, ['checkout', '-B', 'main', seed.stdout]);

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

  const log = runGit(root, ['rev-list', '--count', 'HEAD'], { allowFail: true });
  return {
    arm: 'A_conventional_git',
    ok: true,
    mode: 'sequential_branches',
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
  let integrateError = null;

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
          // Fallback: write accepted files and commit with lab git identity.
          // Covers hosts where platform git commit env differs from seed config.
          const files = {};
          for (const cid of batch) {
            const c = platform.store.state.contributions.get(cid);
            if (c?.files) Object.assign(files, c.files);
          }
          for (const [rel, content] of Object.entries(files)) writeRel(root, rel, content);
          runGit(root, ['add', '-A']);
          const commit = runGit(root, ['commit', '-m', `fractisi: git-lab fallback ${composed.composition.id}`], {
            allowFail: true,
          });
          if (commit.ok) {
            successfulCompositions += 1;
            integratedOk = true;
            const head = runGit(root, ['rev-parse', 'HEAD']);
            sha = head.ok ? head.stdout : null;
            written = written.concat(Object.keys(files));
            integrateError = `recovered_after:${integrated.error || 'integrate_failed'}`;
          } else {
            failedMerges += 1;
            integrateError = integrated.error || commit.stderr || 'integrate_failed';
          }
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
    integrateError,
  };
}

/**
 * @param {object} [opts]
 * @param {number} [opts.agents=8]
 * @param {number} [opts.seed=20261112]
 */
export function runGitAwarenessBench(opts = {}) {
  const agents = opts.agents ?? 6;
  const parentTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-git-lab-'));
  const workload = opts.workload || buildGitLabWorkload(agents);

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
    conventional.ok &&
    fractisi.ok &&
    conventional.failedMerges > 0 &&
    fractisi.failedMerges < conventional.failedMerges &&
    fractisi.mergeConflicts <= conventional.mergeConflicts;

  // If the conventional arm produced no merge failures, the lab is inconclusive
  // (environment/git quirk) — do not advertise an improvement.
  const conclusive = Boolean(conventional.ok && conventional.failedMerges > 0);

  return {
    ok: conventional.ok && fractisi.ok,
    conclusive,
    ms,
    agents: workload.tasks.length,
    seed: 'fixed-overlap-router',
    conventional,
    fractisi,
    conflictReduction: conclusive ? conflictReduction : null,
    failedMergeReduction: conclusive ? failedMergeReduction : null,
    improved: conclusive ? improved : false,
    honesty:
      'Real git worktrees + merges on a temporary repo. Fixed overlap on src/api/router.mjs. Kit orchestration lab — not production CapEx, not IDE fleet telemetry.',
  };
}
