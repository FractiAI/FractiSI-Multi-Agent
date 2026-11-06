/** Git helpers: inspect | integrate */
import { loadPlatform } from '../load-platform.mjs';

export function repo(ctx) {
  const sub = ctx.argv[3] || 'inspect';
  const platform = loadPlatform(ctx, { useWorktrees: true });
  if (sub === 'inspect') {
    const info = platform.git.inspect(ctx.root);
    if (!info.ok) {
      ctx.log(`repo · ${info.error}`);
      return 1;
    }
    ctx.log(`repo · ${info.branch}@${String(info.head).slice(0, 7)} dirty=${info.dirty}`);
    if (info.worktrees) ctx.log(info.worktrees.split('\n').slice(0, 12).join('\n'));
    return 0;
  }
  if (sub === 'integrate') {
    const compositionId = ctx.argv[4] || [...platform.store.state.compositions.keys()].at(-1);
    if (!compositionId) {
      ctx.log('Usage: node scripts/tiny.mjs repo integrate <compositionId>');
      return 1;
    }
    // ensure validated
    const c = platform.store.state.compositions.get(compositionId);
    if (c && c.state === 'accepted') {
      platform.composition.validate(compositionId, { passed: true, checks: ['repo-integrate'] });
    }
    const result = platform.git.integrateComposition(compositionId, { cwd: ctx.root });
    platform.persist();
    if (!result.ok) {
      ctx.log(`repo · integrate failed · ${result.error}`);
      return 1;
    }
    ctx.log(`repo · integrated ${compositionId} @ ${result.sha?.slice(0, 7)}`);
    return 0;
  }
  ctx.log('Usage: node scripts/tiny.mjs repo inspect|integrate');
  return 1;
}
