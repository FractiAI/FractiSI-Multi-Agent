/**
 * Capture real working-tree or agent-worktree edits into FractiSI contributions.
 * Does not deploy — compose / try --workload handle integration; --deploy is optional.
 */
import { loadPlatform } from '../load-platform.mjs';
import { resolveProjectRoot } from '../project-root.mjs';
import {
  captureWorkingTree,
  captureAgentWorktrees,
} from '../../platform/workload-capture.mjs';

export function capture(ctx) {
  const repoRoot = resolveProjectRoot(ctx, { workload: true });
  const all = ctx.flag('--all') || !ctx.argv[3];
  const platform = loadPlatform(ctx, { root: repoRoot, useWorktrees: true });

  let captured;
  if (all) {
    captured = captureAgentWorktrees(platform);
    if (!captured.contributions.length) {
      captured = captureWorkingTree(repoRoot);
    }
  } else {
    const agentId = ctx.argv[3];
    if (!platform.coordination.agents.get(agentId)) {
      ctx.log(`unknown agent ${agentId}`);
      return 1;
    }
    const only = captureAgentWorktrees(platform);
    captured = {
      ok: true,
      contributions: only.contributions.filter((c) => c.agentId === agentId),
    };
    if (!captured.contributions.length) {
      ctx.log(`capture · no changes in worktree for ${agentId}`);
      return 0;
    }
  }

  if (!captured.contributions.length) {
    ctx.log('capture · nothing to capture (working tree clean)');
    ctx.log('Make edits in the repo or .fractisi/worktrees/<agent>, then capture again.');
    return 0;
  }

  const agents = platform.coordination.agents.list();
  for (let i = 0; i < captured.contributions.length; i++) {
    const payload = captured.contributions[i];
    const agent =
      (payload.agentId && platform.store.state.agents.get(payload.agentId)) ||
      agents[i % Math.max(agents.length, 1)] ||
      platform.coordination.agents.register({
        name: payload.label || `worker-${i + 1}`,
        framework: 'cursor',
      });
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      paths: payload.paths,
      summary: payload.summary,
      files: payload.files,
    });
    ctx.log(`capture · ${agent.name || agent.id} · ${payload.paths.length} file(s) · ${contrib.id}`);
  }
  platform.persist();
  ctx.log('Next: node scripts/tiny.mjs compose   then   node scripts/tiny.mjs repo integrate');
  ctx.log('Deploy stays optional: node scripts/tiny.mjs deploy create|approve|run  or  try --workload --deploy');
  return 0;
}
