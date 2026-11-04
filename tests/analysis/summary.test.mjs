import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildAnalysisSummary, evidencePaths } from '../../src/analysis/summary.mjs';
import { loadPlan } from '../../src/benchmarks/plan.mjs';
import { PATHS } from '../../src/core/paths.mjs';

const { plan } = loadPlan();

test('the committed evidence reduces to a complete summary with hashes', () => {
  const summary = buildAnalysisSummary(plan);
  for (const key of ['deterministic', 'compression', 'h100', 'heap', 'latency', 'rss', 'gpuLive', 'llm', 'historical', 'claims', 'seeds', 'bootstrap']) {
    assert.ok(summary[key] !== undefined, key);
  }
  assert.match(summary.evidence.heap.sha256, /^[0-9a-f]{64}$/);
  assert.equal(path.isAbsolute(summary.evidence.heap.file), false);
});

test('reduction is deterministic: the same receipts give the same summary', () => {
  assert.equal(JSON.stringify(buildAnalysisSummary(plan)), JSON.stringify(buildAnalysisSummary(plan)));
});

test('missing evidence stops the analysis and names the file', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-sum-'));
  assert.throws(() => buildAnalysisSummary(plan, { dataDir }), /missing evidence/);
});

test('a host without the real-model stack gets a summary that says so, not a crash', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-sum-'));
  fs.cpSync(PATHS.outputData, dataDir, { recursive: true });
  fs.rmSync(evidencePaths(dataDir).llmDir, { recursive: true, force: true });
  const summary = buildAnalysisSummary(plan, { dataDir });
  assert.equal(summary.llm.length, plan.llm.runs.length);
  assert.ok(summary.llm.every((run) => run.status === 'not_run' && run.reason === 'no_receipt'));
  const prefill = summary.claims.find((c) => c.id === 'prefill');
  assert.equal(prefill.status, 'not testable on this host');
  assert.match(prefill.evidence, /did not run on this host/);
});

test('a leftover receipt from another plan is not evidence', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-sum-'));
  fs.cpSync(PATHS.outputData, dataDir, { recursive: true });
  const { llmDir } = evidencePaths(dataDir);
  const [first] = fs.readdirSync(llmDir).filter((name) => name.endsWith('.json'));
  fs.copyFileSync(path.join(llmDir, first), path.join(llmDir, 'old-model-cpu.json'));
  assert.equal(buildAnalysisSummary(plan, { dataDir }).llm.some((run) => run.run === 'old-model-cpu'), false);
});
