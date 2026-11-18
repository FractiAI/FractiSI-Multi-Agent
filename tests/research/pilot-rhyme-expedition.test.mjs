import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullExpedition } from '../../research/pilot-rhyme-expedition/src/experiments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('Pilot Rhyme recovers all missions; flat recovers none; exact cache hits zero', () => {
  const r = runFullExpedition({ scenarios: 40 });
  assert.equal(r.compare.discovery.director_pilot_rhyme, 40);
  assert.equal(r.compare.discovery.flat, 0);
  assert.equal(r.compare.exactCacheHits, 0);
  assert.ok(r.compare.rhymeVersusExact > 0.15);
  assert.ok(r.compare.rhymeVersusPrivate > 0.5);
});

test('Pilot Rhyme surfaces exist', () => {
  assert.ok(existsSync(join(root, 'library/papers/pilot-rhyme-expedition/index.html')));
  assert.ok(existsSync(join(root, 'blog/pilot-rhyme-expedition/index.html')));
  assert.ok(existsSync(join(root, 'library/papers/shared-world-collective-intelligence/index.html')));
});
