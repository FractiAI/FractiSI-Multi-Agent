import assert from 'node:assert/strict';
import test from 'node:test';
import { experimentH_enginePinGate } from '../../src/experiments/h-engine-pin-gate.mjs';

const clearing = [{ baselineBytes: 1000, tinyBytes: 100 }];
const below = [{ baselineBytes: 1000, tinyBytes: 300 }];

test('a pin needs the aggregate, exactness and a GPU lab that passed', () => {
  const result = experimentH_enginePinGate(clearing, true, { pass: true, allocReduction: 0.9 });
  assert.equal(result.enginePinRecommended, true);
  assert.equal(result.status, 'pass');
  assert.match(result.interpretation, /GPU live-stack lab/);
});

test('a GPU lab that did not run withholds the pin and says why', () => {
  for (const lab of [null, { pass: false, status: 'not_run' }]) {
    const result = experimentH_enginePinGate(clearing, true, lab);
    assert.equal(result.enginePinRecommended, false);
    assert.equal(result.pass, false);
    assert.equal(result.status, 'not_run');
    assert.match(result.interpretation, /did not run on this host/);
  }
});

test('a GPU lab that ran and failed refuses the pin', () => {
  const result = experimentH_enginePinGate(clearing, true, { pass: false, status: 'fail' });
  assert.equal(result.enginePinRecommended, false);
  assert.equal(result.status, 'fail');
});

test('below the target or without exactness, no lab can rescue the pin', () => {
  assert.equal(experimentH_enginePinGate(below, true, { pass: true, allocReduction: 0.9 }).pass, false);
  assert.equal(experimentH_enginePinGate(clearing, false, { pass: true, allocReduction: 0.9 }).pass, false);
  assert.equal(experimentH_enginePinGate(below, true, null).status, 'fail');
});

test('a failed rhyme gate refuses the pin, even when the GPU lab passed', () => {
  const lab = { pass: true, allocReduction: 0.9 };
  assert.equal(experimentH_enginePinGate(clearing, true, lab, { pass: true }).enginePinRecommended, true);
  const refused = experimentH_enginePinGate(clearing, true, lab, { pass: false });
  assert.equal(refused.enginePinRecommended, false);
  assert.equal(refused.status, 'fail');
});
