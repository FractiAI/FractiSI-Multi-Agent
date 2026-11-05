import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DOC_FILES, hydrateSections, listSectionFiles, substitute, writeHydratedManuscript } from '../../src/manuscript/hydrate.mjs';

function manuscript(sections = { '00_a.md': 'Value {{X}}.', '99_r.md': '# Refs' }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-man-'));
  for (const [name, text] of Object.entries(sections)) fs.writeFileSync(path.join(dir, name), text);
  fs.writeFileSync(path.join(dir, 'config.yaml'), 'version: "{{V}}"\n');
  fs.writeFileSync(path.join(dir, 'preamble.md'), 'preamble {{NOT_A_TARGET}}');
  fs.writeFileSync(path.join(dir, 'references.bib'), '');
  fs.writeFileSync(path.join(dir, 'README.md'), 'docs mention {{EXAMPLE}}');
  fs.writeFileSync(path.join(dir, 'SYNTAX.md'), 'docs mention {{EXAMPLE}}');
  return dir;
}

test('documentation files are not sections', () => {
  const dir = manuscript();
  assert.deepEqual(listSectionFiles(dir), ['00_a.md', '99_r.md']);
  assert.ok(DOC_FILES.includes('README.md'));
});

test('substitute resolves known tokens and reports unknown ones', () => {
  const { resolved, unknown } = substitute('{{A}} {{B}}', { A: '1' });
  assert.equal(resolved, '1 {{B}}');
  assert.deepEqual(unknown, ['B']);
});

test('sections and config hydrate fully', () => {
  const sections = hydrateSections({ sourceDir: manuscript(), variables: { X: '7', V: '1.0' } });
  assert.equal(sections['00_a.md'], 'Value 7.');
  assert.equal(sections['config.yaml'], 'version: "1.0"\n');
});

test('negative control: an unknown token stops hydration and names the file', () => {
  assert.throws(() => hydrateSections({ sourceDir: manuscript(), variables: { V: '1' } }), /unknown manuscript tokens.*00_a\.md.*X/);
});

test('negative control: a catalog token no section uses stops hydration', () => {
  assert.throws(() => hydrateSections({ sourceDir: manuscript(), variables: { X: '7', V: '1', EXTRA: '9' } }), /no section uses: EXTRA/);
});

test('writing replaces stale sections, keeps folder guides and records hashes', () => {
  const sourceDir = manuscript();
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-out-'));
  fs.writeFileSync(path.join(outDir, '50_stale.md'), 'old');
  fs.writeFileSync(path.join(outDir, 'README.md'), 'guide');
  const manifest = writeHydratedManuscript({ sourceDir, outDir, variables: { X: '7', V: '1' }, bindings: { plan: 'abc' } });
  assert.equal(fs.existsSync(path.join(outDir, '50_stale.md')), false);
  assert.equal(fs.readFileSync(path.join(outDir, 'README.md'), 'utf8'), 'guide');
  assert.equal(fs.readFileSync(path.join(outDir, '00_a.md'), 'utf8'), 'Value 7.');
  assert.match(manifest.hydrated['00_a.md'], /^[0-9a-f]{64}$/);
  assert.notEqual(manifest.hydrated['00_a.md'], manifest.authored['00_a.md']);
  assert.equal(manifest.bindings.plan, 'abc');
  assert.ok(fs.existsSync(path.join(outDir, 'hydration_manifest.json')));
});
