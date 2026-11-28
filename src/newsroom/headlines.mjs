/**
 * Fractal Goldilocks Channel (FGC) — newscast headlines from recent blog posts.
 * Window defaults to the past 24 hours (by blog `date`), with a fill from
 * newer posts if the window is thin so the ticker never goes empty.
 *
 * Ticker text prefers each post's Yes/No news-desk title from the manifest
 * (same cadence as the FGC blog surface). No cryptic README-style overrides.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const MS_DAY = 24 * 60 * 60 * 1000;

/**
 * @param {string} dateStr YYYY-MM-DD
 * @returns {number} ms at UTC noon that day
 */
export function blogDateMs(dateStr) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
}

/**
 * @param {{ slug: string, title?: string, dek?: string, answerHead?: string, date?: string }} blog
 * @returns {string}
 */
export function newscastHeadline(blog) {
  const title = String(blog.title || '').replace(/\s+/g, ' ').trim();
  // Prefer Yes/No news-desk titles from the FGC blog surface.
  if (title.length >= 12 && !/[!]/.test(title)) return title;
  if (blog.dek) {
    const d = String(blog.dek).replace(/\s+/g, ' ').trim();
    if (d.length >= 24 && d.length <= 140 && !/[!]/.test(d)) return d;
  }
  if (blog.answerHead) {
    const a = String(blog.answerHead)
      .replace(/^Short answer:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (a.length >= 12 && a.length <= 140 && !/[!]/.test(a)) return a;
  }
  return title || String(blog.slug || '').replace(/\s+/g, ' ').trim();
}

/**
 * @param {{ blog?: object[] }} [manifest]
 * @param {{ nowMs?: number, windowMs?: number, minItems?: number, maxItems?: number }} [opts]
 */
export function recentNewsroomItems(manifest, opts = {}) {
  const nowMs = opts.nowMs ?? Date.now();
  const windowMs = opts.windowMs ?? MS_DAY;
  const minItems = opts.minItems ?? 3;
  const maxItems = opts.maxItems ?? 12;
  const blogs = [...(manifest?.blog || [])]
    .filter((b) => b?.slug && Number.isFinite(blogDateMs(b.date)))
    .sort((a, b) => blogDateMs(b.date) - blogDateMs(a.date) || String(b.slug).localeCompare(a.slug));

  const inWindow = blogs.filter((b) => nowMs - blogDateMs(b.date) <= windowMs);
  const picked = (inWindow.length >= minItems ? inWindow : blogs).slice(0, maxItems);

  return picked.map((b) => ({
    slug: b.slug,
    date: b.date,
    // Optional manifest `href` sends live ticker / briefing clicks to a program
    // surface (e.g. Cigar Lounge) instead of the FGC article path.
    href: typeof b.href === 'string' && b.href.startsWith('/') ? b.href : `/blog/${b.slug}/`,
    headline: newscastHeadline(b),
    title: b.title || b.slug,
  }));
}

/** @param {string} [root] */
export function loadManifest(root = REPO_ROOT) {
  return JSON.parse(readFileSync(join(root, 'content/manifest.json'), 'utf8'));
}
