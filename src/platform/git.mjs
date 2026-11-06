/**
 * Layer E — Tiny Footprint Git and version management.
 * Improves multi-agent workflow above Git; does not replace Git.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runGit(cwd, args, opts = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  if (result.error) {
    return { ok: false, error: result.error.message, stdout: '', stderr: String(result.stderr || '') };
  }
  if (result.status !== 0 && !opts.allowFail) {
    return {
      ok: false,
      error: `git ${args.join(' ')} failed`,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status,
    };
  }
  return { ok: true, stdout: (result.stdout || '').trim(), stderr: (result.stderr || '').trim(), status: result.status };
}

export function createGitIntegration(store, opts = {}) {
  function resolveRoot(explicit) {
    return explicit || store.state.project?.root || opts.cwd || process.cwd();
  }

  function inspect(cwd) {
    const root = resolveRoot(cwd);
    if (!fs.existsSync(path.join(root, '.git')) && !fs.existsSync(path.join(root, '.git'))) {
      // also allow gitdir files
      const gitFile = path.join(root, '.git');
      if (!fs.existsSync(gitFile)) {
        return { ok: false, root, error: 'not_a_git_repository' };
      }
    }
    const branch = runGit(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const head = runGit(root, ['rev-parse', 'HEAD']);
    const status = runGit(root, ['status', '--porcelain']);
    const remotes = runGit(root, ['remote', '-v'], { allowFail: true });
    const worktrees = runGit(root, ['worktree', 'list', '--porcelain'], { allowFail: true });
    return {
      ok: branch.ok && head.ok,
      root,
      branch: branch.ok ? branch.stdout : null,
      head: head.ok ? head.stdout : null,
      dirty: status.ok ? status.stdout.length > 0 : null,
      statusPorcelain: status.ok ? status.stdout : null,
      remotes: remotes.ok ? remotes.stdout : null,
      worktrees: worktrees.ok ? worktrees.stdout : null,
    };
  }

  function changedPaths(cwd) {
    const root = resolveRoot(cwd);
    const result = runGit(root, ['status', '--porcelain']);
    if (!result.ok) return { ok: false, paths: [], error: result.error };
    const paths = result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[A-Z?]{1,2}\s+/, '').replace(/^.* -> /, ''));
    return { ok: true, paths };
  }

  /**
   * Scoped agent workspace: metadata only by default.
   * Optional physical worktree when opts.useWorktrees is true.
   */
  function allocateScopedWorkspace(agentId, input = {}) {
    if (!store.state.agents.has(agentId)) throw new Error(`unknown_agent:${agentId}`);
    const root = resolveRoot(input.cwd);
    const scope = {
      agentId,
      kind: input.useWorktree || opts.useWorktrees ? 'git_worktree' : 'scoped_virtual',
      root,
      label: input.label || `fractisi-${agentId}`,
      paths: [...(input.paths || [])],
      createdAt: new Date().toISOString(),
    };
    if (scope.kind === 'git_worktree') {
      const dest = input.path || path.join(root, '.fractisi', 'worktrees', agentId);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (!fs.existsSync(dest)) {
        const created = runGit(root, ['worktree', 'add', '--detach', dest]);
        if (!created.ok) {
          return { ok: false, error: created.error || created.stderr, scope };
        }
      }
      scope.path = dest;
    }
    const agent = store.state.agents.get(agentId);
    agent.workspace = scope;
    agent.updatedAt = new Date().toISOString();
    store.emit('git.workspace_allocated', { agentId, kind: scope.kind });
    return { ok: true, scope };
  }

  function recordSafeCommit(meta = {}) {
    const entry = {
      id: `commit_meta_${Date.now()}`,
      compositionId: meta.compositionId || null,
      message: meta.message || '',
      sha: meta.sha || null,
      at: new Date().toISOString(),
    };
    store.emit('git.safe_commit_recorded', entry);
    return entry;
  }

  return { inspect, changedPaths, allocateScopedWorkspace, recordSafeCommit, runGit };
}
