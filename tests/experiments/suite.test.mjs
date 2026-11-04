import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { VERDICT, runAllExperiments, runDeterministicExperiments } from '../../src/experiments/suite.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const noLabs = { gpuLive: notRunReport('nvcuda_unavailable'), gpuLlm: notRunReport('not_requested') };
const liveReceipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_live_chat_hbm_lab.json`, 'utf8'));
const llmReceipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_llm_real_lab.json`, 'utf8'));

test('a host with no labs is incomplete, never all-pass', () => {
  const results = runAllExperiments({ labs: noLabs });
  assert.equal(results.verdict, VERDICT.INCOMPLETE);
  assert.equal(results.all_pass, false);
  assert.equal(results.n_pass, 7);
  assert.equal(results.n_fail, 0);
  assert.equal(results.n_not_run, 3);
  assert.equal(results.enginePinRecommended, false);
});

test('labs that passed in this run can complete the suite', () => {
  const results = runAllExperiments({ labs: { gpuLive: { ...liveReceipt, status: 'pass' }, gpuLlm: { ...llmReceipt, status: 'pass' } } });
  assert.equal(results.verdict, VERDICT.ALL_PASS);
  assert.equal(results.all_pass, true);
  assert.equal(results.n_total, 10);
  assert.equal(results.enginePinRecommended, true);
});

test('a lab failure makes the verdict a failure', () => {
  const results = runAllExperiments({ labs: { gpuLive: { ok: false, status: 'fail', error: 'x' }, gpuLlm: noLabs.gpuLlm } });
  assert.equal(results.verdict, VERDICT.FAIL);
  assert.ok(results.n_fail >= 1);
});

test('the deterministic set needs nothing outside this process', () => {
  assert.deepEqual(Object.keys(runDeterministicExperiments()), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
});
