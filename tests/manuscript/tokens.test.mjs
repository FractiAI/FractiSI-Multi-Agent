import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadPlan } from '../../src/benchmarks/plan.mjs';
import { PATHS } from '../../src/core/paths.mjs';
import { buildCatalog, variablesFrom, writeCatalog } from '../../src/manuscript/tokens.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const { plan, sha256 } = loadPlan();
const context = {
  plan,
  planSha256: sha256,
  registry: read(`${PATHS.outputFigures}/figure_registry.json`),
  suite: read(`${PATHS.outputData}/suite/manifest.json`),
};
const summary = read(`${PATHS.outputData}/analysis_summary.json`);

test('every token has a value and a recorded source', () => {
  const entries = buildCatalog(summary, context);
  assert.ok(entries.length > 100);
  for (const entry of entries) {
    assert.match(entry.token, /^[A-Z][A-Z0-9_]*$/);
    assert.ok(entry.value.trim().length > 0, entry.token);
    assert.ok(entry.source.length > 0, entry.token);
    assert.equal(/\bNaN\b|\bundefined\b/.test(entry.value), false, entry.token);
  }
  assert.equal(new Set(entries.map((e) => e.token)).size, entries.length);
});

test('a token reads through to the summary: changing a source changes its value', () => {
  const changed = structuredClone(summary);
  changed.deterministic.sensitivity.published.ratio = 0.5;
  const value = (entries, token) => entries.find((e) => e.token === token).value;
  assert.equal(value(buildCatalog(changed, context), 'AGG_PUBLISHED'), '50.0%');
});

test('negative control: a missing source stops the build', () => {
  const changed = structuredClone(summary);
  delete changed.deterministic.sensitivity.lossless;
  assert.throws(() => buildCatalog(changed, context), /missing evidence/);
});

test('no completed real-model run stops the build rather than inventing one', () => {
  const changed = structuredClone(summary);
  changed.llm = [{ status: 'not_run', reason: 'x', run: 'y' }];
  assert.throws(() => buildCatalog(changed, context), /no completed real-model runs/);
});

test('figure captions come from the registry', () => {
  const entries = buildCatalog(summary, context);
  const caption = entries.find((e) => e.token === 'FIG_HEAP_VS_JSON_CAPTION').value;
  assert.equal(caption, context.registry['fig:heap_vs_json'].caption);
});

test('the catalog writes both the variables and their provenance', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-cat-'));
  const entries = buildCatalog(summary, context);
  writeCatalog(dir, entries);
  assert.deepEqual(read(path.join(dir, 'manuscript_variables.json')), variablesFrom(entries));
  assert.equal(read(path.join(dir, 'manuscript_catalog.json')).tokens.length, entries.length);
});
