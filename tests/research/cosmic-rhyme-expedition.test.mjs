import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  runC1PartnerRecovery,
  runC3WmapSpectrum,
} from '../../research/cosmic-rhyme-expedition/src/experiments.mjs';
import { loadExoplanets } from '../../research/cosmic-rhyme-expedition/src/load.mjs';
import { DOCUMENT_ID, SEED } from '../../research/cosmic-rhyme-expedition/src/constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('cosmic fixtures load real public rows', () => {
  const exo = loadExoplanets(40);
  assert.ok(exo.length >= 30);
  assert.equal(exo[0].layer, 'exoplanet');
  assert.ok(exo[0].features.log_orbper != null);
});

test('C1 AWARE beats LINEAR on exoplanet long-range tasks', () => {
  const exo = loadExoplanets(120);
  const r = runC1PartnerRecovery(exo, { seed: SEED });
  assert.ok(r.nTasks >= 20, 'enough long-range tasks');
  assert.ok(r.rates.aware > r.rates.linear + 0.25);
  assert.equal(r.H1, true);
});

test('C3 WMAP spectral AWARE beats LINEAR', () => {
  const r = runC3WmapSpectrum({ seed: SEED + 99 });
  assert.ok(r.rates.n >= 40);
  assert.ok(r.rates.aware > r.rates.linear + 0.25);
  assert.equal(r.H1, true);
});

test('ship surfaces and receipt exist after positive run', () => {
  const report = JSON.parse(
    readFileSync(join(root, 'research/cosmic-rhyme-expedition/data/empirical_report.json'), 'utf8'),
  );
  assert.equal(report.documentId, DOCUMENT_ID);
  assert.equal(report.summary.positiveExpeditionSignal, true);
  assert.ok(report.summary.nH1 >= 2);
  const blog = readFileSync(join(root, 'blog/cosmic-rhyme-expedition/index.html'), 'utf8');
  const paper = readFileSync(join(root, 'library/papers/cosmic-rhyme-expedition/index.html'), 'utf8');
  assert.match(blog, /Cosmos, not Universe/);
  assert.match(paper, /WP-COSMIC-RHYME-EXPEDITION-EGS-2026-11-17/);
  assert.match(paper, /Honesty boundary/);
});
