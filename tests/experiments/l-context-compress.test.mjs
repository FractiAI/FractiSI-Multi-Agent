import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { experimentL_contextCompressHooks } from '../../src/experiments/l-context-compress.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('results match upstream byte for byte', () => {
  assert.equal(JSON.stringify(experimentL_contextCompressHooks()), JSON.stringify(golden.L));
});

test('folding saves bytes against its own baseline and keeps a bounded window', () => {
  const result = experimentL_contextCompressHooks();
  assert.equal(result.pass, true);
  assert.ok(result.foldRatio > 0);
  assert.ok(result.levels <= result.maxLevels);
});
