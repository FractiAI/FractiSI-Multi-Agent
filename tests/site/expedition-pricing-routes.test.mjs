import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('vercel redirects map short expedition + pricing URLs', () => {
  const cfg = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const map = Object.fromEntries(
    (cfg.redirects || []).map((r) => [r.source, r.destination]),
  );
  assert.equal(map['/pricing/'], '/product/pricing/');
  assert.equal(map['/pricing'], '/product/pricing/');
  assert.equal(map['/plans/'], '/product/pricing/');
  assert.equal(map['/pricing-plan/'], '/product/pricing/');
  assert.equal(
    map['/expedition-002/'],
    '/library/papers/fractisi-expedition-002-beyond-memory/',
  );
  assert.equal(
    map['/expedition-2/'],
    '/library/papers/fractisi-expedition-002-beyond-memory/',
  );
  assert.equal(
    map['/exp002/'],
    '/library/papers/fractisi-expedition-002-beyond-memory/',
  );
});

test('canonical pricing and expedition pages exist', () => {
  assert.equal(existsSync(join(root, 'product/pricing/index.html')), true);
  assert.equal(
    existsSync(join(root, 'library/papers/fractisi-expedition-002-beyond-memory/index.html')),
    true,
  );
  assert.equal(existsSync(join(root, 'expedition-002/index.html')), true);
});

test('Test Drive invite links expedition and pricing short paths', () => {
  const html = readFileSync(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(html, /href="\/expedition-002\/"/);
  assert.match(html, /href="\/pricing\/"/);
});
