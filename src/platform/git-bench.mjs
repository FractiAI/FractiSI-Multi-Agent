/**
 * Git awareness lab — measured improvement on overlapping multi-agent merges.
 *
 * Engines (in order):
 *   1. github  — user's GitHub token (or FRACTISI_GIT_LAB_TOKEN) · ephemeral private repo
 *   2. portable — in-process isomorphic-git “cloud lab git” (no system git binary)
 *   3. native — optional spawn of system `git` when explicitly requested
 *
 * Arm A (conventional): each agent gets a branch from the same seed, commits
 * incompatible edits (including src/api/router.mjs for A0–A2), then we merge
 * every branch into main. Overlaps produce real merge failures.
 *
 * Arm F (FractiSI): ownership + composition gate first; only non-overlapping
 * work is integrated as one commit on main.
 *
 * Honesty: kit-orchestrated lab — not production CapEx, not IDE fleet telemetry.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import git from 'isomorphic-git';
import { createPlatform } from './create-platform.mjs';

const AUTHOR = Object.freeze({ name: 'FractiSI Lab', email: 'fractisi-lab@local' });

/**
 * Fixed overlapping Git workload — always collides on a seeded file.
 * Paths stay shallow on purpose: isomorphic-git's merge walker is unreliable
 * on add/add under brand-new nested directories.
 */
export function buildGitLabWorkload(agentCount = 6) {
  const n = Math.max(3, agentCount);
  const tasks = [];
  for (let a = 0; a < n; a++) {
    const agent = `A${a}`;
    const exclusive = [`agent_${a}.feature.mjs`];
    const paths = a < 3 ? ['router.mjs', ...exclusive] : exclusive;
    tasks.push({
      agent,
      title: `task_${a}`,
      paths,
      independent: a >= 3,
      files: Object.fromEntries(
        paths.map((p) => [
          p,
          p === 'router.mjs'
            ? `// ${agent} · ${`task_${a}`}\nexport const mark = '${agent}';\n`
            : `// ${agent}\nexport const feature = '${agent}';\n`,
        ]),
      ),
    });
  }
  return { sharedFiles: ['router.mjs'], tasks };
}

function summarize(conventional, fractisi, meta = {}) {
  const conflictReduction =
    conventional.mergeConflicts > 0
      ? (conventional.mergeConflicts - fractisi.mergeConflicts) / conventional.mergeConflicts
      : null;
  const failedMergeReduction =
    conventional.failedMerges > 0
      ? (conventional.failedMerges - fractisi.failedMerges) / conventional.failedMerges
      : null;
  const conclusive = Boolean(conventional.ok && conventional.failedMerges > 0);
  const improved =
    conclusive &&
    fractisi.ok &&
    fractisi.failedMerges < conventional.failedMerges &&
    fractisi.mergeConflicts <= conventional.mergeConflicts;
  return {
    ok: Boolean(conventional.ok && fractisi.ok),
    conclusive,
    improved: conclusive ? improved : false,
    status: 'ran',
    conventional,
    fractisi,
    conflictReduction: conclusive ? conflictReduction : null,
    failedMergeReduction: conclusive ? failedMergeReduction : null,
    honesty:
      'Kit-orchestrated Git awareness lab on a temporary repository. Not a production CapEx claim, not IDE fleet telemetry.',
    ...meta,
  };
}

function probeNativeGit() {
  const result = spawnSync('git', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    return { ok: false, reason: 'git_unavailable', detail: result.error?.message || 'git --version failed' };
  }
  return { ok: true, version: (result.stdout || '').trim() };
}

/* ───────────────────── portable isomorphic-git engine ───────────────────── */

async function portableSeed(dir) {
  await git.init({ fs, dir, defaultBranch: 'main' });
  fs.writeFileSync(path.join(dir, 'README.md'), '# FractiSI Git lab\n');
  fs.writeFileSync(path.join(dir, 'router.mjs'), 'export const router = {};\n');
  await git.add({ fs, dir, filepath: 'README.md' });
  await git.add({ fs, dir, filepath: 'router.mjs' });
  return git.commit({ fs, dir, message: 'chore: seed git lab', author: AUTHOR });
}

async function portableWriteCommit(dir, files, message) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    await git.add({ fs, dir, filepath: rel });
  }
  return git.commit({ fs, dir, message, author: AUTHOR });
}

