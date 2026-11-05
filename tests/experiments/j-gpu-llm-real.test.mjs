import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { experimentJ_gpuLlmReal } from '../../src/experiments/j-gpu-llm-real.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const receipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_llm_real_lab.json`, 'utf8'));

test('a real passing receipt reports its speedups', () => {
  const result = experimentJ_gpuLlmReal(receipt);
  assert.equal(result.status, 'pass');
  assert.ok(result.prefillP50Speedup > 1);
});

test('not requested is not run, and a failure is a failure', () => {
  assert.equal(experimentJ_gpuLlmReal(notRunReport('not_requested')).status, 'not_run');
  assert.equal(experimentJ_gpuLlmReal({ ok: false, status: 'fail', error: 'boom' }).status, 'fail');
});

test('a healthy CPU-only run has no result for an accelerator experiment, which is not a failure', () => {
  const result = experimentJ_gpuLlmReal({ ...receipt, labKind: 'real_llm_local_cpu' });
  assert.equal(result.pass, false);
  assert.equal(result.status, 'not_run');
  assert.match(result.interpretation, /CPU only/);
});

test('negative control: a failed CPU-only run is still a failure', () => {
  assert.equal(experimentJ_gpuLlmReal({ ok: false, status: 'fail', labKind: 'real_llm_local_cpu', error: 'boom' }).status, 'fail');
});
