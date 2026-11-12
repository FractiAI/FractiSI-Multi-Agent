/**
 * Regression lock for the 2026-11-09 Test Drive voice.
 * Fails if agents restore older heroes, titles, or slop phrasing.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  TEST_DRIVE_VOICE_LOCK as LOCK,
  voiceLockHeroHtml,
  voiceLockStepTitleNeedles,
} from '../../src/testdrive/voice-lock.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(root, 'test-drive/index.html'), 'utf8');
const deck = readFileSync(join(root, 'talks/aai-symposium-2026/index.html'), 'utf8');
const blog = readFileSync(join(root, 'blog/aai-symposium-2026/index.html'), 'utf8');
const guide = readFileSync(join(root, 'TEST_DRIVE.md'), 'utf8');
const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');

test('voice lock contract is frozen and complete', () => {
  assert.equal(LOCK.id, 'testdrive-voice-lock-2026-11-12-git-portable');
  assert.equal(LOCK.heroH1, 'The Multi-Agent World Inference Rhyme?');
  assert.equal(LOCK.stepTitles.length, 12);
  assert.ok(LOCK.forbiddenPhrases.length >= 10);
  assert.ok(LOCK.requiredPhrases.length >= 8);
});

test('Test Drive page locks the hero h1 and CTA', () => {
  assert.ok(page.includes(voiceLockHeroHtml()), 'hero h1 must match lock');
  assert.ok(page.includes(LOCK.ctaLabel), 'CTA must match lock');
  assert.ok(page.includes(LOCK.researchQuestion));
  assert.ok(page.includes(LOCK.storageKeyDone));
  assert.ok(page.includes(LOCK.storageKeyResults));
  assert.doesNotMatch(page, /fractisi-td-(?:walkthrough-done|results)-v1[0-3]/);
});

test('Test Drive opens on awareness story before the demonstration beat', () => {
  const iStory = page.indexOf("id: 'story'");
  const iWelcome = page.indexOf("id: 'welcome'");
  assert.ok(iStory > 0 && iWelcome > iStory, 'story must precede welcome');
  assert.match(page, /Awareness framed their sensory observations/);
  assert.match(page, /Fractal Holographic Goldilocks Superintelligence World Awareness/);
  assert.match(page, /Why this is a Test Drive\./);
  assert.match(page, /human agents and digital agents collaborating/i);
  assert.match(page, /human operators and digital agents/i);
});

test('Test Drive STEPS titles match the locked arc', () => {
  for (const step of LOCK.stepTitles) {
    assert.ok(
      page.includes(`id: '${step.id}'`),
      `missing step id ${step.id}`,
    );
    assert.ok(
      page.includes(`title: '${step.title}'`),
      `step ${step.id} title must be exactly "${step.title}"`,
    );
  }
});

test('Test Drive page keeps required facts and bans retired copy', () => {
  for (const needle of LOCK.requiredPhrases) {
    assert.ok(page.toLowerCase().includes(needle.toLowerCase()), needle);
  }
  for (const bad of LOCK.forbiddenPhrases) {
    assert.doesNotMatch(
      page,
      new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      `forbidden phrase restored: ${bad}`,
    );
  }
});


test('story beat uses Mens Club Reno watercolor, not El Cortez', () => {
  assert.match(page, /mens-club-reno-watercolor\.jpg/);
  const story = page.slice(page.indexOf("id: 'story'"), page.indexOf("id: 'sandbox'"));
  assert.doesNotMatch(story, /el-cortez\.jpg/);
  assert.match(story, /Men'?s Club Reno/i);
});

test('speaker deck locks the same hero and post-welcome step titles', () => {
  assert.ok(deck.includes(voiceLockHeroHtml()), 'deck hero');
  // Deck slide 1 uses the locked hero as its h1; welcome's step title lives on /test-drive/.
  for (const step of LOCK.stepTitles.filter((s) => s.id !== 'welcome')) {
    assert.ok(deck.includes(step.title), `deck missing title: ${step.title}`);
  }
  for (const bad of [
    'One shared world. Four live tests.',
    'Session title:',
    'Here is the question',
    'The question under test',
    'The demonstration is complete',
  ]) {
    assert.doesNotMatch(
      deck,
      new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      `deck restored: ${bad}`,
    );
  }
});

test('symposium blog and TEST_DRIVE.md point at the locked hero', () => {
  assert.ok(blog.includes(LOCK.heroH1));
  assert.ok(guide.includes(LOCK.heroH1));
  assert.ok(guide.includes('VOICE LOCK'));
  assert.doesNotMatch(guide, /Session title:/);
  // Retired hero may appear only inside an explicit "do not restore" / forbidden list.
  assert.doesNotMatch(blog, /<h1>One shared world\. Four live tests\.<\/h1>/);
  assert.doesNotMatch(guide, /\*\*Hero:\*\* \*One shared world\. Four live tests\.\*/);
});

test('AGENTS.md points agents at the voice lock before edits', () => {
  assert.match(agents, /TEST_DRIVE_VOICE_LOCK|testdrive-voice-lock|voice-lock\.mjs/i);
  assert.ok(agents.includes(LOCK.heroH1));
  assert.match(agents, /VOICE LOCK/i);
  assert.doesNotMatch(agents, /Self-paced Test Drive.*11 beats/s);
});
