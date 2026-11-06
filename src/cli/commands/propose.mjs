/** Propose a file contribution from an agent into its worktree. */
import fs from 'node:fs';
import { loadPlatform } from '../load-platform.mjs';

export function propose(ctx) {
  // tiny propose <agentId> <relPath> [content|--file abs]
  const agentId = ctx.argv[3];
  const relPath = ctx.argv[4];
  if (!agentId || !relPath) {
    ctx.log('Usage: node scripts/tiny.mjs propose <agentId> <path> [content]');
    ctx.log('   or: node scripts/tiny.mjs propose <agentId> <path> --file <localfile>');
    return 1;
  }
  const platform = loadPlatform(ctx, { useWorktrees: true });
  if (!platform.coordination.agents.get(agentId)) {
    ctx.log(`unknown agent ${agentId} — run: node scripts/tiny.mjs agents register <name>`);
    return 1;
  }
  let content = `// fractisi proposal ${new Date().toISOString()}\n`;
  const fileFlag = ctx.argv.indexOf('--file');
  if (fileFlag >= 0 && ctx.argv[fileFlag + 1]) {
    content = fs.readFileSync(ctx.argv[fileFlag + 1], 'utf8');
  } else if (ctx.argv[5] && ctx.argv[5] !== '--file') {
    content = ctx.argv.slice(5).join(' ') + '\n';
  }
  const agent = platform.store.state.agents.get(agentId);
  if (!agent.workspace) {
    platform.git.allocateScopedWorkspace(agentId, { cwd: ctx.root, useWorktree: true });
  }
  const contrib = platform.composition.submitContribution({
    agentId,
    paths: [relPath],
    summary: `propose ${relPath}`,
    files: { [relPath]: content },
  });
  platform.git.applyContribution(agentId, platform.store.state.contributions.get(contrib.id));
  const committed = platform.git.commitWorkspace(agentId, `fractisi(${agentId}): ${relPath}`);
  platform.persist();
  ctx.log(`propose · ${contrib.id} · ${relPath}`);
  if (committed.ok) ctx.log(`git · ${committed.sha?.slice(0, 7)}`);
  else ctx.log(`git · ${committed.error || 'workspace commit skipped'}`);
  return 0;
}
