/**
 * One-command try: Git + cloud token → worktrees → compose → commit → cloud deploy.
 */
import { checkTryPrereqs } from '../../platform/prereqs.mjs';
import { runTryFlow } from '../../platform/try-flow.mjs';

export async function tryPlatform(ctx) {
  const inPlace = ctx.flag('--in-place');
  const prod = ctx.flag('--prod');
  const prereqs = checkTryPrereqs(ctx.root, process.env);
  if (!prereqs.ok) {
    ctx.log('try · prerequisites not met');
    ctx.log(prereqs.message);
    ctx.log('Required: (1) Git  (2) FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN');
    return 2;
  }
  ctx.log('try · Git + cloud token OK — running end-to-end platform path');
  const result = await runTryFlow({
    cwd: ctx.root,
    log: (m) => ctx.log(m),
    inPlace,
    prod,
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
  ctx.log(`release · ${result.releaseId}`);
  ctx.log(`url     · ${result.url}`);
  return 0;
}
