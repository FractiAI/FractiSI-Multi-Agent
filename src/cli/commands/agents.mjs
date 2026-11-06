/** Register or list FractiSI agents. */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from '../../platform/create-platform.mjs';

export function agents(ctx) {
  const root = ctx.root;
  const statePath = path.join(root, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const platform = createPlatform({ statePath, project: { name: path.basename(root), root }, autoPersist: true });
  platform.store.restore();

  const sub = ctx.argv[3] || 'list';
  if (sub === 'list') {
    const list = platform.coordination.agents.list();
    ctx.log(`agents · ${list.length}`);
    for (const a of list) ctx.log(`- ${a.id} · ${a.name} · ${a.framework} · ${a.status}`);
    return 0;
  }
  if (sub === 'register') {
    const name = ctx.argv[4];
    if (!name) {
      ctx.log('Usage: node scripts/tiny.mjs agents register <name> [framework]');
      return 1;
    }
    const framework = ctx.argv[5] || 'native';
    const agent = platform.coordination.agents.register({ name, framework });
    platform.coordination.agents.setStatus(agent.id, 'active');
    platform.git.allocateScopedWorkspace(agent.id, { cwd: root });
    platform.persist();
    ctx.log(`registered · ${agent.id} (${framework})`);
    return 0;
  }
  ctx.log('Usage: node scripts/tiny.mjs agents list|register <name> [framework]');
  return 1;
}