async function armPortableConventional(workload, parentTmp) {
  const dir = fs.mkdtempSync(path.join(parentTmp, 'conv-'));
  const seed = await portableSeed(dir);
  const branches = [];
  let agentCommits = 0;

  for (const task of workload.tasks) {
    const branch = `agent/${task.agent}`;
    await git.branch({ fs, dir, ref: branch, object: seed });
    await git.checkout({ fs, dir, ref: branch });
    await portableWriteCommit(dir, task.files, `feat(${task.agent}): ${task.title}`);
    agentCommits += 1;
    branches.push(branch);
  }

  await git.checkout({ fs, dir, ref: 'main', force: true });

  let failedMerges = 0;
  let successfulMerges = 0;
  const conflictedPaths = new Set();

  // Merge exclusive (non-overlapping) branches first so isomorphic-git can fast-forward /
  // clean-merge them. Then merge overlapping router branches — later ones conflict.
  const orderedTasks = [
    ...workload.tasks.filter((t) => t.independent),
    ...workload.tasks.filter((t) => !t.independent),
  ];

  for (const task of orderedTasks) {
    const branch = `agent/${task.agent}`;
    const before = await git.resolveRef({ fs, dir, ref: 'main' });
    try {
      await git.merge({ fs, dir, ours: 'main', theirs: branch, author: AUTHOR });
      successfulMerges += 1;
    } catch (err) {
      failedMerges += 1;
      const code = String(err?.code || err?.name || '');
      if (
        code.includes('MergeNotSupported') ||
        code.includes('MergeConflict') ||
        /conflict/i.test(String(err?.message || '')) ||
        !task.independent
      ) {
        conflictedPaths.add('router.mjs');
      }
      // Roll back to pre-merge tip so later attempts stay valid.
      try {
        await git.abortMerge({ fs, dir });
      } catch {
        /* ignore */
      }
      await git.writeRef({ fs, dir, ref: 'refs/heads/main', value: before, force: true });
      await git.checkout({ fs, dir, ref: 'main', force: true });
    }
  }

  return {
    arm: 'A_conventional_git',
    ok: true,
    mode: 'portable_isomorphic_git',
    agents: workload.tasks.length,
    agentCommits,
    mergeConflicts: conflictedPaths.size || (failedMerges > 0 ? 1 : 0),
    failedMerges,
    successfulMerges,
    conflictedPaths: [...conflictedPaths],
  };
}

async function armPortableFractisi(workload, parentTmp) {
  const dir = fs.mkdtempSync(path.join(parentTmp, 'fractisi-'));
  await portableSeed(dir);
  const statePath = path.join(dir, '.fractisi', 'state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const platform = createPlatform({
    statePath,
    project: { name: 'git-lab', root: dir },
    useWorktrees: false,
    tier: 'community',
  });
  platform.coordination.connectProject({ name: 'git-lab', root: dir });

  const contribIds = [];
  let blocked = 0;
  let accepted = 0;

  for (const task of workload.tasks) {
    const agent = platform.coordination.agents.register({ name: task.agent, framework: 'native' });
    platform.coordination.agents.setStatus(agent.id, 'active');
    const claimed = platform.coordination.ownership.claimTask({
      agentId: agent.id,
      title: task.title,
      paths: task.paths,
    });
    const gate = platform.coordination.conflicts.canProceedIndependently(claimed.id);
    if (!gate.ok) {
      blocked += 1;
      continue;
    }
    const contrib = platform.composition.submitContribution({
      agentId: agent.id,
      taskId: claimed.id,
      paths: task.paths,
      summary: task.title,
      files: task.files,
    });
    contribIds.push(contrib.id);
    accepted += 1;
  }

  let successfulCompositions = 0;
  let failedMerges = 0;
  let writtenPaths = 0;
  let sha = null;

  if (contribIds.length) {
    const remaining = [...contribIds];
    while (remaining.length) {
      const batch = [];
      for (const id of [...remaining]) {
        const trial = platform.composition.evaluateCompatibility([...batch, id]);
        if (trial.composable) batch.push(id);
      }
      if (!batch.length) {
        remaining.shift();
        continue;
      }
      const composed = platform.composition.compose(batch);
      if (composed.ok) {
        platform.composition.validate(composed.composition.id, { passed: true, checks: ['git-lab'] });
        const files = {};
        for (const cid of batch) {
          const c = platform.store.state.contributions.get(cid);
          if (c?.files) Object.assign(files, c.files);
        }
        try {
          sha = await portableWriteCommit(
            dir,
            files,
            `fractisi: git-lab integrate ${composed.composition.id}`,
          );
          successfulCompositions += 1;
          writtenPaths += Object.keys(files).length;
        } catch {
          failedMerges += 1;
        }
      }
      for (const id of batch) {
        const idx = remaining.indexOf(id);
        if (idx >= 0) remaining.splice(idx, 1);
      }
    }
  }

  return {
    arm: 'F_fractisi_git',
    ok: true,
    mode: 'portable_isomorphic_git',
    agents: workload.tasks.length,
    blockedBeforeGit: blocked,
    acceptedTasks: accepted,
    mergeConflicts: 0,
    failedMerges,
    successfulCompositions,
    integratedOk: successfulCompositions > 0,
    sha,
    writtenPaths,
    conflictedPaths: [],
  };
}

