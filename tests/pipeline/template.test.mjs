import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { TEMPLATE_PROJECT_NAME, deterministicEnv, resolveTemplate, templateCommit } from '../../src/pipeline/template.mjs';

function fakeTemplate() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-tpl-'));
  fs.mkdirSync(path.join(root, 'scripts/pipeline'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts/pipeline/stage_03_render.py'), '');
  fs.mkdirSync(path.join(root, '.venv/bin'), { recursive: true });
  fs.writeFileSync(path.join(root, '.venv/bin/python'), '');
  return root;
}
const repoRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-repo-'));

test('with no template configured the error says how to configure one', () => {
  assert.throws(() => resolveTemplate({ env: {}, repoRoot: repoRoot() }), /TINY_TEMPLATE_ROOT/);
});

test('a folder that is not a template is refused', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-tpl-'));
  assert.throws(() => resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repoRoot() }), /Not a template checkout/);
});

test('a template with no Python is refused', () => {
  const root = fakeTemplate();
  fs.rmSync(path.join(root, '.venv'), { recursive: true });
  assert.throws(() => resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repoRoot() }), /No template Python/);
});

test('the template is never changed: a missing view prints the command to create it', () => {
  const root = fakeTemplate();
  const repo = repoRoot();
  assert.throws(() => resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repo }), /ln -sfn/);
  assert.equal(fs.existsSync(path.join(root, 'projects')), false);
});

test('a view that resolves to this checkout is accepted, and one that does not is refused', () => {
  const root = fakeTemplate();
  const repo = repoRoot();
  const view = path.join(root, 'projects/working', TEMPLATE_PROJECT_NAME);
  fs.mkdirSync(path.dirname(view), { recursive: true });
  fs.symlinkSync(repo, view);
  const resolved = resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repo });
  assert.equal(resolved.project, `working/${TEMPLATE_PROJECT_NAME}`);
  assert.throws(() => resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repoRoot() }), /no view/);
});

test('an explicit Python overrides the default', () => {
  const root = fakeTemplate();
  const repo = repoRoot();
  const view = path.join(root, 'projects/working', TEMPLATE_PROJECT_NAME);
  fs.mkdirSync(path.dirname(view), { recursive: true });
  fs.symlinkSync(repo, view);
  const python = path.join(root, 'other-python');
  fs.writeFileSync(python, '');
  assert.equal(resolveTemplate({ env: { TINY_TEMPLATE_ROOT: root, TINY_TEMPLATE_PYTHON: python }, repoRoot: repo }).python, python);
});

test('a pinned commit file wins', () => {
  const root = fakeTemplate();
  fs.writeFileSync(path.join(root, 'TEMPLATE_COMMIT'), 'abc123\n');
  assert.equal(templateCommit(root), 'abc123');
});

test('negative control: a plain export nested in another repository does not report its commit', () => {
  const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-outer-'));
  const git = (...args) => spawnSync('git', ['-C', outer, '-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { encoding: 'utf8' });
  git('init', '-q');
  git('commit', '-q', '--allow-empty', '-m', 'outer');
  const nested = path.join(outer, 'nested');
  fs.mkdirSync(nested);
  assert.equal(templateCommit(nested), 'unknown');
  assert.equal(templateCommit(outer), git('rev-parse', 'HEAD').stdout.trim());
});

function dataDirWith(at) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-epoch-'));
  fs.writeFileSync(path.join(dir, 'analysis_summary.json'), JSON.stringify({ heap: { load: { start: { at } } } }));
  return dir;
}

test('the build epoch is the measured run, not the clock', () => {
  const env = deterministicEnv({ KEEP: '1' }, { dataDir: dataDirWith('2026-11-04T17:00:00.000Z') });
  assert.equal(env.SOURCE_DATE_EPOCH, String(Date.UTC(2026, 10, 4, 17) / 1000));
  assert.equal(env.KEEP, '1');
});

test('an epoch set by the caller wins', () => {
  assert.equal(deterministicEnv({ SOURCE_DATE_EPOCH: '42' }, { dataDir: '/nonexistent' }).SOURCE_DATE_EPOCH, '42');
});

test('negative control: a receipt with no usable time is refused', () => {
  assert.throws(() => deterministicEnv({}, { dataDir: dataDirWith('not a date') }), /no usable start time/);
});
