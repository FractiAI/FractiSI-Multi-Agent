import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { preflight, runStages } from '../../src/pipeline/runner.mjs';
import { TEMPLATE_PROJECT_NAME } from '../../src/pipeline/template.mjs';

const stage = (name, code) => ({ name, command: [process.execPath, '-e', `process.exit(${code})`] });

test('stages run in order and report their outcomes', () => {
  const lines = [];
  const { ok, outcomes } = runStages([stage('a', 0), stage('b', 0)], { log: (line) => lines.push(line) });
  assert.equal(ok, true);
  assert.deepEqual(outcomes.map((o) => [o.name, o.status]), [['a', 0], ['b', 0]]);
  assert.deepEqual(lines, ['[pipeline] a', '[pipeline] b']);
});

test('the pipeline stops at the first failure', () => {
  const { ok, outcomes } = runStages([stage('a', 0), stage('b', 3), stage('c', 0)], { log: () => {} });
  assert.equal(ok, false);
  assert.deepEqual(outcomes.map((o) => o.name), ['a', 'b']);
  assert.equal(outcomes[1].status, 3);
});

test('a command that cannot start counts as a failure', () => {
  const lines = [];
  const { ok } = runStages([{ name: 'x', command: ['/nonexistent/binary'] }], { log: (line) => lines.push(line) });
  assert.equal(ok, false);
  assert.ok(lines.some((line) => line.includes('failed')));
});

const node = process.execPath;
const fakeRepo = (name = TEMPLATE_PROJECT_NAME) => {
  const repo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tf-pre-')), name);
  fs.mkdirSync(repo);
  return repo;
};
function fakeTemplate(repo) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-pre-tpl-'));
  fs.mkdirSync(path.join(root, 'scripts/pipeline'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts/pipeline/stage_03_render.py'), '');
  fs.mkdirSync(path.join(root, '.venv/bin'), { recursive: true });
  fs.writeFileSync(path.join(root, '.venv/bin/python'), '');
  fs.mkdirSync(path.join(root, 'projects/working'), { recursive: true });
  fs.symlinkSync(repo, path.join(root, 'projects/working', TEMPLATE_PROJECT_NAME));
  return root;
}

test('stages with everything they need have no problems', () => {
  assert.deepEqual(preflight([{ name: 'a', command: [node, '-e', ''] }]), []);
});

test('a missing Python environment is found before anything runs, with the fix', () => {
  const repo = fakeRepo();
  const problems = preflight([{ name: 'figures', command: [path.join(repo, '.venv/bin/python'), 'x.py'], needs: 'uv sync --group figures' }], { repoRoot: repo });
  assert.match(problems[0], /figures needs \.venv\/bin\/python\. Run: uv sync --group figures/);
});

test('a missing Python package is found before anything runs', () => {
  const python = process.env.TINY_FOOTPRINT_PYTHON ?? 'python3';
  const stage = { name: 'llm', command: [python, 'x.py'], needs: 'uv sync --group llm', imports: ['surely_not_a_real_module'] };
  assert.match(preflight([stage])[0], /llm needs surely_not_a_real_module\. Run: uv sync --group llm/);
});

test('a missing template is found before the stages that would overwrite receipts', () => {
  const problems = preflight([{ name: 'render', command: [node, 'x'], needs: 'TINY_TEMPLATE_ROOT' }], { env: {} });
  assert.match(problems[0], /render: Set TINY_TEMPLATE_ROOT/);
});

test('a missing render tool is named', () => {
  const problems = preflight([{ name: 'render', command: [node, 'x'], tools: ['surely-not-a-real-tool'] }], { env: { PATH: process.env.PATH } });
  assert.match(problems[0], /render needs surely-not-a-real-tool on PATH/);
});

test('a checkout under another folder name is found before validation', () => {
  const repo = fakeRepo('some-other-name');
  const env = { TINY_TEMPLATE_ROOT: fakeTemplate(repo) };
  const problems = preflight([{ name: 'validate', command: [node, 'x'], needs: 'TINY_TEMPLATE_ROOT' }], { env, repoRoot: repo });
  assert.match(problems.join(' '), /folder named tiny-footprint-workstation, not some-other-name/);
  const right = fakeRepo();
  assert.deepEqual(preflight([{ name: 'validate', command: [node, 'x'], needs: 'TINY_TEMPLATE_ROOT' }], { env: { TINY_TEMPLATE_ROOT: fakeTemplate(right) }, repoRoot: right }), []);
});

test('repeated problems are reported once', () => {
  const repo = fakeRepo();
  const stage = (name) => ({ name, command: [node, 'x'], tools: ['surely-not-a-real-tool'] });
  assert.equal(preflight([stage('a'), stage('a')], { repoRoot: repo }).length, 1);
});
