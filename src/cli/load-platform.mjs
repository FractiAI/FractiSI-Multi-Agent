import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from '../platform/create-platform.mjs';
import { resolveOperatorTier } from '../platform/operator-tier.mjs';

/** Load platform bound to cwd/.fractisi or an explicit root. */
export function loadPlatform(ctx, opts = {}) {
  const root = opts.root || ctx.root || process.cwd();
  const statePath = path.join(root, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tier = opts.tier || resolveOperatorTier(ctx).id;
  const platform = createPlatform({
    statePath,
    project: { name: path.basename(root), root },
    useWorktrees: opts.useWorktrees ?? true,
    tier,
  });
  if (fs.existsSync(statePath)) platform.store.restore();
  if (!platform.store.state.project) {
    platform.coordination.connectProject({ name: path.basename(root), root });
  }
  return platform;
}
