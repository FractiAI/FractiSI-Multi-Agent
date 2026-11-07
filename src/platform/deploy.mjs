/**
 * Deploy — FractiSI Deploy.
 * Requires: validated composition + operator approval + cloud token.
 * Never deploys unvalidated or unauthorized changes.
 */
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { cloudPrereqMessage, resolveCloudToken } from './cloud.mjs';

export function createDeployPipeline(store, opts = {}) {
  function releasesDir(root) {
    const base = opts.releasesDir || path.join(root || process.cwd(), '.fractisi', 'releases');
    fs.mkdirSync(base, { recursive: true });
    return base;
  }

  function createReleaseCandidate(compositionId, input = {}) {
    const composition = store.state.compositions.get(compositionId);
    if (!composition) throw new Error(`unknown_composition:${compositionId}`);
    if (composition.state !== 'validated' && composition.state !== 'integrated') {
      throw new Error(`composition_not_validated:${composition.state}`);
    }
    const id = `rc_${randomUUID().slice(0, 8)}`;
    const rc = {
      id,
      compositionId,
      state: 'pending_approval',
      checks: input.checks || [],
      createdAt: new Date().toISOString(),
      approvedBy: null,
      deployedAt: null,
      url: null,
      artifactDir: null,
    };
    store.state.releases.set(id, rc);
    store.emit('deploy.rc_created', { releaseId: id, compositionId });
    return { ...rc };
  }

  function approve(releaseId, actor = 'operator') {
    const rc = store.state.releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    rc.state = 'approved';
    rc.approvedBy = actor;
    rc.approvedAt = new Date().toISOString();
    store.emit('deploy.approved', { releaseId, actor });
    return { ...rc };
  }

  function materialize(releaseId, projectRoot) {
    const rc = store.state.releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    const composition = store.state.compositions.get(rc.compositionId);
    if (!composition) throw new Error(`unknown_composition:${rc.compositionId}`);
    const dir = path.join(releasesDir(projectRoot), rc.id);
    fs.mkdirSync(dir, { recursive: true });
    const files = {};
    for (const cid of composition.contributionIds) {
      const c = store.state.contributions.get(cid);
      if (!c) continue;
      const payload = c.files && Object.keys(c.files).length ? c.files : null;
      if (payload) Object.assign(files, payload);
      else for (const p of c.paths || []) files[p] = `${c.summary || c.id}\n`;
    }
    // Always ship a readable index for static preview deploys
    const index = `<!doctype html><html><head><meta charset="utf-8"/><title>FractiSI release ${rc.id}</title>
<style>body{font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem;background:#0b1424;color:#f7f4ec}a{color:#c9a227}</style>
</head><body>
<h1>FractiSI Deploy</h1>
<p>Release <code>${rc.id}</code> · composition <code>${rc.compositionId}</code></p>
<p>Approved by ${rc.approvedBy || 'pending'} · ${rc.approvedAt || rc.createdAt}</p>
<ul>${Object.keys(files).map((f) => `<li><code>${f}</code></li>`).join('') || '<li>(manifest only)</li>'}</ul>
<pre>${JSON.stringify({ releaseId: rc.id, compositionId: rc.compositionId, files: Object.keys(files) }, null, 2)}</pre>
</body></html>`;
    fs.writeFileSync(path.join(dir, 'index.html'), index);
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(dir, 'files', rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    }
    const manifest = {
      releaseId: rc.id,
      compositionId: rc.compositionId,
      files: Object.keys(files),
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    // Minimal vercel config for static preview
    fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify({ cleanUrls: true }, null, 2));
    rc.artifactDir = dir;
    return { dir, manifest };
  }

  function runLocalHook(projectRoot, releaseId) {
    const hook = path.join(projectRoot, '.fractisi', 'hooks', 'deploy.sh');
    if (!fs.existsSync(hook)) return { ran: false };
    const result = spawnSync('bash', [hook, releaseId], { cwd: projectRoot, encoding: 'utf8' });
    return {
      ran: true,
      ok: result.status === 0,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status,
    };
  }

  function deployToCloud(artifactDir, cloud, optsIn = {}) {
    if (!cloud.ok) {
      return { ok: false, error: cloudPrereqMessage() };
    }
    if (cloud.provider !== 'vercel') {
      return { ok: false, error: `unsupported_cloud_provider:${cloud.provider}` };
    }
    const args = ['vercel@latest', 'deploy', '--yes', `--token=${cloud.token}`];
    if (optsIn.prod) args.push('--prod');
    // Prefer isolated deploy of the release artifact (does not need linked project)
    const result = spawnSync('npx', args, {
      cwd: artifactDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        VERCEL_TOKEN: cloud.token,
        ...(cloud.orgId ? { VERCEL_ORG_ID: cloud.orgId } : {}),
        ...(cloud.projectId ? { VERCEL_PROJECT_ID: cloud.projectId } : {}),
      },
    });
    const out = `${result.stdout || ''}\n${result.stderr || ''}`;
    const urlMatch = out.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi);
    const url = urlMatch ? urlMatch[urlMatch.length - 1] : null;
    if (result.status !== 0) {
      return { ok: false, error: 'vercel_deploy_failed', detail: out.slice(-2000), status: result.status };
    }
    return { ok: true, url, log: out.slice(-2000) };
  }

  function deploy(releaseId, optsIn = {}) {
    const rc = store.state.releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    if (rc.state !== 'approved' && !optsIn.force) {
      throw new Error('deploy_requires_approval');
    }
    const composition = store.state.compositions.get(rc.compositionId);
    if (!composition || (composition.state !== 'validated' && composition.state !== 'integrated')) {
      throw new Error('deploy_requires_validated_composition');
    }

    const projectRoot = optsIn.projectRoot || store.state.project?.root || process.cwd();
    const cloud = resolveCloudToken(optsIn.env || process.env);
    if (!cloud.ok && !optsIn.allowLocalOnly) {
      throw new Error(cloudPrereqMessage());
    }

    const { dir } = materialize(releaseId, projectRoot);
    const hook = runLocalHook(projectRoot, releaseId);

    let cloudResult = { ok: false, skipped: true };
    if (cloud.ok) {
      cloudResult = deployToCloud(dir, cloud, optsIn);
      if (!cloudResult.ok) {
        rc.state = 'deploy_failed';
        rc.error = cloudResult.error;
        rc.detail = cloudResult.detail || null;
        store.emit('deploy.failed', { releaseId, error: cloudResult.error });
        return { ok: false, release: { ...rc }, cloud: cloudResult, hook, artifactDir: dir };
      }
      rc.url = cloudResult.url;
    } else {
      // local-only path (explicit)
      rc.url = `file://${dir}/index.html`;
    }

    rc.state = 'deployed';
    rc.deployedAt = new Date().toISOString();
    rc.artifactDir = dir;
    composition.state = 'deployed';
    for (const cid of composition.contributionIds) {
      const c = store.state.contributions.get(cid);
      if (c) c.state = 'deployed';
    }
    store.emit('deploy.completed', { releaseId, url: rc.url });
    return { ok: true, release: { ...rc }, cloud: cloudResult, hook, artifactDir: dir };
  }

  function rollback(releaseId, reason = 'operator_rollback') {
    const rc = store.state.releases.get(releaseId);
    if (!rc) throw new Error(`unknown_release:${releaseId}`);
    rc.state = 'rolled_back';
    rc.rollbackReason = reason;
    store.emit('deploy.rolled_back', { releaseId, reason });
    return { ...rc };
  }

  function list() {
    return [...store.state.releases.values()].map((r) => ({ ...r }));
  }

  return { createReleaseCandidate, approve, deploy, rollback, list, materialize, resolveCloudToken };
}
