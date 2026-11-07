/** FractiSI Deploy CLI: create | approve | run | list — paid editions only. */
import { loadPlatform } from '../load-platform.mjs';
import { checkCloud } from '../../platform/prereqs.mjs';
import { canDeploy, deployPaidMessage, resolveOperatorTier } from '../../platform/operator-tier.mjs';

export function deploy(ctx) {
  const tier = resolveOperatorTier(ctx);
  if (!canDeploy(tier)) {
    for (const line of deployPaidMessage(tier)) ctx.log(line);
    return 2;
  }

  const sub = ctx.argv[3] || 'list';
  const platform = loadPlatform(ctx);
  const cloud = checkCloud(process.env);

  if (sub === 'list') {
    const list = platform.deploy.list();
    ctx.log(`deploy · ${list.length} release(s)`);
    for (const r of list) ctx.log(`- ${r.id} · ${r.state} · ${r.url || ''}`);
    if (!cloud.ok) ctx.log(`note · ${cloud.detail}`);
    return 0;
  }

  if (sub === 'create') {
    const compositionId = ctx.argv[4] || [...platform.store.state.compositions.keys()].at(-1);
    if (!compositionId) {
      ctx.log('Usage: node scripts/tiny.mjs deploy create <compositionId>');
      return 1;
    }
    const rc = platform.deploy.createReleaseCandidate(compositionId);
    platform.persist();
    ctx.log(`deploy · created ${rc.id} for ${compositionId} (pending approval)`);
    return 0;
  }

  if (sub === 'approve') {
    const id = ctx.argv[4];
    if (!id) {
      ctx.log('Usage: node scripts/tiny.mjs deploy approve <releaseId>');
      return 1;
    }
    const rc = platform.deploy.approve(id, process.env.USER || 'operator');
    platform.persist();
    ctx.log(`deploy · approved ${rc.id}`);
    return 0;
  }

  if (sub === 'run') {
    const id = ctx.argv[4];
    if (!id) {
      ctx.log('Usage: node scripts/tiny.mjs deploy run <releaseId> [--prod]');
      return 1;
    }
    if (!cloud.ok) {
      ctx.log(cloud.detail);
      return 2;
    }
    const result = platform.deploy.deploy(id, {
      projectRoot: ctx.root,
      prod: ctx.flag('--prod'),
    });
    platform.persist();
    if (!result.ok) {
      ctx.log(`deploy · failed · ${result.cloud?.error || result.release?.error}`);
      return 1;
    }
    ctx.log(`deploy · ${result.release.url}`);
    return 0;
  }

  ctx.log('Usage: node scripts/tiny.mjs deploy list|create|approve|run');
  return 1;
}
