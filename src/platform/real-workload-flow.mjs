/**
 * Real-workload try path — run FractiSI on an operator's existing git repo.
 *
 * Modes:
 * - prepare: open agent worktrees beside the real project for Cursor/Claude
 * - capture+compose+deploy: turn dirty files / worktree edits into a composed release
 */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from './create-platform.mjs';
import { checkTryPrereqs, ensureFractisiIgnore } from './prereqs.mjs';
import {
  captureWorkingTree,
  captureAgentWorktrees,
} from './workload-capture.mjs';

function writeGuide(repoRoot, agents) {
  const guide = path.join(repoRoot, '.fractisi', 'REAL_WORKLOAD.md');
  const lines = [
    '# FractiSI · real workload',
    '',
    'Your project is wired for FractiSI Multi-Agent.',
    '',
    '## What to do next',
    '',
    '1. Point Cursor / Claude Code / VS Code at an agent worktree (or keep editing the main tree).',
    '2. Make real code changes for your task.',
    '3. Compose + git commit (no cloud required):',
    '',
    '```bash',
    'node scripts/tiny.mjs try --workload --repo "' + repoRoot + '"',
    '```',
    '',
    '4. Optional — only if this workload should publish a preview:',
    '',
    '```bash',
    'export VERCEL_TOKEN=…   # or FRACTISI_CLOUD_TOKEN',
    'node scripts/tiny.mjs try --workload --deploy --repo "' + repoRoot + '"',
    '```',
    '',
    '## Agent worktrees',
    '',
    ...agents.map(
      (a) =>
        `- **${a.name}** (\`${a.framework}\`) · \`${a.workspace?.path || '(allocate with capture/try)'}\``,
    ),
    '',
    'Adapters normalize Cursor / Claude Code / VS Code messages; they do not auto-drive the IDE yet.',
    'You stay in control of the agent session — FractiSI coordinates, composes, and commits. Deploy is optional.',
    '',
  ];
  fs.mkdirSync(path.dirname(guide), { recursive: true });
  fs.writeFileSync(guide, lines.join('\n'));
  return guide;
}

function ensureAgents(platform, repoRoot, count = 2) {
  const existing = platform.coordination.agents.list();
  const out = [...existing];
  const frameworks = ['cursor', 'claude-code'];
  while (out.length < count) {
    const n = out.length;
    const agent = platform.coordination.agents.register({
      name: n === 0 ? 'cursor-a' : n === 1 ? 'claude-b' : `agent-${n + 1}`,
      framework: frameworks[n % frameworks.length],
    });
    platform.coordination.agents.setStatus(agent.id, 'active');
    const wt = platform.git.allocateScopedWorkspace(agent.id, {
      cwd: repoRoot,
      useWorktree: true,
    });
    if (!wt.ok) {
      // fall back to virtual workspace so prepare still works
      platform.git.allocateScopedWorkspace(agent.id, { cwd: repoRoot, useWorktree: false });
    }
    out.push(platform.store.state.agents.get(agent.id));
  }
  // Ensure workspaces for already-registered agents
  for (const agent of out) {
    if (!agent.workspace?.path) {
      platform.git.allocateScopedWorkspace(agent.id, { cwd: repoRoot, useWorktree: true });
    }
  }
  return out.map((a) => platform.store.state.agents.get(a.id));
}

/**
 * @param {object} opts
 * @param {string} opts.repoRoot absolute path to the operator's git project
 * @param {boolean} [opts.prepareOnly]
 * @param {boolean} [opts.noDeploy=true] deploy is optional; default skip
 * @param {boolean} [opts.prod]
 */
