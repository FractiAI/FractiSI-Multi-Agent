import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { TEMPLATE_PROJECT_NAME } from '../../src/pipeline/template.mjs';
import { validateRender } from '../../src/pipeline/validate.mjs';

/** A real template layout whose "Python" is a script that records its arguments and exits as told. */
function checkout({ folder = TEMPLATE_PROJECT_NAME, exitCode = 0 } = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-val-'));
  const repo = path.join(base, folder);
  fs.mkdirSync(repo);
  const root = path.join(base, 'template');
  fs.mkdirSync(path.join(root, 'scripts/pipeline'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts/pipeline/stage_03_render.py'), '');
  fs.mkdirSync(path.join(root, '.venv/bin'), { recursive: true });
  const log = path.join(base, 'args.txt');
  fs.writeFileSync(path.join(root, '.venv/bin/python'), `#!/bin/sh\necho "$@ epoch=$SOURCE_DATE_EPOCH" > "${log}"\nexit ${exitCode}\n`, { mode: 0o755 });
  fs.mkdirSync(path.join(root, 'projects/working'), { recursive: true });
  fs.symlinkSync(repo, path.join(root, 'projects/working', TEMPLATE_PROJECT_NAME));
  return { repo, root, log };
}

test('the validator runs against the project view', () => {
  const { repo, root, log } = checkout();
  const result = validateRender({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repo });
  assert.equal(result.project, `working/${TEMPLATE_PROJECT_NAME}`);
  const seen = fs.readFileSync(log, 'utf8');
  assert.match(seen, /stage_04_validate\.py --project working\/tiny-footprint-workstation/);
  assert.match(seen, /epoch=\d+/);
});

test('a failing validator fails the stage', () => {
  const { repo, root } = checkout({ exitCode: 1 });
  assert.throws(() => validateRender({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repo }), /validation failed with status 1/);
});

test('a checkout under another folder name is refused before the validator runs', () => {
  const { repo, root, log } = checkout({ folder: 'tiny-footprint-workstation-copy' });
  assert.throws(() => validateRender({ env: { TINY_TEMPLATE_ROOT: root }, repoRoot: repo }), /folder named tiny-footprint-workstation, not tiny-footprint-workstation-copy/);
  assert.equal(fs.existsSync(log), false);
});

test('with no template configured the stage refuses', () => {
  assert.throws(() => validateRender({ env: {} }), /TINY_TEMPLATE_ROOT/);
});
