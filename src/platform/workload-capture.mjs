/**
 * Capture real working-tree / worktree changes into FractiSI contributions.
 * Used by `try --workload` so operators can run the platform on their own repo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  return {
    ok: !result.error && result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    status: result.status,
  };
}

/** Parse `git status --porcelain` into repo-relative paths (handles renames). */
export function listDirtyPaths(root) {
  const status = runGit(root, ['status', '--porcelain', '-uall']);
  if (!status.ok) return { ok: false, paths: [], error: status.stderr || status.stdout || 'git_status_failed' };
  const paths = [];
  for (const line of status.stdout.split('\n')) {
    if (!line.trim()) continue;
    // XY PATH or XY ORIG -> PATH
    const body = line.slice(3);
    const target = body.includes(' -> ') ? body.split(' -> ').pop() : body;
    const cleaned = target.replace(/^"|"$/g, '').trim();
    if (!cleaned) continue;
    if (cleaned.startsWith('.fractisi/')) continue;
    paths.push(cleaned.replace(/\\/g, '/'));
  }
  return { ok: true, paths: [...new Set(paths)] };
}

/** Read text file contents for paths under root (skips missing / binary-ish). */
export function readRepoFiles(root, paths, opts = {}) {
  const maxBytes = opts.maxBytes ?? 512 * 1024;
  const files = {};
  const skipped = [];
  for (const rel of paths) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      skipped.push({ path: rel, reason: 'missing' });
      continue;
    }
    const stat = fs.statSync(abs);
    if (stat.size > maxBytes) {
      skipped.push({ path: rel, reason: 'too_large', size: stat.size });
      continue;
    }
    const buf = fs.readFileSync(abs);
    // skip obvious binary
    if (buf.includes(0)) {
      skipped.push({ path: rel, reason: 'binary' });
      continue;
    }
    files[rel] = buf.toString('utf8');
  }
  return { files, skipped, paths: Object.keys(files) };
}

/**
 * Partition paths into agent buckets for multi-agent composition demos.
 * Prefer top-level directory; fall back to even split.
 */
export function partitionPaths(paths, { maxAgents = 4, minPerAgent = 1 } = {}) {
  const list = [...paths];
  if (!list.length) return [];

  const byTop = new Map();
  for (const p of list) {
    const top = p.includes('/') ? p.split('/')[0] : '_root';
    if (!byTop.has(top)) byTop.set(top, []);
    byTop.get(top).push(p);
  }

  let groups = [...byTop.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, maxAgents)
    .map(([label, pathsIn]) => ({ label, paths: pathsIn }));

  if (groups.length === 1 && list.length >= 2) {
    const mid = Math.ceil(list.length / 2);
    groups = [
      { label: 'alpha', paths: list.slice(0, mid) },
      { label: 'beta', paths: list.slice(mid) },
    ];
  }

  return groups.filter((g) => g.paths.length >= minPerAgent);
}

/** Diff paths between a worktree and the main repo HEAD. */
export function listWorktreeChangedPaths(repoRoot, worktreePath) {
  const diff = runGit(worktreePath, ['diff', '--name-only', 'HEAD']);
  const untracked = runGit(worktreePath, ['ls-files', '--others', '--exclude-standard']);
  const paths = [];
  if (diff.ok) paths.push(...diff.stdout.split('\n').filter(Boolean));
  if (untracked.ok) paths.push(...untracked.stdout.split('\n').filter(Boolean));
  return {
    ok: true,
    paths: [...new Set(paths.map((p) => p.replace(/\\/g, '/')).filter((p) => !p.startsWith('.fractisi/')))],
    repoRoot,
    worktreePath,
  };
}

/** Capture dirty main working tree into one or more contribution payloads. */
export function captureWorkingTree(root, opts = {}) {
  const dirty = listDirtyPaths(root);
  if (!dirty.ok) return { ok: false, error: dirty.error, contributions: [] };
  if (!dirty.paths.length) return { ok: true, contributions: [], paths: [] };

  const groups = partitionPaths(dirty.paths, opts);
  const contributions = [];
  for (const group of groups) {
    const { files, skipped, paths } = readRepoFiles(root, group.paths, opts);
    if (!paths.length) continue;
    contributions.push({
      label: group.label,
      paths,
      files,
      skipped,
      summary: `workload capture · ${group.label} · ${paths.length} file(s)`,
    });
  }
  return { ok: true, contributions, paths: dirty.paths };
}

/** Capture each agent worktree under `.fractisi/worktrees`. */
export function captureAgentWorktrees(platform) {
  const root = platform.store.state.project?.root;
  const contributions = [];
  for (const agent of platform.coordination.agents.list()) {
    const wt = agent.workspace?.path;
    if (!wt || !fs.existsSync(wt)) continue;
    const changed = listWorktreeChangedPaths(root, wt);
    if (!changed.paths.length) continue;
    const { files, skipped, paths } = readRepoFiles(wt, changed.paths);
    if (!paths.length) continue;
    contributions.push({
      agentId: agent.id,
      label: agent.name || agent.id,
      paths,
      files,
      skipped,
      summary: `worktree capture · ${agent.name || agent.id} · ${paths.length} file(s)`,
    });
  }
  return { ok: true, contributions };
}
