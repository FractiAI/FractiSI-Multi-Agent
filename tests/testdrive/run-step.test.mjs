import assert from 'node:assert/strict';
import test from 'node:test';
import { listTestDriveSteps, runTestDriveStep } from '../../src/testdrive/run-step.mjs';

test('catalog lists primer through 7', () => {
  const steps = listTestDriveSteps();
  assert.equal(steps.length, 8);
  assert.equal(steps[0].id, 'primer');
  assert.equal(steps[7].id, '7');
});

test('each step returns structured live results', () => {
  for (const id of ['primer', '1', '2', '3', '4', '5', '6', '7']) {
    const out = runTestDriveStep(id);
    assert.equal(out.ok, true);
    assert.equal(out.step.id === 'primer' ? 'primer' : out.step.id, id === '0' ? 'primer' : id);
    assert.ok(Array.isArray(out.step.lines));
    assert.ok(out.step.lines.length > 0);
    assert.ok(typeof out.ms === 'number');
  }
});

test('discovery step reports 100/100 vs 0/100', () => {
  const out = runTestDriveStep(4);
  assert.equal(out.step.metrics.pass, true);
  assert.equal(out.step.metrics.flatDiscoveries, 0);
  assert.equal(out.step.metrics.fractisiDiscoveries, 100);
});
