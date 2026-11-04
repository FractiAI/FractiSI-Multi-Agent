import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { experimentI_gpuLiveChatStack } from '../../src/experiments/i-gpu-live-chat.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const receipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_live_chat_hbm_lab.json`, 'utf8'));

test('a real passing receipt passes when it comes from this run', () => {
  const result = experimentI_gpuLiveChatStack({ ...receipt, status: 'pass' });
  assert.equal(result.pass, true);
  assert.equal(result.status, 'pass');
  assert.match(result.interpretation, /GTX 860M/);
});

test('a lab that did not run is neither a pass nor a failure', () => {
  const result = experimentI_gpuLiveChatStack(notRunReport('nvcuda_unavailable'));
  assert.equal(result.pass, false);
  assert.equal(result.status, 'not_run');
  assert.match(result.interpretation, /nvcuda_unavailable/);
});

test('a lab that ran below the bar fails', () => {
  const weak = { ...receipt, cuMemAlloc: { reductionRatio: 0.1 }, nvidiaSmi: { reductionRatio: 0.1 } };
  assert.equal(experimentI_gpuLiveChatStack(weak).status, 'fail');
});
