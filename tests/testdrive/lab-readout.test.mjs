import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { runTestDriveStep } from '../../src/testdrive/run-step.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('labs 1/3/4 return plain-language readout summaries', () => {
  for (const id of ['1', '3', '4']) {
    const { step } = runTestDriveStep(id);
    assert.ok(step.readout, id);
    assert.ok(step.readout.summary && step.readout.summary.length > 40, id + ' summary');
    assert.ok(step.readout.headlineValue, id + ' headline');
    assert.ok(step.readout.baselineValue, id + ' baseline');
    assert.ok(step.readout.treatmentValue, id + ' treatment');
  }
});

test('Test Drive live panel explains test and renders results summary', () => {
  const page = readFileSync(join(root, 'test-drive/index.html'), 'utf8');
  assert.match(page, /lab-test-box/);
  assert.match(page, /What we’re testing|What we're testing/);
  assert.match(page, /results-summary/);
  assert.match(page, /Results in plain language/);
  assert.match(page, /testing: 'We give 12 agents/);
  assert.match(page, /testing: 'We create many sessions/);
  assert.match(page, /testing: 'We hide answers/);
});
