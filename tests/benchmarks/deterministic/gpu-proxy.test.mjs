import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { allocationReduction, gpuProxySensitivity } from '../../../src/benchmarks/deterministic/gpu-proxy.mjs';
import { PATHS } from '../../../src/core/paths.mjs';

const inputs = { sessions: 16, kvMibPerSession: 4, systemPromptMib: 12, weightStubMib: 32 };

test('the published device figure reproduces to every digit with no device', () => {
  const receipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/gpu_live_chat_hbm_lab.json`, 'utf8'));
  const derived = allocationReduction({ ...inputs, deltaFraction: 0.15 });
  assert.equal(derived.conventionalMib, receipt.cuMemAlloc.conventionalMib);
  assert.equal(derived.tinyMib, receipt.cuMemAlloc.tinyMib);
  assert.equal(derived.reductionRatio, receipt.cuMemAlloc.reductionRatio);
});

test('the result moves with the assumed delta', () => {
  const sweep = gpuProxySensitivity({ ...inputs, assumedDeltaFraction: 0.15, deltaFractions: [0.05, 0.15, 1] }).sweep;
  assert.ok(sweep[0].reductionRatio > sweep[1].reductionRatio);
  assert.ok(sweep[1].reductionRatio > sweep[2].reductionRatio);
});
