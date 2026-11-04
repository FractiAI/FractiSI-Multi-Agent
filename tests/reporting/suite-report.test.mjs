import assert from 'node:assert/strict';
import test from 'node:test';
import { runAllExperiments } from '../../src/experiments/suite.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';
import { renderSuiteReport } from '../../src/reporting/suite-report.mjs';

const results = runAllExperiments({ labs: { gpuLive: notRunReport('x'), gpuLlm: notRunReport('y') } });

test('the report states the verdict and that a lab did not run', () => {
  const text = renderSuiteReport({ generatedAt: 'T', results });
  assert.match(text, /`incomplete`/);
  assert.match(text, /7 pass · 0 fail · 3 not run/);
  assert.match(text, /\| GPU allocation reduction \| not_run \|/);
  assert.match(text, /84\.5%/);
  assert.match(text, /Generated:\*\* T/);
});

test('the host appears when given', () => {
  const text = renderSuiteReport({ generatedAt: 'T', host: { cpuModel: 'C', platform: 'p', arch: 'a', node: 'v1' }, results });
  assert.match(text, /Host:\*\* C · p a · Node v1/);
});
