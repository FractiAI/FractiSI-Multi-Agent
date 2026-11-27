/**
 * FGC executive intelligence brief structure gate.
 * Built blog pages must carry the hierarchy + Yes/No lead.
 * Self-contained (same layer as newsroom — no cross-import).
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const BRIEF_IDS = ['birds-eye', 'synthesis', 'insights', 'implications', 'orientation'];
const HIERARCHY_IDS = [
  'executive-brief',
  'birds-eye-synthesis',
  'key-insights',
  'implications',
  'what-to-watch-do',
  'related-rhymes',
  'supporting-papers',
];

/** Engineering dump / parallel-brief patterns banned from FGC news story bodies. */
const FORBIDDEN_BODY = [
  { re: /ENGINE_SHELF/i, label: 'ENGINE_SHELF' },
  { re: /\bCNBC\b/i, label: 'CNBC' },
  { re: /\bnpm\s+run\b/i, label: 'npm run' },
  { re: /scripts\/[a-z0-9._/-]+\.mjs/i, label: 'scripts path' },
  { re: /src\/[a-z0-9._/-]+\.mjs/i, label: 'src path' },
  { re: /\bSoft Story\b/i, label: 'Soft Story jargon' },
  { re: /\bPR\s*#\s*\d+/i, label: 'PR number as story' },
  { re: /brief-orientation-list/, label: 'orientation checklist' },
  { re: /\bmerge\s+<code>[0-9a-f]{7,}\b/i, label: 'merge SHA in story' },
  { re: /commit\s+<code>[0-9a-f]{7,}/i, label: 'commit SHA in story' },
  { re: /\bPlayer 1\b/i, label: 'Player 1 in public story' },
  { re: /\bREADME\.md\b/i, label: 'README.md in story body' },
];

/** @param {string} html */
export function builtBriefLooksComplete(html) {
  const missing = [];
  for (const id of HIERARCHY_IDS) {
    if (!html.includes(`id="${id}"`)) missing.push(id);
  }
  if (!/class="answer"[\s\S]*?Short answer:\s*(YES|NO|Yes|No)\b/i.test(html)) {
    missing.push('short-answer');
  }
  return { ok: missing.length === 0, missing };
}

/** @param {string} [root] */
export function checkExecutiveBriefs(root = REPO_ROOT) {
  const problems = [];
  const manifestPath = path.join(root, 'content/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { name: 'FGC executive briefs carry hierarchy + Yes/No lead', problems: ['missing content/manifest.json'] };
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const entry of manifest.blog || []) {
    const src = path.join(root, 'content/blog', `${entry.slug}.html`);
    if (!fs.existsSync(src)) {
      problems.push(`content/blog/${entry.slug}.html: missing fragment`);
      continue;
    }
    const fragment = fs.readFileSync(src, 'utf8');
    for (const id of BRIEF_IDS) {
      if (!new RegExp(`data-brief=["']${id}["']`).test(fragment)) {
        problems.push(`content/blog/${entry.slug}.html: missing data-brief="${id}"`);
      }
    }
    for (const { re, label } of FORBIDDEN_BODY) {
      if (re.test(fragment)) {
        problems.push(`content/blog/${entry.slug}.html: forbidden ${label} in executive news body`);
      }
    }
    const built = path.join(root, 'blog', entry.slug, 'index.html');
    if (!fs.existsSync(built)) {
      problems.push(`blog/${entry.slug}/index.html: missing built brief`);
      continue;
    }
    const html = fs.readFileSync(built, 'utf8');
    const check = builtBriefLooksComplete(html);
    if (!check.ok) {
      problems.push(`blog/${entry.slug}/index.html: missing ${check.missing.join(', ')}`);
    }
  }

  const index = path.join(root, 'blog/index.html');
  if (!fs.existsSync(index)) {
    problems.push('blog/index.html: missing FGC newsroom');
  } else {
    const html = fs.readFileSync(index, 'utf8');
    if (!/Fractal Goldilocks Channel/.test(html) || !/Executive news for leaders/.test(html)) {
      problems.push('blog/index.html: newsroom head must state FGC purpose for leaders');
    }
    if (/How to use this channel|Brief reading rails|Living executive intelligence dashboard/i.test(html)) {
      problems.push('blog/index.html: README how-to / reading-rails chrome retired');
    }
    if (/Active briefs|Brief archive/i.test(html)) {
      problems.push('blog/index.html: parallel brief product chrome retired — use On the wire / Story archive');
    }
    if (/weather channel/i.test(html)) {
      problems.push('blog/index.html: weather-channel framing retired for executive briefs');
    }
  }

  return { name: 'FGC executive briefs carry hierarchy + Yes/No lead', problems };
}
