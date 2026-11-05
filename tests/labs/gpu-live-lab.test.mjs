import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { sha256File } from '../../src/core/canonical-json.mjs';
import { PATHS } from '../../src/core/paths.mjs';
import { GPU_LIVE_DEFAULTS, runGpuLiveChatLab } from '../../src/labs/gpu-live-lab.mjs';

test('regression: with no interpreter the lab is not_run, whatever receipts are on disk', () => {
  const stored = `${PATHS.historicalReceipts}/gpu_live_chat_hbm_lab.json`;
  assert.ok(fs.existsSync(stored), 'a stored receipt exists, and must not be read');
  const before = sha256File(stored);
  const report = runGpuLiveChatLab({ python: '/nonexistent/python' });
  assert.equal(report.status, 'not_run');
  assert.equal(report.device, undefined);
  assert.equal(report.cuMemAlloc, undefined);
  assert.equal(sha256File(stored), before);
});

test('the published configuration is the default', () => {
  assert.deepEqual({ ...GPU_LIVE_DEFAULTS }, { sessions: 16, kvMib: 4, sysMib: 12, weightMib: 32, latencyTrials: 24 });
});
