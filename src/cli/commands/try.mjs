/**
 * Try FractiSI Multi-Agent.
 *
 * Community (free): Git → worktrees → compose → commit. No cloud deploy.
 * Paid (Team · Enterprise · Cloud): optional deploy with cloud token.
 * Real workload (`--workload`): Git only by default; `--deploy` is paid + token.
 */
import { checkTryPrereqs, checkGit } from '../../platform/prereqs.mjs';
import { resolveCloudToken } from '../../platform/cloud.mjs';
import { runTryFlow } from '../../platform/try-flow.mjs';
import { runRealWorkloadFlow } from '../../platform/real-workload-flow.mjs';
import { resolveProjectRoot } from '../project-root.mjs';
import { canDeploy, deployPaidMessage, resolveOperatorTier } from '../../platform/operator-tier.mjs';

export async function tryPlatform(ctx) {
  const workload = ctx.flag('--workload');
  const prepare = ctx.flag('--prepare');
  const inPlace = ctx.flag('--in-place');
  const prod = ctx.flag('--prod');
  const tier = resolveOperatorTier(ctx);
  const paidDeploy = canDeploy(tier);
  // Deploy is a paid feature (Team · Enterprise · Cloud). Community: compose + Git only.
  const askedDeploy = workload ? ctx.flag('--deploy') : !ctx.flag('--no-deploy');
  if (askedDeploy && !paidDeploy) {
    if (workload || ctx.flag('--deploy') || ctx.flag('--prod')) {
      for (const line of deployPaidMessage(tier)) ctx.log(line);
      return 2;
    }
    ctx.log('try · Community — compose + Git commit only (cloud deploy is paid)');
  }
  const wantDeploy = askedDeploy && paidDeploy;
  const repoRoot = resolveProjectRoot(ctx, { workload });

  if (workload) {
    const git = checkGit(repoRoot);
    if (!git.ok) {
      ctx.log('try · Git required for real workloads');
      ctx.log(git.detail || git.error);
      return 2;
    }
    if (!git.inRepo) {
      ctx.log(`try · ${repoRoot} is not a git repository — init git or pass --repo <project>`);
      return 2;
    }
    if (wantDeploy) {
      const cloud = resolveCloudToken(process.env);
      if (!cloud.ok) {
        ctx.log('try · --deploy needs FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN');
        ctx.log('Omit --deploy to compose + commit locally without a cloud token.');
        return 2;
      }
    } else {
      ctx.log(
        paidDeploy
          ? 'try · real workload · deploy skipped (pass --deploy for a cloud preview)'
          : 'try · real workload · deploy skipped (paid feature — Team · Enterprise · Cloud)',
      );
    }

    ctx.log(`try · real workload · repo ${repoRoot}`);
    const result = await runRealWorkloadFlow({
      repoRoot,
      log: (m) => ctx.log(m),
      prepareOnly: prepare,
      deploy: wantDeploy,
      noDeploy: !wantDeploy,
      prod,
      actor: process.env.USER || 'operator',
      env: process.env,
    });

    if (!result.ok) {
      ctx.log(`try · failed at ${result.stage}`);
      if (result.message) ctx.log(result.message);
      if (result.deploy?.cloud?.detail) ctx.log(String(result.deploy.cloud.detail).slice(-500));
      if (result.composed && result.composed.issues) {
        ctx.log(`compose issues · ${JSON.stringify(result.composed.issues).slice(0, 400)}`);
      }
      return 1;
    }

    if (result.prepareOnly) {
      ctx.log('try · prepare complete — edit in a worktree, then re-run without --prepare');
      return 0;
    }
    if (result.waiting) {
      ctx.log('try · waiting for real changes (repo is clean)');
      return 0;
    }

    ctx.log('try · success (real workload)');
    ctx.log(`repo    · ${result.repoRoot}`);
    ctx.log(`commit  · ${result.sha}`);
    if (result.url) {
      ctx.log(`release · ${result.releaseId}`);
      ctx.log(`url     · ${result.url}`);
    } else {
      ctx.log('deploy  · skipped (local compose + git commit only)');
      ctx.log('         add --deploy when this workload should publish a preview');
    }
    return 0;
  }

  // Sandbox / demo path
  const prereqs = wantDeploy
    ? checkTryPrereqs(repoRoot, process.env)
    : (() => {
        const git = checkGit(repoRoot);
        return {
          ok: git.ok,
          git,
          cloud: { ok: false },
          message: git.ok ? 'Git ready (deploy skipped)' : git.detail || git.error,
        };
      })();

  if (!prereqs.ok) {
    ctx.log('try · prerequisites not met');
    ctx.log(prereqs.message);
    ctx.log(
      wantDeploy
        ? 'Required: (1) Git  (2) FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN'
        : 'Required: Git  (cloud token only if you pass deploy / omit --no-deploy)',
    );
    return 2;
  }

  ctx.log(
    wantDeploy
      ? 'try · Git + cloud token OK — sandbox path with deploy'
      : 'try · Git OK — sandbox path without deploy',
  );

  const result = await runTryFlow({
    cwd: repoRoot,
    log: (m) => ctx.log(m),
    inPlace,
    prod,
    skipDeploy: !wantDeploy,
    actor: process.env.USER || 'operator',
  });

  if (!result.ok) {
    ctx.log(`try · failed at ${result.stage}`);
    if (result.deploy?.cloud?.detail) ctx.log(String(result.deploy.cloud.detail).slice(-500));
    if (result.prereqs) ctx.log(result.prereqs.message);
    return 1;
  }

  ctx.log('try · success');
  ctx.log(`sandbox · ${result.sandbox}`);
  ctx.log(`commit  · ${result.sha}`);
  if (result.url) {
    ctx.log(`release · ${result.releaseId}`);
    ctx.log(`url     · ${result.url}`);
  } else {
    ctx.log('deploy  · skipped');
  }
  return 0;
}
