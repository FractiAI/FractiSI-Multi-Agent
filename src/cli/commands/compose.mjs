/** Evaluate and compose pending contributions (demo path uses open tasks). */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from '../../platform/create-platform.mjs';

export function compose(ctx) {
  const root = ctx.root;
  const statePath = path.join(root, '.fractisi', 'state.json');
  if (!fs.existsSync(statePath)) {
    ctx.log('No .fractisi/state.json — run: node scripts/tiny.mjs init');
    return 1;
  }
  const platform = createPlatform({ statePath, project: { name: path.basename(root), root } });
  platform.store.restore();
  const pending = [...platform.store.state.contributions.values()].filter((c) => c.state === 'proposed' || c.state === 'accepted');
  if (!pending.length) {
    ctx.log('compose · no proposed contributions');
    return 0;
  }
  const ids = pending.map((c) => c.id);
  const evaluation = platform.composition.evaluateCompatibility(ids);
  ctx.log(`compose · evaluating ${ids.length} contributions · composable=${evaluation.composable}`);
  for (const issue of evaluation.issues) {
    ctx.log(`- ${issue.type} · ${issue.a} vs ${issue.b} · severity=${issue.severity}`);
  }
  if (!evaluation.composable) {
    platform.persist();
    return 2;
  }
  const result = platform.composition.compose(ids);
  if (!result.ok) {
    ctx.log(`compose · rejected · ${result.reason}`);
    platform.persist();
    return 2;
  }
  platform.composition.validate(result.composition.id, { passed: true, checks: ['cli-compose'] });
  platform.composition.integrate(result.composition.id);
  platform.persist();
  ctx.log(`compose · integrated ${result.composition.id}`);
  return 0;
}
