import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { sha256 } from '../../src/core/canonical-json.mjs';
import { PDF_NAME, renderManuscript, writeRenderReceipt } from '../../src/pipeline/render.mjs';

function output() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-rcpt-'));
  for (const sub of ['pdf', 'manuscript', 'data']) fs.mkdirSync(path.join(dir, sub));
  fs.writeFileSync(path.join(dir, 'pdf', PDF_NAME), 'pdf bytes');
  fs.writeFileSync(path.join(dir, 'manuscript', 'hydration_manifest.json'), '{}');
  return dir;
}

test('the receipt binds the PDF to the hydrated manuscript and the template commit', () => {
  const dir = output();
  const receipt = writeRenderReceipt({ commit: 'abc', outputDir: dir });
  assert.equal(receipt.pdfSha256, sha256('pdf bytes'));
  assert.equal(receipt.hydrationManifestSha256, sha256('{}'));
  assert.equal(receipt.templateCommit, 'abc');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'data', 'render_receipt.json'), 'utf8')).pdfBytes, 9);
});

test('a render that produced no PDF is an error', () => {
  const dir = output();
  fs.rmSync(path.join(dir, 'pdf', PDF_NAME));
  assert.throws(() => writeRenderReceipt({ commit: 'abc', outputDir: dir }), /no PDF/);
});

test('with no template configured the render refuses before doing anything', () => {
  assert.throws(() => renderManuscript({ env: {} }), /TINY_TEMPLATE_ROOT/);
});
