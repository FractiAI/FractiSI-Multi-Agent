import assert from 'node:assert/strict';
import test from 'node:test';
import {
  XRAY_STAGES,
  XRAY_CLAIMS,
  PRINCIPAL_RHYME_CRITERIA,
  NXR_ENGINE_SHELF,
  recognizeXrayStages,
  crossDomainRhyme,
  principalCriteriaComplete,
  nxrEnginePinRecord,
  NXR_WORKING_FORM,
  NXR_DOES_NOT_PROVE,
} from '../../../src/engine/rhyming/neural-xray-rhyme.mjs';

test('eight X-ray stages XR-01…XR-08', () => {
  assert.equal(XRAY_STAGES.length, 8);
  assert.ok(XRAY_STAGES.every((s, i) => s.id === `XR-0${i + 1}`));
});

test('claims A/B/C and five principal criteria', () => {
  assert.equal(XRAY_CLAIMS.length, 3);
  assert.equal(principalCriteriaComplete(), true);
  assert.equal(PRINCIPAL_RHYME_CRITERIA.length, 5);
});

test('engine shelf #58 pin record', () => {
  const pin = nxrEnginePinRecord();
  assert.equal(pin.id, 58);
  assert.equal(NXR_ENGINE_SHELF, 58);
  assert.match(pin.honesty, /NOT claim|not claim|decisive|live MLP/i);
  assert.match(NXR_WORKING_FORM.compact, /See the rhyme/i);
  assert.ok(NXR_DOES_NOT_PROVE.length >= 4);
  assert.ok(NXR_DOES_NOT_PROVE.every((p) => !/decisive threshold still open/i.test(p)));
});

test('recognize intervene stage', () => {
  const ranked = recognizeXrayStages('intervene alter identified organizational relationship XR-07', {
    topK: 2,
  });
  assert.ok(ranked.some((r) => r.id === 'XR-07'));
});

test('cross-domain Soft Story rhyme on shared nest family', () => {
  const r = crossDomainRhyme(
    'shared world selective reconstruction Tiny Gateway compression',
    'APP DNMT3A wiring discovery rhyme coupling selective reconstruction',
  );
  assert.equal(r.rhyme, true);
});
