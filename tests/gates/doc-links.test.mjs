import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkDocLinks, extractLinks } from '../../src/gates/doc-links.mjs';

function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-links-'));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkDocLinks().problems, []);
});

test('links in code are not links', () => {
  assert.deepEqual(extractLinks('[a](b.md) `[c](d.md)`\n```\n[e](f.md)\n```\n![g](h.png)'), ['b.md', 'h.png']);
});

test('a resolving link passes, and anchors and external links are not checked', () => {
  const root = tree({ 'a.md': '[b](b.md#part) [x](https://example.com/none) [c](#local)', 'b.md': '' });
  assert.deepEqual(checkDocLinks(root).problems, []);
});

test('negative control: a broken relative link fails and names the file', () => {
  assert.deepEqual(checkDocLinks(tree({ 'd/a.md': '[b](missing.md)' })).problems, ['d/a.md: broken link missing.md']);
});
