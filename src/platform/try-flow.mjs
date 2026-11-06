/**
 * One-command try path.
 * Prerequisites: valid Git + cloud token (FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from './create-platform.mjs';
import { checkTryPrereqs, ensureFractisiIgnore } from './prereqs.mjs';

export async function runTryFlow(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const log = opts.log || ((m) => console.log(m));
  const env = opts.env || process.env;

  const prereqs = checkTryPrereqs(cwd, env);
  if (!prereqs.ok) {
    return { ok: false, stage: 'prereqs', prereqs };
  }

  // Prefer an isolated sandbox so trying is safe inside any clone
  const sandbox = opts.inPlace
    ? prereqs.git.root
    : path.join(prereqs.git.root || cwd, '.fractisi', 'try-sandbox');
  fs.mkdirSync(sandbox, { recursive: true });
  ensureFractisiIgnore(prereqs.git.root || cwd);

  const statePath = path.join(sandbox, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: path.basename(sandbox), root: sandbox },
    useWorktrees: true,
    tier: 'enterprise',
  });
  platform.git.ensureGitRepo(sandbox);
  platform.persist();

  log(`try · ${platform.banner}`);
  log(`git · ${prereqs.git.version}`);
  log(`cloud · ${prereqs.cloud.provider} token present`);
  log(`sandbox · ${sandbox}`);

  // Two agents, non-overlapping contributions
  const alpha = platform.coordination.agents.register({ name: 'alpha', framework: 'native' });
  const beta = platform.coordination.agents.register({ name: 'beta', framework: 'native' });
  platform.coordination.agents.setStatus(alpha.id, 'active');
  platform.coordination.agents.setStatus(beta.id, 'active');

  const wtA = platform.git.allocateScopedWorkspace(alpha.id, { cwd: sandbox, useWorktree: true });
  const wtB = platform.git.allocateScopedWorkspace(beta.id, { cwd: sandbox, useWorktree: true });
  if (!wtA.ok || !wtB.ok) {
    return { ok: false, stage: 'worktrees', wtA, wtB };
  }
  log(`worktrees · ${wtA.scope.path}`);
  log(`worktrees · ${wtB.scope.path}`);

  const c1 = platform.composition.submitContribution({
    agentId: alpha.id,
    paths: ['agents/alpha/hello.txt'],
    summary: 'alpha hello',
    files: { 'agents/alpha/hello.txt': `hello from alpha\n${new Date().toISOString()}\n` },
  });
  const c2 = platform.composition.submitContribution({
    agentId: beta.id,
    paths: ['agents/beta/hello.txt'],
    summary: 'beta hello',
    files: { 'agents/beta/hello.txt': `hello from beta\n${new Date().toISOString()}\n` },
  });

  platform.git.applyContribution(alpha.id, platform.store.state.contributions.get(c1.id));
  platform.git.applyContribution(beta.id, platform.store.state.contributions.get(c2.id));
  platform.git.commitWorkspace(alpha.id, 'fractisi(alpha): add hello');
  platform.git.commitWorkspace(beta.id, 'fractisi(beta): add hello');

  const composed = platform.composition.compose([c1.id, c2.id]);
  if (!composed.ok) {
    platform.persist();
    return { ok: false, stage: 'compose', composed };
  }
  platform.composition.validate(composed.composition.id, {
    passed: true,
    checks: ['try-flow-unit', 'non_overlapping_paths'],
  });
  const integrated = platform.git.integrateComposition(composed.composition.id, {
    cwd: sandbox,
    message: `fractisi: integrate ${composed.composition.id}`,
  });
  if (!integrated.ok) {
    platform.persist();
    return { ok: false, stage: 'git_integrate', integrated };
  }
  log(`git · committed ${integrated.sha?.slice(0, 7)} · files ${integrated.written.join(', ')}`);

  const rc = platform.deploy.createReleaseCandidate(composed.composition.id, {
    checks: ['try-flow-validated'],
  });
  platform.deploy.approve(rc.id, opts.actor || 'try-operator');
  const deployed = platform.deploy.deploy(rc.id, {
    projectRoot: sandbox,
    env,
    prod: Boolean(opts.prod),
  });
  platform.persist();

  if (!deployed.ok) {
    return { ok: false, stage: 'deploy', deployed, sandbox, compositionId: composed.composition.id, sha: integrated.sha };
  }

  log(`deploy · ${deployed.release.url}`);
  return {
    ok: true,
    sandbox,
    agents: [alpha.id, beta.id],
    compositionId: composed.composition.id,
    sha: integrated.sha,
    releaseId: rc.id,
    url: deployed.release.url,
    artifactDir: deployed.artifactDir,
    prereqs,
  };
}