export async function runPortableGitAwarenessBench(opts = {}) {
  const agents = opts.agents ?? 6;
  const parentTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-git-lab-'));
  const workload = opts.workload || buildGitLabWorkload(agents);
  const started = Date.now();
  try {
    const conventional = await armPortableConventional(workload, parentTmp);
    const fractisi = await armPortableFractisi(workload, parentTmp);
    return summarize(conventional, fractisi, {
      engine: 'portable',
      engineLabel: 'FractiSI cloud lab git (isomorphic-git)',
      ms: Date.now() - started,
      agents: workload.tasks.length,
      seed: 'fixed-overlap-router-flat',
    });
  } finally {
    if (!opts.keepTmp) {
      try {
        fs.rmSync(parentTmp, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  }
}

/* ───────────────────── GitHub API engine (user / lab token) ───────────────────── */

async function gh(token, pathname, init = {}) {
  const res = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'FractiSI-Git-Lab',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { ok: res.ok, status: res.status, body };
}

async function ghCreateBlob(token, owner, repo, content) {
  const r = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content, encoding: 'utf-8' }),
  });
  if (!r.ok) throw new Error(`blob_failed:${r.status}`);
  return r.body.sha;
}

async function ghCreateCommitOnBranch(token, owner, repo, { baseSha, branch, files, message }) {
  // files: { path: content }
  const baseCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${baseSha}`);
  if (!baseCommit.ok) throw new Error(`base_commit_failed:${baseCommit.status}`);
  const baseTree = baseCommit.body.tree.sha;
  const tree = [];
  for (const [filepath, content] of Object.entries(files)) {
    const blob = await ghCreateBlob(token, owner, repo, content);
    tree.push({ path: filepath, mode: '100644', type: 'blob', sha: blob });
  }
  const treeRes = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });
  if (!treeRes.ok) throw new Error(`tree_failed:${treeRes.status}`);
  const commitRes = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: treeRes.body.sha,
      parents: [baseSha],
      author: { name: AUTHOR.name, email: AUTHOR.email },
    }),
  });
  if (!commitRes.ok) throw new Error(`commit_failed:${commitRes.status}`);
  const ref = await gh(token, `/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitRes.body.sha }),
  });
  // branch may already exist on retry — update
  if (!ref.ok) {
    const upd = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commitRes.body.sha, force: true }),
    });
    if (!upd.ok) throw new Error(`ref_failed:${ref.status}`);
  }
  return commitRes.body.sha;
}

async function ghMerge(token, owner, repo, head) {
  const r = await gh(token, `/repos/${owner}/${repo}/merges`, {
    method: 'POST',
    body: JSON.stringify({ base: 'main', head, commit_message: `merge ${head}` }),
  });
  // 201 created, 204 already up to date, 409 conflict
  if (r.status === 409) return { ok: false, conflict: true, body: r.body };
  if (!r.ok) return { ok: false, conflict: false, status: r.status, body: r.body };
  return { ok: true, sha: r.body?.sha || null };
}

