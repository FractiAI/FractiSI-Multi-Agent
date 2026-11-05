import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { hydrateProject, readHydrationInputs } from '../../src/manuscript/pipeline.mjs';

function copyTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-hyd-'));
  const sourceDir = path.join(root, 'manuscript');
  fs.cpSync(PATHS.manuscriptSource, sourceDir, { recursive: true });
  const dataDir = path.join(root, 'data');
  fs.cpSync(PATHS.outputData, dataDir, { recursive: true });
  return { root, sourceDir, dataDir, outDir: path.join(root, 'out') };
}

test('the project hydrates end to end with no surviving token', () => {
  const { sourceDir, dataDir, outDir } = copyTree();
  const result = hydrateProject({ sourceDir, dataDir, outDir });
  assert.ok(result.tokens > 100);
  for (const name of fs.readdirSync(outDir).filter((n) => n.endsWith('.md') && n !== 'preamble.md')) {
    assert.doesNotMatch(fs.readFileSync(path.join(outDir, name), 'utf8'), /\{\{[A-Z]/, name);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(outDir, 'config.yaml'), 'utf8'), /\{\{[A-Z]/);
});

test('negative control: a typed study value stops hydration before anything is written', () => {
  const { sourceDir, dataDir, outDir } = copyTree();
  fs.appendFileSync(path.join(sourceDir, '04_results.md'), '\n\nThe heap fell 42.7 percent.\n');
  assert.throws(() => hydrateProject({ sourceDir, dataDir, outDir }), /hard-coded study values[\s\S]*42\.7/);
  assert.equal(fs.existsSync(outDir), false);
});

test('inputs are read from the given directories', () => {
  const inputs = readHydrationInputs();
  assert.ok(inputs.summary.deterministic);
  assert.ok(inputs.registry['fig:heap_vs_json']);
  assert.ok(inputs.suite.verdict);
  assert.throws(() => readHydrationInputs({ dataDir: '/nonexistent' }), /ENOENT/);
});
