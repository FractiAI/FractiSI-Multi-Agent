import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { scanConfig, scanManuscript, scanSection } from '../../src/manuscript/contract.mjs';

test('the authored manuscript carries no hard-coded study values', () => {
  assert.deepEqual(scanManuscript(PATHS.manuscriptSource), []);
});

test('negative control: typed numbers are caught, however they are written', () => {
  for (const text of ['A reduction of 84.5 percent.', 'It took 12 ms.', 'We ran 1,024 sessions.', 'The value 0.5 applies.']) {
    assert.ok(scanSection(text).some((f) => f.kind === 'number'), text);
  }
});

test('negative control: spelled-out study counts are caught', () => {
  assert.ok(scanSection('We ran five trials on six models.').some((f) => f.kind === 'spelled_count'));
  assert.ok(scanSection('Across twelve independent processes.').some((f) => f.kind === 'spelled_count'));
});

test('negative control: a study value inside mathematics is caught', () => {
  assert.ok(scanSection('$$ R = 0.845 $$ {#eq:x}').some((f) => f.kind === 'number_in_math'));
  assert.ok(scanSection('Here $x = 37$ holds.').some((f) => f.kind === 'number_in_math'));
});

test('tokens, code, citations, labels and links are not study values', () => {
  const clean = [
    'A reduction of {{AGG_PUBLISHED}}.',
    'Run `node scripts/run_pipeline.mjs --from 3`.',
    'As shown [@kwon2023efficient; @fig:heap_2].',
    '@kalibera2013rigorous showed this.',
    '# Heading {#sec:res_2}',
    '::: {.definition #def:x1}',
    'See https://example.com/2023/paper.',
    '```bash\nnpm test 123\n```',
    '![{{CAPTION}}](../../output/figures/fig_1.png){#fig:one width=92%}',
    '1. A numbered list item.',
  ];
  for (const text of clean) assert.deepEqual(scanSection(text), [], text);
});

test('negative control: a result cannot hide in code, a caption, a locator, a comment or an attribute', () => {
  for (const hidden of ['`83.4%`', '![Heap fell 83.4%](a.png){#fig:a width=92%}', '[@x, p. 83.4%]', '```\n83.4%\n```', '<!-- 83.4% -->', 'word{data-x=83.4%}', '`1.86×`']) {
    assert.ok(scanSection(hidden).length > 0, hidden);
  }
});

test('negative control: spelled-out percentages and multipliers are caught', () => {
  for (const spelled of ['fell eighty-three percent', 'nineteen per cent less', 'a twofold gain', 'a ten-fold saving']) {
    assert.ok(scanSection(spelled).length > 0, spelled);
  }
});

test('the title page cannot carry a typed value, and identifiers there are not prose', () => {
  assert.ok(scanConfig('paper:\n  title: "A 42.7 percent saving"\n').length > 0);
  assert.deepEqual(scanConfig('paper:\n  title: "A study"\nauthors:\n  - orcid: "0000-0001-6232-9096"\n'), []);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-contract-'));
  fs.writeFileSync(path.join(dir, '00_abstract.md'), 'Clean.\n');
  fs.writeFileSync(path.join(dir, 'config.yaml'), 'paper:\n  subtitle: "Saving 42.7 percent"\n');
  assert.equal(scanManuscript(dir).length, 1);
});

test('structural constants in mathematics and named things with digits are allowed', () => {
  assert.deepEqual(scanSection('$$ R(n) = f(1 - 1/n), k = 2LHds $$'), []);
  assert.deepEqual(scanSection('UTF-8 bytes on V8, hashed with SHA-256, from GPT-2 and an H100 profile.'), []);
});