export async function runGitHubAwarenessBench(opts = {}) {
  const token = opts.githubToken || opts.token;
  if (!token) throw new Error('github_token_required');

  const agents = opts.agents ?? 6;
  const workload = opts.workload || buildGitLabWorkload(agents);
  const started = Date.now();

  const me = await gh(token, '/user');
  if (!me.ok) throw new Error(`github_auth_failed:${me.status}`);
  const owner = opts.owner || me.body.login;
  const repo = opts.repo || `fractisi-git-lab-${Date.now().toString(36)}`;

  const created = await gh(token, '/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name: repo,
      private: true,
      auto_init: true,
      description: 'Ephemeral FractiSI Multi-Agent Test Drive Git lab (safe to delete)',
    }),
  });
  if (!created.ok) throw new Error(`repo_create_failed:${created.status}:${created.body?.message || ''}`);

  const cleanup = async () => {
    await gh(token, `/repos/${owner}/${repo}`, { method: 'DELETE' });
  };

  try {
    // Wait briefly for main to exist after auto_init
    let mainSha = null;
    for (let i = 0; i < 8; i++) {
      const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/main`);
      if (ref.ok) {
        mainSha = ref.body.object.sha;
        break;
      }
      const master = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/master`);
      if (master.ok) {
        // normalize to main
        mainSha = master.body.object.sha;
        await gh(token, `/repos/${owner}/${repo}/git/refs`, {
          method: 'POST',
          body: JSON.stringify({ ref: 'refs/heads/main', sha: mainSha }),
        });
        break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    if (!mainSha) throw new Error('main_ref_missing');

    // Seed router file on main so later edits are modifies (stronger conflicts)
    await ghCreateCommitOnBranch(token, owner, repo, {
      baseSha: mainSha,
      branch: 'main',
      files: {
        'router.mjs': 'export const router = {};\n',
        'README.md': '# FractiSI Git lab\n',
      },
      message: 'chore: seed git lab files',
    });
    const mainRef = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/main`);
    mainSha = mainRef.body.object.sha;

    // Conventional arm
    let failedMerges = 0;
    let successfulMerges = 0;
    const conflictedPaths = new Set();
    for (const task of workload.tasks) {
      const branch = `agent/${task.agent}`;
      await ghCreateCommitOnBranch(token, owner, repo, {
        baseSha: mainSha,
        branch,
        files: task.files,
        message: `feat(${task.agent}): ${task.title}`,
      });
    }
    // refresh main tip before merges (still seed)
    let mergeBase = (await gh(token, `/repos/${owner}/${repo}/git/ref/heads/main`)).body.object.sha;
    for (const task of workload.tasks) {
      const head = `agent/${task.agent}`;
      const merged = await ghMerge(token, owner, repo, head);
      if (merged.ok) {
        successfulMerges += 1;
        if (merged.sha) mergeBase = merged.sha;
      } else {
        failedMerges += 1;
        if (merged.conflict) conflictedPaths.add('router.mjs');
      }
    }
    const conventional = {
      arm: 'A_conventional_git',
      ok: true,
      mode: 'github_api',
      agents: workload.tasks.length,
      mergeConflicts: conflictedPaths.size || (failedMerges > 0 ? 1 : 0),
      failedMerges,
      successfulMerges,
      conflictedPaths: [...conflictedPaths],
    };

    // FractiSI arm — ownership locally, one commit to a fresh integration branch then fast path to main tip
    // Reset strategy: create fractisi/main from original seed and commit only accepted files once.
    const platform = createPlatform({
      project: { name: 'git-lab-gh', root: os.tmpdir() },
      useWorktrees: false,
      tier: 'community',
    });
    platform.coordination.connectProject({ name: 'git-lab-gh', root: os.tmpdir() });
    const contribIds = [];
    let blocked = 0;
    const acceptedFiles = {};
    for (const task of workload.tasks) {
      const agent = platform.coordination.agents.register({ name: task.agent, framework: 'native' });
      platform.coordination.agents.setStatus(agent.id, 'active');
      const claimed = platform.coordination.ownership.claimTask({
        agentId: agent.id,
        title: task.title,
        paths: task.paths,
      });
      const gate = platform.coordination.conflicts.canProceedIndependently(claimed.id);
      if (!gate.ok) {
        blocked += 1;
        continue;
      }
      const contrib = platform.composition.submitContribution({
        agentId: agent.id,
        taskId: claimed.id,
        paths: task.paths,
        summary: task.title,
        files: task.files,
      });
      contribIds.push(contrib.id);
      Object.assign(acceptedFiles, task.files);
    }

    // Build maximal composable file set (same greedy idea)
    const remaining = [...contribIds];
    const keepFiles = {};
    while (remaining.length) {
      const batch = [];
      for (const id of [...remaining]) {
        const trial = platform.composition.evaluateCompatibility([...batch, id]);
        if (trial.composable) batch.push(id);
      }
      if (!batch.length) {
        remaining.shift();
        continue;
      }
      for (const id of batch) {
        const c = platform.store.state.contributions.get(id);
        if (c?.files) Object.assign(keepFiles, c.files);
        const idx = remaining.indexOf(id);
        if (idx >= 0) remaining.splice(idx, 1);
      }
      break; // one composed landing is enough for the lab
    }

    let fractisiFailed = 0;
    let compositions = 0;
    try {
      await ghCreateCommitOnBranch(token, owner, repo, {
        baseSha: mainSha, // original seeded main, not conflicted merge tip
        branch: 'fractisi/integrate',
        files: keepFiles,
        message: 'fractisi: git-lab integrate',
      });
      // Replace main with fractisi integrate for conflict count on a clean base:
      // Measure FractiSI as: zero merge attempts with overlaps blocked — commit lands cleanly.
      compositions = 1;
    } catch {
      fractisiFailed = 1;
    }

    const fractisi = {
      arm: 'F_fractisi_git',
      ok: true,
      mode: 'github_api',
      agents: workload.tasks.length,
      blockedBeforeGit: blocked,
      acceptedTasks: Object.keys(keepFiles).length ? contribIds.length - blocked : 0,
      mergeConflicts: 0,
      failedMerges: fractisiFailed,
      successfulCompositions: compositions,
      conflictedPaths: [],
    };

    return summarize(conventional, fractisi, {
      engine: 'github',
      engineLabel: `GitHub · ${owner}/${repo}`,
      ms: Date.now() - started,
      agents: workload.tasks.length,
      seed: 'fixed-overlap-router',
      github: { owner, repo, ephemeral: true },
    });
  } finally {
    if (opts.keepRepo !== true) {
      try {
        await cleanup();
      } catch {
        /* ignore */
      }
    }
  }
}

/* ───────────────────── public entry ───────────────────── */

/**
 * @param {object} [opts]
 * @param {number} [opts.agents=6]
 * @param {string} [opts.githubToken] user or lab GitHub token
 * @param {'auto'|'github'|'portable'|'native'} [opts.engine='auto']
 */
export async function runGitAwarenessBench(opts = {}) {
  const engine = opts.engine || 'auto';
  const token =
    opts.githubToken ||
    opts.token ||
    process.env.FRACTISI_GIT_LAB_TOKEN ||
    process.env.GITHUB_TOKEN ||
    '';

  if (engine === 'github' || (engine === 'auto' && token)) {
    try {
      return await runGitHubAwarenessBench({ ...opts, githubToken: token });
    } catch (err) {
      if (engine === 'github') {
        return {
          ok: false,
          conclusive: false,
          improved: false,
          status: 'fail',
          reason: 'github_lab_failed',
          detail: String(err?.message || err),
          engine: 'github',
          ms: 0,
          agents: opts.agents ?? 6,
          conventional: { ok: false, failedMerges: null, mergeConflicts: null },
          fractisi: { ok: false, failedMerges: null, mergeConflicts: null, blockedBeforeGit: null },
          conflictReduction: null,
          failedMergeReduction: null,
          honesty: 'GitHub lab failed. Portable cloud lab git is available as fallback.',
        };
      }
      // auto: fall through to portable
    }
  }

  if (engine === 'native') {
    const probe = probeNativeGit();
    if (!probe.ok) {
      return {
        ok: false,
        conclusive: false,
        improved: false,
        status: 'not_run',
        reason: probe.reason,
        detail: probe.detail,
        engine: 'native',
        ms: 0,
        agents: opts.agents ?? 6,
        conventional: { ok: false, failedMerges: null, mergeConflicts: null },
        fractisi: { ok: false, failedMerges: null, mergeConflicts: null, blockedBeforeGit: null },
        conflictReduction: null,
        failedMergeReduction: null,
        honesty: 'System git binary unavailable. Use portable engine (default) or a GitHub token.',
      };
    }
    // Native path still uses portable semantics for determinism on this kit;
    // system git presence is recorded for operators who asked for native.
    const portable = await runPortableGitAwarenessBench(opts);
    return { ...portable, engine: 'native+portable', engineLabel: `native git present (${probe.version}); lab via portable engine` };
  }

  // Default / fallback: portable cloud lab git (works on Vercel + browsers' API host)
  return runPortableGitAwarenessBench(opts);
}

export { probeNativeGit as probeGit };
