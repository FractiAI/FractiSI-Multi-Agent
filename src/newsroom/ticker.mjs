/**
 * HTML for the fixed FractiSI Newsroom ticker tape.
 */
import { recentNewsroomItems } from './headlines.mjs';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{ blog?: object[] }} manifest
 * @param {{ nowMs?: number }} [opts]
 * @returns {string}
 */
export function newsroomTickerHtml(manifest, opts = {}) {
  const items = recentNewsroomItems(manifest, opts);
  if (!items.length) return '';

  const links = items
    .map(
      (i) =>
        `<a class="news-ticker-item" href="${esc(i.href)}" title="${esc(i.title)}">${esc(i.headline)}</a>`,
    )
    .join('<span class="news-ticker-dot" aria-hidden="true">·</span>');

  // Duplicate the strip so CSS marquee can loop without a gap.
  return `<aside class="news-ticker" role="region" aria-label="FractiSI Newsroom live headlines">
  <a class="news-ticker-brand" href="/blog/">FractiSI Newsroom</a>
  <span class="news-ticker-live" aria-hidden="true">Live</span>
  <div class="news-ticker-viewport">
    <div class="news-ticker-track">
      <div class="news-ticker-group">${links}</div>
      <div class="news-ticker-group" aria-hidden="true">${links}</div>
    </div>
  </div>
</aside>`;
}
