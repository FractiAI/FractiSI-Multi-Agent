import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkSiteLinks, extractPageLinks } from '../../src/gates/site-links.mjs';

function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-site-'));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkSiteLinks().problems, []);
});

test('links lose their anchors and queries, and a bare anchor is not a link', () => {
  assert.deepEqual(extractPageLinks('<a href="a.html#x"><img src="b.png?v=1"><a href="#top">'), ['a.html', 'b.png']);
});

test('site-root, relative and clean URLs resolve as vercel.json serves them', () => {
  const root = tree({
    'index.html': '<a href="/open/"><a href="/"><a href="/simple"><a href="sub/a%20b.png"><a href="https://example.com/none">',
    'open/index.html': '<a href="../index.html">',
    'simple.html': '',
    'sub/a b.png': '',
  });
  assert.deepEqual(checkSiteLinks(root).problems, []);
});

test('negative control: a broken link fails and names the page', () => {
  const { problems } = checkSiteLinks(tree({ 'product/index.html': '<a href="/missing/"><img src="gone.png">' }));
  assert.deepEqual(problems, ['product/index.html: broken link /missing/', 'product/index.html: broken link gone.png']);
});

test('the rendered web edition and papers rendered elsewhere are not checked', () => {
  const root = tree({ 'output/web/index.html': '<a href="missing.html">', 'library/papers/a/index.html': '<a href="./missing.md">' });
  assert.deepEqual(checkSiteLinks(root).problems, []);
});
