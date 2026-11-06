/** Initialize FractiSI Multi-Agent against an existing project. */
import fs from 'node:fs';
import path from 'node:path';
import { createPlatform } from '../../platform/create-platform.mjs';
import { featureMatrix } from '../../platform/entitlements.mjs';

export function init(ctx) {
  const root = ctx.argv[3] || ctx.root;
  const stateDir = path.join(root, '.fractisi');
  const statePath = path.join(stateDir, 'state.json');
  const configPath = path.join(stateDir, 'fractisi.config.json');
  fs.mkdirSync(stateDir, { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: path.basename(root), root },
    tier: 'professional',
  });
  const git = platform.git.inspect(root);
  platform.persist();

  if (!fs.existsSync(configPath)) {
    const template = {
      product: 'FractiSI Multi-Agent',
      tier: 'professional',
      projectRoot: root,
      capabilities: {
        coordination: true,
        composition: true,
        gitIntegration: true,
        deploy: false,
      },
      agents: {
        defaultPermissions: ['read', 'propose'],
        maxConcurrent: 25,
      },
      adapters: ['cursor', 'claude-code', 'vscode', 'openai', 'native'],
    };
    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
  }

  ctx.log(`init · ${platform.banner}`);
  ctx.log(`project · ${root}`);
  ctx.log(`state · ${statePath}`);
  ctx.log(`config · ${configPath}`);
  ctx.log(`git · ${git.ok ? `${git.branch}@${String(git.head).slice(0, 7)}` : git.error || 'unavailable'}`);
  ctx.log('Next: node scripts/tiny.mjs status');
  ctx.log(`Tiers: ${featureMatrix().tiers.join(' | ')}`);
  return 0;
}
