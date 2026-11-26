import assert from 'node:assert/strict';
import test from 'node:test';
import {
  blogDateMs,
  newscastHeadline,
  recentNewsroomItems,
  NEWSCAST_BY_SLUG,
} from '../../src/newsroom/headlines.mjs';
import { newsroomTickerHtml } from '../../src/newsroom/ticker.mjs';

test('blog dates parse as UTC noon', () => {
  assert.equal(blogDateMs('2026-11-25'), Date.UTC(2026, 10, 25, 12, 0, 0));
});

test('curated newscast lines have no exclamation marks', () => {
  for (const [slug, line] of Object.entries(NEWSCAST_BY_SLUG)) {
    assert.equal(/!/.test(line), false, slug);
    assert.ok(line.length >= 20, slug);
  }
});

test('24h window prefers same-day blogs and fills when thin', () => {
  const now = Date.UTC(2026, 10, 25, 20, 0, 0);
  const manifest = {
    blog: [
      { slug: 'neural-xray-rhyme', title: 'Q?', date: '2026-11-25', dek: 'YES — x' },
      { slug: 'principal-rhyme-theorem', title: 'Q?', date: '2026-11-25' },
      { slug: 'old-one', title: 'Old?', date: '2026-11-01' },
    ],
  };
  const items = recentNewsroomItems(manifest, { nowMs: now, minItems: 3, maxItems: 5 });
  assert.ok(items.some((i) => i.slug === 'neural-xray-rhyme'));
  assert.equal(items.find((i) => i.slug === 'neural-xray-rhyme').headline, NEWSCAST_BY_SLUG['neural-xray-rhyme']);
  assert.ok(items.every((i) => i.href.startsWith('/blog/')));
});

test('ticker html links brand to /blog/ and items to blogs', () => {
  const html = newsroomTickerHtml({
    blog: [{ slug: 'neural-xray-rhyme', title: 'Q?', date: '2026-11-25' }],
  }, { nowMs: Date.UTC(2026, 10, 25, 18, 0, 0) });
  assert.match(html, /class="news-ticker"/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, />FGC</);
  assert.match(html, /Fractal Goldilocks Channel/);
  assert.match(html, /href="\/blog\/neural-xray-rhyme\/"/);
  assert.equal(/!/.test(html), false);
});

test('fallback headline uses dek without bangs', () => {
  assert.equal(
    newscastHeadline({ slug: 'unknown-slug', title: 'Title?', dek: 'YES — a measured Soft Story board held' }),
    'YES — a measured Soft Story board held',
  );
});
