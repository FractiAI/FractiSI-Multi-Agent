import assert from 'node:assert/strict';
import test from 'node:test';
import { findLlmPython, runGpuLlmRealLab } from '../../src/labs/gpu-llm-real-lab.mjs';

test('the heavy lab runs only on request', () => {
  const saved = process.env.TINY_FOOTPRINT_FORCE_LLM_LAB;
  delete process.env.TINY_FOOTPRINT_FORCE_LLM_LAB;
  try {
    const report = runGpuLlmRealLab();
    assert.equal(report.status, 'not_run');
    assert.equal(report.reason, 'not_requested');
  } finally {
    if (saved !== undefined) process.env.TINY_FOOTPRINT_FORCE_LLM_LAB = saved;
  }
});

test('regression: requested with no environment is not_run, not a stored receipt', () => {
  const report = runGpuLlmRealLab({ force: true, python: '/nonexistent/python' });
  assert.equal(report.status, 'not_run');
  assert.equal(report.device, undefined);
  assert.equal(report.inference, undefined);
});

test('an explicit interpreter wins, and nothing found is null', () => {
  assert.equal(findLlmPython({ explicit: '/x/python' }), '/x/python');
  assert.equal(findLlmPython({ exists: () => false }), null);
  assert.match(findLlmPython({ exists: (candidate) => candidate.endsWith('python') }), /\.venv/);
});
