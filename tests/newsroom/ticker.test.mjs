import assert from 'node:assert/strict';
import test from 'node:test';
import { newsroomTickerHtml } from '../../src/newsroom/ticker.mjs';

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
