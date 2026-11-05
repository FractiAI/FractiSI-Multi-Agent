import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { sourceFingerprint } from '../../src/benchmarks/fingerprint.mjs';

function tree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-print-'));
  fs.mkdirSync(path.join(root, 'src/a'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/a/x.mjs'), 'export const x = 1;\n');
  fs.writeFileSync(path.join(root, 'plan.json'), '{}');
  return root;
}

test('the fingerprint is stable and counts files', () => {
  const root = tree();
  const a = sourceFingerprint(['src', 'plan.json'], root);
  assert.equal(a.fileCount, 2);
  assert.deepEqual(a, sourceFingerprint(['src', 'plan.json'], root));
});

test('any change to a producer changes the fingerprint', () => {
  const root = tree();
  const before = sourceFingerprint(['src'], root).sha256;
  fs.writeFileSync(path.join(root, 'src/a/x.mjs'), 'export const x = 2;\n');
  assert.notEqual(sourceFingerprint(['src'], root).sha256, before);
});

test('adding a module changes it, and a non-source file does not', () => {
  const root = tree();
  const before = sourceFingerprint(['src'], root).sha256;
  fs.writeFileSync(path.join(root, 'src/a/notes.txt'), 'ignored');
  assert.equal(sourceFingerprint(['src'], root).sha256, before);
  fs.writeFileSync(path.join(root, 'src/a/y.mjs'), 'export const y = 1;\n');
  assert.notEqual(sourceFingerprint(['src'], root).sha256, before);
});
