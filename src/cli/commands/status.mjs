/** Show FractiSI coordination status. */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from '../../platform/create-platform.mjs';

export function status(ctx) {
  const root = ctx.argv[3] || ctx.root;
  const statePath = path.join(root, '.fractisi', 'state.json');
  const platform = createPlatform({
    statePath: fs.existsSync(statePath) ? statePath : null,
    project: { name: path.basename(root), root },
  });
  if (fs.existsSync(statePath)) platform.store.restore();
  const s = platform.status();
  const git = platform.git.inspect(root);
  ctx.log(`status · ${platform.banner}`);
  ctx.log(`tier · ${s.tier}`);
  ctx.log(`agents · ${s.agents.total} total / ${s.agents.active} active`);
  ctx.log(`tasks · ${s.tasks.total} total / ${s.tasks.open} open`);
  ctx.log(`conflicts · ${s.conflicts.length}`);
  ctx.log(`contributions · ${s.contributions}`);
  ctx.log(`compositions · ${s.compositions}`);
  ctx.log(`git · ${git.ok ? `${git.branch} dirty=${git.dirty}` : git.error || 'n/a'}`);
  if (ctx.flag('--json')) console.log(JSON.stringify({ status: s, git }, null, 2));
  return 0;
}
