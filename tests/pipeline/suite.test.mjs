import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { sha256File } from '../../src/core/canonical-json.mjs';
import { runSuitePipeline } from '../../src/pipeline/suite.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const labs = { gpuLive: notRunReport('nvcuda_unavailable'), gpuLlm: notRunReport('not_requested') };

test('the pipeline writes its reports and leaves the historical receipts alone', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-suite-'));
  const historical = path.join(PATHS.historicalReceipts, 'empirical_report.json');
  const before = sha256File(historical);
  const lines = [];
  const code = runSuitePipeline({ outDir, labs, log: (line) => lines.push(line) });
  assert.equal(code, 0);
  assert.equal(sha256File(historical), before);
  assert.deepEqual(fs.readdirSync(outDir).sort(), ['empirical_report.json', 'empirical_report.md', 'manifest.json']);
  const manifest = JSON.parse(fs.readFileSync(path.join(outDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.verdict, 'incomplete');
  assert.equal(manifest.enginePinRecommended, false);
  assert.ok(lines.some((line) => line.includes('did not run on this host')));
});

test('a failed lab makes the pipeline exit non-zero', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-suite-'));
  const code = runSuitePipeline({ outDir, labs: { ...labs, gpuLive: { ok: false, status: 'fail', error: 'x' } }, log: () => {} });
  assert.equal(code, 1);
});
