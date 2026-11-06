/** FractiSI try prerequisites: valid Git + cloud token. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { cloudPrereqMessage, resolveCloudToken } from './cloud.mjs';

export function checkGit(cwd = process.cwd()) {
  const which = spawnSync('git', ['--version'], { encoding: 'utf8' });
  if (which.status !== 0) {
    return { ok: false, error: 'git_not_installed', detail: 'Install Git, then retry.' };
  }
  const rootProbe = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' });
  const inRepo = rootProbe.status === 0;
  return {
    ok: true,
    version: (which.stdout || '').trim(),
    inRepo,
    root: inRepo ? rootProbe.stdout.trim() : cwd,
  };
}

export function checkCloud(env = process.env) {
  const cloud = resolveCloudToken(env);
  if (!cloud.ok) return { ok: false, error: 'cloud_token_missing', detail: cloudPrereqMessage(), cloud };
  return { ok: true, provider: cloud.provider, cloud: { ...cloud, token: cloud.token ? '[set]' : null } };
}

export function checkTryPrereqs(cwd = process.cwd(), env = process.env) {
  const git = checkGit(cwd);
  const cloud = checkCloud(env);
  return {
    ok: git.ok && cloud.ok,
    git,
    cloud,
    message: !git.ok ? git.detail || git.error : !cloud.ok ? cloud.detail : 'Git + cloud token ready',
  };
}

export function ensureFractisiIgnore(root) {
  const gi = path.join(root, '.gitignore');
  const line = '.fractisi/';
  if (!fs.existsSync(gi)) {
    fs.writeFileSync(gi, `${line}\n`);
    return;
  }
  const text = fs.readFileSync(gi, 'utf8');
  if (!text.split('\n').some((l) => l.trim() === line)) {
    fs.appendFileSync(gi, `\n${line}\n`);
  }
}
