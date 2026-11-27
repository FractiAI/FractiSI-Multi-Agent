import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { migrateBriefFragment, migrateBriefsTree } from '../../src/newsroom/migrate-briefs.mjs';

test('migrateBriefFragment skips already-structured fragments', () => {
  const html = '<section data-brief="birds-eye"><p>x</p></section>';
  assert.equal(migrateBriefFragment('demo', html), null);
});

test('migrateBriefFragment wraps legacy prose without inventing measurements', () => {
  const raw = `<p>Lead paragraph about the board.</p>
<h2>What we measured</h2>
<p>0/16 vs 10/16 on public structures.</p>
<h2>Honesty</h2>
<p>Not production benchmarks.</p>`;
  const out = migrateBriefFragment('demo', raw, {
    slug: 'demo',
    label: 'Demo',
    answerBody: ' Measured under seed.',
    actions: [{ href: '/library/papers/demo/', text: 'Paper' }],
  });
  assert.match(out, /data-brief="birds-eye"/);
  assert.match(out, /data-brief="synthesis"/);
  assert.match(out, /data-brief="insights"/);
  assert.match(out, /0\/16 vs 10\/16/);
  assert.match(out, /class="honesty"/);
  assert.equal(/!/.test(out), false);
});

test('migrateBriefsTree writes only unstructured files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fgc-mig-'));
  fs.mkdirSync(path.join(root, 'content/blog'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'content/manifest.json'),
    JSON.stringify({
      blog: [
        { slug: 'a', title: 'Is A?', answerHead: 'Short answer: Yes.' },
        { slug: 'b', title: 'Is B?', answerHead: 'Short answer: No.' },
      ],
    }),
  );
  fs.writeFileSync(
    path.join(root, 'content/blog/a.html'),
    '<section data-brief="birds-eye"><p>done</p></section>',
  );
  fs.writeFileSync(path.join(root, 'content/blog/b.html'), '<p>Legacy only.</p>');
  const result = migrateBriefsTree(root);
  assert.deepEqual(result.skipped, ['a']);
  assert.deepEqual(result.migrated, ['b']);
  assert.match(fs.readFileSync(path.join(root, 'content/blog/b.html'), 'utf8'), /data-brief="orientation"/);
});
