import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { listDirectories, listFiles } from '../../src/gates/files.mjs';

function tree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-files-'));
  for (const dir of ['a/b', 'node_modules/x', '.git/y', 'output/logs/z']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'a/b/f.txt'), '');
  fs.writeFileSync(path.join(root, 'node_modules/x/g.txt'), '');
  return root;
}

test('walks real folders and skips tool-owned ones', () => {
  const dirs = listDirectories(tree());
  assert.ok(dirs.includes('a/b'));
  assert.equal(dirs.some((d) => d.startsWith('node_modules') || d.startsWith('.git')), false);
  assert.equal(dirs.some((d) => d.startsWith('output/logs')), false);
});

test('lists files under real folders only', () => {
  assert.deepEqual(listFiles(tree()), ['a/b/f.txt']);
});
