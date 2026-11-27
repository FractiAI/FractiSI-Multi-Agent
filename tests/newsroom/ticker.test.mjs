import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { newsroomTickerHtml } from '../../src/newsroom/ticker.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('empty blog list yields empty ticker', () => {
  assert.equal(newsroomTickerHtml({ blog: [] }), '');
});

test('ticker duplicates the group for seamless marquee', () => {
  const html = newsroomTickerHtml(
    { blog: [{ slug: 'principal-rhyme-theorem', title: 'Q?', date: '2026-11-25' }] },
    { nowMs: Date.UTC(2026, 10, 25, 18, 0, 0) },
  );
  const groups = html.match(/news-ticker-group/g) || [];
  assert.equal(groups.length, 2);
});

test('FGC ticker marquee period is 120s (further slowdown past 82.5s)', () => {
  const css = readFileSync(join(root, 'css/site.css'), 'utf8');
  assert.match(css, /animation:\s*news-ticker-scroll\s+120s\s+linear\s+infinite/);
  assert.equal(/animation:\s*news-ticker-scroll\s+82\.5s/.test(css), false);
  assert.equal(/animation:\s*news-ticker-scroll\s+55s/.test(css), false);
});

test('FGC ticker reads as a golden Newsroom banner', () => {
  const html = newsroomTickerHtml(
    { blog: [{ slug: 'principal-rhyme-theorem', title: 'Q?', date: '2026-11-25' }] },
    { nowMs: Date.UTC(2026, 10, 25, 18, 0, 0) },
  );
  assert.match(html, /news-ticker-brand-mark">FGC</);
  assert.match(html, /news-ticker-brand-room">Newsroom</);
  const css = readFileSync(join(root, 'css/site.css'), 'utf8');
  assert.match(css, /\.news-ticker\s*\{[^}]*border-top:\s*3px solid var\(--signal\)/s);
  assert.match(css, /\.news-ticker-brand\s*\{[^}]*linear-gradient\([^)]*var\(--signal\)/s);
});
