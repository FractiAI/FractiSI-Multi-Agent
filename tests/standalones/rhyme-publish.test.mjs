import assert from 'node:assert/strict';
import test from 'node:test';
import { RHYME_STANDALONES, packageStandalone } from '../../src/standalones/rhyme-publish.mjs';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../../src/core/paths.mjs';

test('catalog names eleven Neural X-Ray and rhyme standalones', () => {
  assert.equal(RHYME_STANDALONES.length, 12);
  assert.ok(RHYME_STANDALONES.every((s) => s.repo.startsWith('FractiAI/synthobs-')));
  assert.ok(RHYME_STANDALONES.some((s) => s.slug === 'neural-xray-rhyme'));
});

test('packages principal-rhyme-theorem with vendored engine and runnable script', () => {
  const spec = RHYME_STANDALONES.find((s) => s.slug === 'principal-rhyme-theorem');
  const dest = packageStandalone(spec);
  assert.ok(existsSync(join(dest, 'package.json')));
  assert.ok(existsSync(join(dest, 'src/vendor/principal-rhyme-theorem.mjs')));
  assert.ok(existsSync(join(dest, 'scripts/run_empirical_pipeline.mjs')));
  rmSync(join(REPO_ROOT, 'output/standalones/synthobs-principal-rhyme-theorem'), { recursive: true, force: true });
});
