import assert from 'node:assert/strict';
import test from 'node:test';
import {
  blogDateMs,
  newscastHeadline,
  recentNewsroomItems,
  loadManifest,
} from '../../src/newsroom/headlines.mjs';
import { newsroomTickerHtml } from '../../src/newsroom/ticker.mjs';

test('blog dates parse as UTC noon', () => {
  assert.equal(blogDateMs('2026-11-25'), Date.UTC(2026, 10, 25, 12, 0, 0));
});

test('ticker headlines prefer Yes/No news-desk titles from the manifest', () => {
  const manifest = loadManifest();
  assert.ok((manifest.blog || []).length >= 3);
  for (const blog of manifest.blog) {
    const line = newscastHeadline(blog);
    assert.equal(line, String(blog.title).replace(/\s+/g, ' ').trim(), blog.slug);
    assert.equal(/!/.test(line), false, blog.slug);
    assert.ok(line.length >= 12, blog.slug);
  }
});

test('24h window prefers same-day blogs and fills when thin', () => {
  const now = Date.UTC(2026, 10, 25, 20, 0, 0);
  const title = 'Can FractiSI X-Ray the Hidden Organizational Structure of Neural Networks?';
  const manifest = {
    blog: [
      { slug: 'neural-xray-rhyme', title, date: '2026-11-25', dek: 'YES — x' },
      { slug: 'principal-rhyme-theorem', title: 'Is the Universe a Nested System of Rhymes?', date: '2026-11-25' },
      { slug: 'old-one', title: 'Old brief still on the shelf for fill?', date: '2026-11-01' },
    ],
  };
  const items = recentNewsroomItems(manifest, { nowMs: now, minItems: 3, maxItems: 5 });
  assert.ok(items.some((i) => i.slug === 'neural-xray-rhyme'));
  assert.equal(items.find((i) => i.slug === 'neural-xray-rhyme').headline, title);
  assert.ok(items.every((i) => i.href.startsWith('/blog/')));
});

test('manifest href can send live clicks to a program surface', () => {
  const now = Date.UTC(2026, 10, 29, 20, 0, 0);
  const items = recentNewsroomItems(
    {
      blog: [
        {
          slug: 'cigar-lounge-program',
          title: 'On SS Vibelandia, the Cigar Lounge keeps the night',
          date: '2026-11-29',
          href: '/test-drive/cigar-lounge/',
        },
      ],
    },
    { nowMs: now, minItems: 1, maxItems: 3 },
  );
  assert.equal(items[0].href, '/test-drive/cigar-lounge/');
});

test('ticker html links brand to /blog/ and items to blogs', () => {
  const title = 'Can FractiSI X-Ray the Hidden Organizational Structure of Neural Networks?';
  const html = newsroomTickerHtml({
    blog: [{ slug: 'neural-xray-rhyme', title, date: '2026-11-25' }],
  }, { nowMs: Date.UTC(2026, 10, 25, 18, 0, 0) });
  assert.match(html, /class="news-ticker"/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /news-ticker-brand-mark">FGC</);
  assert.match(html, /news-ticker-brand-room">Newsroom</);
  assert.match(html, /Fractal Goldilocks Channel Newsroom/);
  assert.match(html, /href="\/blog\/neural-xray-rhyme\/"/);
  assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(/!/.test(html), false);
});

test('fallback headline uses dek when title is too short', () => {
  assert.equal(
    newscastHeadline({ slug: 'unknown-slug', title: 'Title?', dek: 'YES — a measured Soft Story board held' }),
    'YES — a measured Soft Story board held',
  );
});
