import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRIEF_HIERARCHY,
  BRIEF_SECTIONS,
  CORE_ORIENTATION,
  SIGNAL_KINDS,
  builtBriefLooksComplete,
  decorateSignalBlocks,
  parseBriefSections,
  resolveBriefContent,
} from '../../src/newsroom/executive-brief.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('brief hierarchy labels are wire-service soft anchors', () => {
  assert.deepEqual(BRIEF_HIERARCHY, [
    'Lead',
    'Context',
    'Evidence',
    'Why it matters',
    'Next steps',
    'Related briefs',
    'Papers',
  ]);
  assert.equal(BRIEF_SECTIONS.length, 5);
  assert.equal(SIGNAL_KINDS.length, 5);
  assert.match(CORE_ORIENTATION, /Read the brief → follow the rhyme → open the paper/);
  assert.equal(/!/.test(CORE_ORIENTATION), false);
  assert.equal(BRIEF_HIERARCHY.some((l) => /EXECUTIVE BRIEF|KEY INSIGHTS/i.test(l)), false);
});

test('parseBriefSections reads data-brief markers', () => {
  const html = `
<section data-brief="birds-eye"><p>Eye</p></section>
<section data-brief="synthesis"><p>Syn</p></section>
<section data-brief="insights"><div data-signal="fact"><p>F</p></div></section>
<section data-brief="implications"><p>Imp</p></section>
<section data-brief="orientation"><p>Do</p></section>
`;
  const { sections, structured } = parseBriefSections(html);
  assert.equal(structured, true);
  assert.match(sections['birds-eye'], /Eye/);
  assert.match(sections.insights, /data-signal="fact"/);
});

test('decorateSignalBlocks labels taxonomy without inventing claims', () => {
  const out = decorateSignalBlocks('<div data-signal="experimental"><p>0/16 vs 10/16</p></div>');
  assert.match(out, /brief-signal-kind">Experimental evidence/);
  assert.match(out, /0\/16 vs 10\/16/);
  assert.equal(/!/.test(out), false);
});

test('resolveBriefContent fills gaps from manifest only', () => {
  const { sections, structured } = resolveBriefContent('<p>Only remnant.</p>', {
    title: 'Is X true?',
    answerBody: ' Measured board under seed.',
    dek: 'YES — measured board under seed.',
    label: 'Demo',
    actions: [{ href: '/library/papers/demo/', text: 'Paper' }],
  });
  assert.equal(structured, false);
  assert.match(sections['birds-eye'], /Measured board under seed/);
  assert.match(sections.synthesis, /Fractal Holographic Goldilocks/);
  assert.match(sections.insights, /Only remnant/);
  assert.match(sections.orientation, /library\/papers\/demo/);
});

test('every built FGC brief carries Yes/No lead without README hierarchy banners', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'content/manifest.json'), 'utf8'));
  assert.ok(manifest.blog.length >= 1);
  for (const entry of manifest.blog) {
    const built = join(ROOT, 'blog', entry.slug, 'index.html');
    assert.ok(existsSync(built), `missing ${entry.slug}`);
    const html = readFileSync(built, 'utf8');
    const check = builtBriefLooksComplete(html);
    assert.equal(check.ok, true, `${entry.slug} missing ${check.missing.join(',')}`);
    assert.match(html, /Fractal Goldilocks Channel/);
    assert.match(html, /class="answer"[\s\S]*?Short answer:\s*(YES|NO|Yes|No)\b/i);
    assert.match(html, /How claims are labeled/);
    assert.doesNotMatch(html, />EXECUTIVE BRIEF</);
    assert.doesNotMatch(html, />KEY INSIGHTS</);
    assert.doesNotMatch(html, /brief-section-kicker">Key insights/);
    assert.equal(/!/.test(html.match(/<p class="brief-path-line">[\s\S]*?<\/p>/)?.[0] || ''), false);
  }
});

test('FGC dashboard reads as wire-service intelligence surface', () => {
  const html = readFileSync(join(ROOT, 'blog/index.html'), 'utf8');
  assert.match(html, /Living executive intelligence dashboard/);
  assert.match(html, /How to use this channel/);
  assert.match(html, /Brief archive/);
  assert.match(html, /Active briefs/);
  assert.match(html, /Read the brief → follow the rhyme → open the paper/);
  assert.match(html, /Wire-style Yes\/No briefs/);
  // Player 1: never name the cable network brand in FGC surfaces.
  const cableBrand = String.fromCharCode(67, 78, 66, 67);
  assert.doesNotMatch(html, new RegExp(cableBrand, 'i'));
  assert.doesNotMatch(html, /weather channel/i);
  assert.equal(/!/.test(html.match(/<header class="nr-hero">[\s\S]*?<\/header>/)?.[0] || ''), false);
});

test('standalones packaging brief is on the FGC archive', () => {
  const index = readFileSync(join(ROOT, 'blog/index.html'), 'utf8');
  assert.match(index, /neural-xray-rhyme-standalones/);
  const built = readFileSync(join(ROOT, 'blog/neural-xray-rhyme-standalones/index.html'), 'utf8');
  assert.match(built, /Short answer:\s*Yes/i);
  assert.match(built, /11 of 11|11 Neural X-Ray/i);
  assert.match(built, /6ba1f61b/);
});
