/**
 * HTML for the fixed Fractal Goldilocks Channel (FGC) ticker tape.
 */
import { recentNewsroomItems } from './headlines.mjs';

export const FGC_NAME = 'Fractal Goldilocks Channel';
export const FGC_SHORT = 'FGC';

/** Marquee loop period in seconds (must match css/site.css). */
export const NEWS_TICKER_PERIOD_S = 55;

/** sessionStorage key for wall-clock t0 so the tape does not restart on each page. */
export const NEWS_TICKER_PHASE_KEY = 'fgc-ticker-t0';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Inline boot: continue the marquee from session phase instead of restarting at 0.
 * Prefers-reduced-motion leaves CSS alone (animation already disabled).
 */
export function newsTickerPhaseScript() {
  const periodMs = NEWS_TICKER_PERIOD_S * 1000;
  const key = NEWS_TICKER_PHASE_KEY;
  // No "!" characters — FGC ticker HTML forbids exclamation marks sitewide.
  return `<script>
(function () {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var KEY = ${JSON.stringify(key)};
    var PERIOD_MS = ${periodMs};
    var t0 = sessionStorage.getItem(KEY);
    if (t0 === null) {
      t0 = String(Date.now());
      sessionStorage.setItem(KEY, t0);
    }
    var elapsed = (Date.now() - Number(t0)) % PERIOD_MS;
    if (elapsed < 0) elapsed += PERIOD_MS;
    var track = document.querySelector('.news-ticker-track');
    if (track) track.style.animationDelay = (-elapsed / 1000) + 's';
  } catch (e) { /* private mode or missing sessionStorage — restart is fine */ }
})();
</script>`;
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
  return `<aside class="news-ticker" role="region" aria-label="${FGC_NAME} Newsroom live headlines">
  <a class="news-ticker-brand" href="/blog/" title="${FGC_NAME} Newsroom">
    <span class="news-ticker-brand-mark">${FGC_SHORT}</span>
    <span class="news-ticker-brand-room">Newsroom</span>
  </a>
  <span class="news-ticker-live" aria-hidden="true">Live</span>
  <div class="news-ticker-viewport">
    <div class="news-ticker-track">
      <div class="news-ticker-group">${links}</div>
      <div class="news-ticker-group" aria-hidden="true">${links}</div>
    </div>
  </div>
  ${newsTickerPhaseScript()}
</aside>`;
}