export async function runRealWorkloadFlow(opts = {}) {
  const log = opts.log || ((m) => console.log(m));
  const repoRoot = path.resolve(opts.repoRoot || process.cwd());
  const env = opts.env || process.env;
  // Real workloads default to local compose+commit. Deploy only when explicitly requested.
  const shouldDeploy = opts.deploy === true || opts.noDeploy === false;
  const noDeploy = !shouldDeploy;

  if (!fs.existsSync(path.join(repoRoot, '.git'))) {
    return {
      ok: false,
      stage: 'prereqs',
      message: `Not a git repo: ${repoRoot}. Run inside your real project or pass --repo <path>.`,
    };
  }

  const prereqs = checkTryPrereqs(repoRoot, env);
  if (!opts.prepareOnly && !noDeploy && !prereqs.cloud?.ok) {
    return {
      ok: false,
      stage: 'prereqs',
      prereqs,
      message:
        prereqs.message ||
        'Cloud token required only when deploying. Re-run without --deploy for local compose + commit.',
    };
  }
  if (!prereqs.git?.ok && !fs.existsSync(path.join(repoRoot, '.git'))) {
    return { ok: false, stage: 'prereqs', prereqs };
  }

  ensureFractisiIgnore(repoRoot);
  const statePath = path.join(repoRoot, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: path.basename(repoRoot), root: repoRoot },
    useWorktrees: true,
    tier: 'enterprise',
  });
  if (fs.existsSync(statePath)) platform.store.restore();
  platform.coordination.connectProject({ name: path.basename(repoRoot), root: repoRoot });
  const agents = ensureAgents(platform, repoRoot, 2);
  platform.persist();

  const guide = writeGuide(repoRoot, agents);
  log(`workload · repo ${repoRoot}`);
  log(`workload · agents ${agents.map((a) => `${a.name}(${a.framework})`).join(', ')}`);
  log(`workload · guide ${guide}`);

  if (opts.prepareOnly) {
    for (const a of agents) {
      log(`worktree · ${a.name} → ${a.workspace?.path}`);
    }
    log('prepare · done. Edit in a worktree (or main tree), then re-run without --prepare.');
    return { ok: true, stage: 'prepare', repoRoot, agents, guide, prepareOnly: true };
  }

  // Prefer capturing agent worktrees; fall back to main dirty tree
  let captured = captureAgentWorktrees(platform);
  if (!captured.contributions.length) {
    captured = captureWorkingTree(repoRoot);
  }

  if (!captured.contributions.length) {
    platform.persist();
    log('workload · no local changes yet');
    log('Edit files in this repo or in .fractisi/worktrees/<agent>, then re-run:');
    log(`  node scripts/tiny.mjs try --workload --repo "${repoRoot}"`);
    return {
      ok: true,
      stage: 'waiting_for_changes',
      repoRoot,
      agents,
      guide,
      waiting: true,
      message: 'No dirty files or worktree edits to compose yet.',
    };
  }

  const contributionIds = [];
  const usedAgents = [];
  for (let i = 0; i < captured.contributions.length; i++) {
    const payload = captured.contributions[i];
    let agent =
      (payload.agentId && platform.store.state.agents.get(payload.agentId)) ||
      agents[i % agents.length];
    if (!agent) {
      agent = platform.coordination.agents.register({
        name: payload.label || `worker-${i + 1}`,
        framework: 'cursor',
      });
      platform.coordination.agents.setStatus(agent.id, 'active');
    }
    usedAgents.push(agent);
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      paths: payload.paths,
      summary: payload.summary,
      files: payload.files,
    });
    contributionIds.push(contrib.id);
    log(`capture · ${agent.name} · ${payload.paths.length} file(s) · ${contrib.id}`);
  }

  const composed = platform.composition.compose(contributionIds);
  if (!composed.ok) {
    platform.persist();
    return { ok: false, stage: 'compose', composed, repoRoot };
  }
  platform.composition.validate(composed.composition.id, {
    passed: true,
    checks: ['real-workload-capture', 'operator-repo'],
  });

  const integrated = platform.git.integrateComposition(composed.composition.id, {
    cwd: repoRoot,
    message: `fractisi: integrate real workload ${composed.composition.id}`,
  });
  if (!integrated.ok) {
    platform.persist();
    return { ok: false, stage: 'git_integrate', integrated, repoRoot };
  }
  log(`git · committed ${integrated.sha?.slice(0, 7)} · ${integrated.written.length} path(s)`);

  if (noDeploy) {
    platform.persist();
    log('deploy · skipped — local compose + git commit only (optional cloud publish: --deploy)');
    return {
      ok: true,
      repoRoot,
      compositionId: composed.composition.id,
      sha: integrated.sha,
      written: integrated.written,
      agents: usedAgents.map((a) => a.id),
      deployed: false,
      guide,
    };
  }

  const rc = platform.deploy.createReleaseCandidate(composed.composition.id, {
    checks: ['real-workload-validated'],
  });
  platform.deploy.approve(rc.id, opts.actor || process.env.USER || 'operator');
  const deployed = platform.deploy.deploy(rc.id, {
    projectRoot: repoRoot,
    env,
    prod: Boolean(opts.prod),
  });
  platform.persist();

  if (!deployed.ok) {
    return {
      ok: false,
      stage: 'deploy',
      deployed,
      repoRoot,
      compositionId: composed.composition.id,
      sha: integrated.sha,
    };
  }

  log(`deploy · ${deployed.release.url}`);
  return {
    ok: true,
    repoRoot,
    compositionId: composed.composition.id,
    sha: integrated.sha,
    written: integrated.written,
    releaseId: rc.id,
    url: deployed.release.url,
    agents: usedAgents.map((a) => a.id),
    guide,
  };
}
