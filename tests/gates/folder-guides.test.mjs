import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkFolderGuides } from '../../src/gates/folder-guides.mjs';

function tree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-guide-'));
  fs.mkdirSync(path.join(root, 'a'));
  for (const dir of ['', 'a']) for (const name of ['README.md', 'AGENTS.md']) fs.writeFileSync(path.join(root, dir, name), 'text');
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkFolderGuides().problems, []);
});

test('a complete tree passes', () => {
  assert.deepEqual(checkFolderGuides(tree()).problems, []);
});

test('negative control: a missing guide fails', () => {
  const root = tree();
  fs.rmSync(path.join(root, 'a/AGENTS.md'));
  assert.deepEqual(checkFolderGuides(root).problems, ['a: missing AGENTS.md']);
});

test('negative control: an empty guide fails', () => {
  const root = tree();
  fs.writeFileSync(path.join(root, 'a/README.md'), '  \n');
  assert.deepEqual(checkFolderGuides(root).problems, ['a: empty README.md']);
});

test('negative control: a new folder without guides fails', () => {
  const root = tree();
  fs.mkdirSync(path.join(root, 'new'));
  assert.equal(checkFolderGuides(root).problems.length, 2);
});
