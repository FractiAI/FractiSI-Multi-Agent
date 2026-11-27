import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  builtBriefLooksComplete,
  checkExecutiveBriefs,
  MIN_STORY_PROSE_WORDS,
  proseWordCount,
} from '../../src/gates/executive-briefs.mjs';

test('repository FGC briefs pass the executive-brief gate', () => {
  const gate = checkExecutiveBriefs();
  assert.deepEqual(gate.problems, [], gate.problems.join('\n'));
});

test('proseWordCount strips tags and MIN_STORY_PROSE_WORDS blocks stubs', () => {
  assert.equal(proseWordCount('<p>one two three</p>'), 3);
  assert.ok(MIN_STORY_PROSE_WORDS >= 350);
});

test('builtBriefLooksComplete requires hierarchy ids and short answer', () => {
  assert.equal(builtBriefLooksComplete('<h1>Q?</h1>').ok, false);
  const html = HIERARCHY_FIXTURE;
  assert.equal(builtBriefLooksComplete(html).ok, true);
});

test('negative control: missing data-brief or retired index chrome fails', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fgc-brief-'));
  fs.mkdirSync(path.join(root, 'content/blog'), { recursive: true });
  fs.mkdirSync(path.join(root, 'blog/demo'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'content/manifest.json'),
    JSON.stringify({ blog: [{ slug: 'demo', title: 'Is it true?', answerHead: 'Short answer: Yes.' }] }),
  );
  fs.writeFileSync(path.join(root, 'content/blog/demo.html'), '<p>no sections</p>');
  fs.writeFileSync(path.join(root, 'blog/demo/index.html'), '<h1>Is it true?</h1>');
  fs.mkdirSync(path.join(root, 'blog'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'blog/index.html'),
    '<header class="nr-hero"><h1>Living executive intelligence dashboard</h1><p class="dek">Like a weather channel that reads…</p></header><h2>How to use this channel</h2><h2>Brief reading rails</h2>',
  );
  const problems = checkExecutiveBriefs(root).problems;
  assert.ok(problems.some((p) => /data-brief="birds-eye"/.test(p)));
  assert.ok(problems.some((p) => /weather-channel/.test(p)));
  assert.ok(problems.some((p) => /README how-to|reading-rails/.test(p)));
  assert.ok(problems.some((p) => /newsroom head must state FGC purpose|Fractal Rhyming lens/.test(p)));
});

const HIERARCHY_FIXTURE = `
<article>
<header id="executive-brief"><h1>Q?</h1><p class="answer"><strong>Short answer: Yes.</strong></p></header>
<section id="birds-eye-synthesis"></section>
<section id="key-insights"></section>
<section id="implications"></section>
<section id="what-to-watch-do"></section>
<section id="related-rhymes"></section>
<section id="supporting-papers"></section>
</article>
`;
