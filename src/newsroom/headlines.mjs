/**
 * Fractal Goldilocks Channel (FGC) — newscast headlines from recent blog posts.
 * Window defaults to the past 24 hours (by blog `date`), with a fill from
 * newer posts if the window is thin so the ticker never goes empty.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

/** Curated newscast lines (no exclamation marks). Fallback: Short answer / title. */
export const NEWSCAST_BY_SLUG = Object.freeze({
  'neural-xray-rhyme-standalones':
    'Eleven Neural X-Ray and rhyme kits now ship as public standalone repos — 11 of 11 verified',
  'neural-xray-rhyme':
    'Hinton still calls deep nets a black box. FractiSI X-rays the organizational rhyme instead',
  'compositional-wet-lab-scale':
    'Compositional wet-lab evidence: distributed electrical programs scale as rhymes, not parts',
  'universal-rhyme-wet-lab':
    'Wet-lab chain says computation can live in rhyme across EM substrates',
  'principal-rhyme-theorem':
    'Principal Rhyme Theorem pins the universe as a nested catalog of organizational rhymes',
  'riemann-fractisi-expedition':
    'Riemann invent challenge: FractiSI expedition reports Anthropic-comparable Soft Story clock',
  'adversarial-world':
    'Adversarial Soft Story board: full FractiSI awareness holds where linear agents break',
  'cancer-rhyme-expedition':
    'Cancer rhyme expedition: Model C fingerprints score phenotype across Soft Story boards',
  'relational-continuity-rhyme':
    'Relational continuity: rhyme accuracy holds across partners, QA, and agent handoffs',
  'diverse-redundancy-inbreeding':
    'Diverse redundancy holds nesting depth where cloned copies collapse under shared-cause failure',
  'llm-rhyme-cosmic-genome':
    'LLM language-pack rhyme reads cosmic and genome fixtures without a frontier bake-off',
  'cosmic-rhyme-expedition':
    'Cosmic rhyme expedition catalogs public NASA, JPL, OpenNGC, and WMAP residual structure',
  'pilot-rhyme-expedition':
    'Director/Pilot role rhyme recovers six-hop missions flat peers miss, at a smaller store',
  'nvidia-goldilocks-moment':
    'NVIDIA Goldilocks note: organizational catalog case for the awareness expedition',
  'shared-world-collective-intelligence':
    'Shared-world collective intelligence beats exact-text caches on non-identical sessions',
  'aai-symposium-2026':
    'Symposium archive: Multi-Agent World Inference Rhyme Test Drive remains on the kit',
});

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
  const curated = NEWSCAST_BY_SLUG[blog.slug];
  if (curated) return curated;
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
  return String(blog.title || blog.slug).replace(/\s+/g, ' ').trim();
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
    href: `/blog/${b.slug}/`,
    headline: newscastHeadline(b),
    title: b.title || b.slug,
  }));
}

/** @param {string} [root] */
export function loadManifest(root = REPO_ROOT) {
  return JSON.parse(readFileSync(join(root, 'content/manifest.json'), 'utf8'));
}
