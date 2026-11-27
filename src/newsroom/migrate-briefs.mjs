/**
 * Migrate legacy FGC blog fragments into data-brief sections.
 * Preserves existing HTML claims. Does not invent measurements.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  extractHonesty,
  fallbackBirdsEye,
  fallbackSynthesis,
  fallbackImplications,
  fallbackOrientation,
} from './executive-brief.mjs';

const SYNTHESIS_RE =
  /rhyme|synthesis|framework|two rhyming|nested map|progression|claims,? kept|goldilocks|world model/i;
const IMPLICATIONS_RE =
  /why it matters|why the human|why not just|why reuse|why a framework|why this matches|why wiring|why this symposium|what this (gives|changes|hands)|framework value/i;
const ORIENTATION_RE =
  /invitation|what to do|try it|what a next|what thickening is for|links|opening remarks|what we want|plain reading/i;
const INSIGHTS_RE =
  /what we (measured|found|saw|tested|observed|assembled|did)|results|measured|experiment|hypothesis|kill|verdicts|discovery catalog|candidates|paper-math|wiring versus|assembled path|novelty|protein|collaboration|lab measured|held-out|nested map|secondary/i;

function splitByH2(html) {
  const parts = String(html || '').split(/(?=<h2\b)/i);
  const lead = [];
  const sections = [];
  for (const part of parts) {
    if (!part.trim()) continue;
    const m = part.match(/^<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    if (!m) {
      lead.push(part);
      continue;
    }
    sections.push({ title: m[1].replace(/<[^>]+>/g, '').trim(), html: part });
  }
  return { lead: lead.join('\n').trim(), sections };
}

function bucketSection(title) {
  if (/^honesty$/i.test(title)) return 'honesty';
  if (ORIENTATION_RE.test(title)) return 'orientation';
  if (IMPLICATIONS_RE.test(title)) return 'implications';
  if (SYNTHESIS_RE.test(title)) return 'synthesis';
  if (INSIGHTS_RE.test(title)) return 'insights';
  return 'insights';
}

function wrap(id, inner) {
  return `<section data-brief="${id}">\n${inner.trim()}\n</section>`;
}

/**
 * @param {string} slug
 * @param {string} raw
 * @param {object} entry
 * @returns {string|null} null when already structured
 */
export function migrateBriefFragment(slug, raw, entry = { slug }) {
  if (/data-brief=["']birds-eye["']/.test(raw)) return null;
  const stripped = raw
    .replace(/<section[^>]*aria-label="Short answer"[^>]*>[\s\S]*?<\/section>\s*/gi, '')
    .replace(/<p class="answer">[\s\S]*?<\/p>\s*/gi, '');
  const { honesty, rest } = extractHonesty(stripped);
  const { lead, sections } = splitByH2(rest);

  const buckets = {
    'birds-eye': [],
    synthesis: [],
    insights: [],
    implications: [],
    orientation: [],
  };

  if (lead) buckets['birds-eye'].push(lead);
  for (const sec of sections) {
    const b = bucketSection(sec.title);
    if (b === 'honesty') continue;
    buckets[b].push(sec.html);
  }

  if (!buckets['birds-eye'].length) buckets['birds-eye'].push(fallbackBirdsEye(entry));
  if (!buckets.synthesis.length) buckets.synthesis.push(fallbackSynthesis(entry));
  if (!buckets.insights.length) {
    buckets.insights.push(
      `<div data-signal="interpretation"><p>See the supporting paper for regenerable methods and honesty rails. This brief keeps Soft Story measurements and Fractal Holographic Goldilocks interpretation on separate rails.</p></div>`,
    );
  } else {
    buckets.insights = [
      `<div data-signal="experimental">\n${buckets.insights.join('\n')}\n</div>`,
      `<div data-signal="interpretation"><p><strong>Fractal Holographic Goldilocks interpretation:</strong> treat the experimental blocks above as organizational evidence under regenerable conditions. Keep Soft Story, hypothesis, and speculation on separate rails from settled fact.</p></div>`,
    ];
  }
  if (!buckets.implications.length) buckets.implications.push(fallbackImplications());
  if (!buckets.orientation.length) buckets.orientation.push(fallbackOrientation(entry));

  return [
    wrap('birds-eye', buckets['birds-eye'].join('\n')),
    wrap('synthesis', buckets.synthesis.join('\n')),
    wrap('insights', buckets.insights.join('\n')),
    wrap('implications', buckets.implications.join('\n')),
    wrap('orientation', buckets.orientation.join('\n')),
    honesty ? honesty.trim() : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

/**
 * @param {string} root
 * @returns {{ changed: number, skipped: string[], migrated: string[] }}
 */
export function migrateBriefsTree(root) {
  const manifest = JSON.parse(readFileSync(join(root, 'content/manifest.json'), 'utf8'));
  const bySlug = Object.fromEntries(manifest.blog.map((b) => [b.slug, b]));
  const dir = join(root, 'content/blog');
  const migrated = [];
  const skipped = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.html'))) {
    const slug = name.replace(/\.html$/, '');
    const file = join(dir, name);
    const next = migrateBriefFragment(slug, readFileSync(file, 'utf8'), bySlug[slug] || { slug });
    if (!next) {
      skipped.push(slug);
      continue;
    }
    writeFileSync(file, next);
    migrated.push(slug);
  }
  return { changed: migrated.length, skipped, migrated };
}
