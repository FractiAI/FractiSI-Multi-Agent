import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { LAYERS, checkLayers } from '../../src/gates/layers.mjs';
import { REPO_ROOT } from '../../src/core/paths.mjs';

function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-layers-'));
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.join(root, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkLayers().problems, []);
});

test('every source folder has a layer', () => {
  const folders = fs.readdirSync(path.join(REPO_ROOT, 'src'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'tiny_footprint_labs')
    .map((entry) => entry.name);
  for (const folder of folders) assert.ok(LAYERS.flat().includes(folder), folder);
});

test('importing downward or from the same folder is allowed', () => {
  const root = tree({
    'src/core/a.mjs': "export const a = 1;\n",
    'src/core/b.mjs': "export { a } from './a.mjs';\n",
    'src/benchmarks/c.mjs': "import { a } from '../core/a.mjs';\nimport fs from 'node:fs';\n",
  });
  assert.deepEqual(checkLayers(root).problems, []);
});

test('negative control: an upward import fails', () => {
  const root = tree({
    'src/core/a.mjs': "import { c } from '../benchmarks/c.mjs';\n",
    'src/benchmarks/c.mjs': 'export const c = 1;\n',
  });
  assert.match(checkLayers(root).problems[0], /src\/core\/a\.mjs: imports src\/benchmarks/);
});

test('negative control: a dynamic upward import fails too', () => {
  const root = tree({ 'src/core/a.mjs': "const c = await import('../benchmarks/c.mjs');\n", 'src/benchmarks/c.mjs': '' });
  assert.equal(checkLayers(root).problems.length, 1);
});

test('negative control: importing a peer on the same layer fails', () => {
  const root = tree({ 'src/engine/a.mjs': "import '../labs/b.mjs';\n", 'src/labs/b.mjs': '' });
  assert.equal(checkLayers(root).problems.length, 1);
});

test('negative control: a new folder must be given a layer', () => {
  const root = tree({ 'src/newthing/a.mjs': 'export const a = 1;\n' });
  assert.match(checkLayers(root).problems[0], /has no layer/);
});
