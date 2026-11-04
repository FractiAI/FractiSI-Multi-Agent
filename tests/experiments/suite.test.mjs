import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { VERDICT, runAllExperiments, runDeterministicExperiments } from '../../src/experiments/suite.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const noLabs = { gpuLive: notRunReport('nvcuda_unavailable'), gpuLlm: notRunReport('not_requested'), h100: notRunReport('python_unavailable') };
const liveReceipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_live_chat_hbm_lab.json`, 'utf8'));
const llmReceipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_llm_real_lab.json`, 'utf8'));
const h100Receipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/h100_prefix_cache_sim.json`, 'utf8'));

test('a host with no labs is incomplete, never all-pass', () => {
  const results = runAllExperiments({ labs: noLabs });
  assert.equal(results.verdict, VERDICT.INCOMPLETE);
  assert.equal(results.all_pass, false);
  assert.equal(results.n_pass, 11);
  assert.equal(results.n_fail, 0);
  assert.equal(results.n_not_run, 4);
  assert.equal(results.enginePinRecommended, false);
});

test('labs that passed in this run can complete the suite', () => {
  const results = runAllExperiments({ labs: { gpuLive: { ...liveReceipt, status: 'pass' }, gpuLlm: { ...llmReceipt, status: 'pass' }, h100: { ...h100Receipt, status: 'pass' } } });
  assert.equal(results.verdict, VERDICT.ALL_PASS);
  assert.equal(results.all_pass, true);
  assert.equal(results.n_total, 15);
  assert.equal(results.enginePinRecommended, true);
});

test('a lab failure makes the verdict a failure', () => {
  const results = runAllExperiments({ labs: { gpuLive: { ok: false, status: 'fail', error: 'x' }, gpuLlm: noLabs.gpuLlm, h100: noLabs.h100 } });
  assert.equal(results.verdict, VERDICT.FAIL);
  assert.ok(results.n_fail >= 1);
});

test('the deterministic set needs nothing outside this process', () => {
  assert.deepEqual(Object.keys(runDeterministicExperiments()), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'R', 'K', 'L', 'M']);
});

test('the pin waits for a simulation that did not run, and refuses one that failed', () => {
  const passing = { gpuLive: { ...liveReceipt, status: 'pass' }, gpuLlm: { ...llmReceipt, status: 'pass' } };
  const notRun = runAllExperiments({ labs: { ...passing, h100: notRunReport('python_unavailable') } });
  assert.equal(notRun.enginePinRecommended, false);
  assert.equal(notRun.H.status, 'not_run');
  const failed = runAllExperiments({ labs: { ...passing, h100: { ok: false, status: 'fail', error: 'x' } } });
  assert.equal(failed.enginePinRecommended, false);
  assert.equal(failed.H.status, 'fail');
});
