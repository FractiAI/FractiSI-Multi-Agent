import assert from 'node:assert/strict';
import test from 'node:test';
import { listTestDriveSteps, runTestDriveStep } from '../../src/testdrive/run-step.mjs';

test('catalog lists primer through 7 with product layers', () => {
  const steps = listTestDriveSteps();
  assert.equal(steps.length, 8);
  assert.equal(steps[0].id, 'primer');
  assert.match(steps[0].title, /Architecture primer|FractiSI Multi-Agent/);
  assert.match(steps[0].component, /Generative possibility|Tiny Gateway/);
  assert.match(steps[3].component, /Rhyming Templates/);
  assert.match(steps[3].short, /Net Zero|octaves/i);
  assert.match(steps[6].layer, /Coordination/);
  assert.equal(steps[7].id, '7');
});

test('each step returns structured live results naming components', () => {
  for (const id of ['primer', '1', '2', '3', '4', '5', '6', '7']) {
    const out = runTestDriveStep(id);
    assert.equal(out.ok, true);
    assert.equal(out.step.id === 'primer' ? 'primer' : out.step.id, id === '0' ? 'primer' : id);
    assert.ok(Array.isArray(out.step.lines));
    assert.ok(out.step.lines.length > 0);
    assert.ok(out.step.layer);
    assert.ok(out.step.component);
    assert.ok(typeof out.ms === 'number');
  }
  const primer = runTestDriveStep('primer').step.lines.join('\n');
  assert.match(primer, /Generative possibility/);
  assert.match(primer, /Net Zero/);
  assert.match(primer, /Φ_EGS|1\.618/);
  assert.match(primer, /Infinite Octaves/);
  assert.match(primer, /Boundary nodes/);
  assert.match(primer, /Recursive trees/);
  assert.match(primer, /3D Hexagon|eight-node/);
  assert.match(primer, /Wave/);
  assert.match(primer, /Awareness/);
  assert.match(primer, /Rhyming Templates/);
  assert.match(primer, /Tiny Footprint/);
  assert.match(primer, /Active Inference/);
  assert.match(primer, /including humans/);
  assert.match(primer, /possible rhyme|Possible Active Inference/);
  assert.match(primer, /shared world|Home base|plain English/i);
  const rhyme = runTestDriveStep(3).step.lines.join('\n');
  assert.match(rhyme, /RHYMING TEMPLATES|Rhyming Template/i);
  assert.match(rhyme, /Net Zero/);
});

test('discovery step reports 100/100 vs 0/100', () => {
  const out = runTestDriveStep(4);
  assert.equal(out.step.metrics.pass, true);
  assert.equal(out.step.metrics.flatDiscoveries, 0);
  assert.equal(out.step.metrics.fractisiDiscoveries, 100);
  assert.equal(out.step.metrics.component, 'selective_reconstruction');
});
