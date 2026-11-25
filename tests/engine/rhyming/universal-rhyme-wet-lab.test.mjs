import assert from 'node:assert/strict';
import test from 'node:test';
import {
  WET_LAB_EVIDENCE_CHAIN,
  URWL_ENGINE_SHELF,
  recognizeWetLabLinks,
  nestedWetLab,
  wetLabChainComplete,
  urwlEnginePinRecord,
  URWL_WORKING_FORM,
  URWL_DOES_NOT_PROVE,
} from '../../../src/engine/rhyming/universal-rhyme-wet-lab.mjs';

test('chain has WL-01…WL-05 all demonstrated', () => {
  assert.equal(WET_LAB_EVIDENCE_CHAIN.length, 5);
  assert.ok(WET_LAB_EVIDENCE_CHAIN.every((e) => e.demonstrated));
  assert.equal(wetLabChainComplete(), true);
});

test('engine shelf #56 pin record', () => {
  const pin = urwlEnginePinRecord();
  assert.equal(pin.id, 56);
  assert.equal(URWL_ENGINE_SHELF, 56);
  assert.match(pin.honesty, /not claimed|open/i);
  assert.equal(URWL_WORKING_FORM.compact, 'Different embodiment. Same computational organization.');
  assert.ok(URWL_DOES_NOT_PROVE.length >= 5);
});

test('recognize WISE-like description as WL-05', () => {
  const ranked = recognizeWetLabLinks(
    'WISE radio-frequency matrix-vector multiplication machine learning inference',
    { topK: 3 },
  );
  assert.ok(ranked.some((r) => r.id === 'WL-05'));
});

test('nested wet-lab under WL-04', () => {
  const nested = nestedWetLab('WL-04');
  assert.ok(nested.length >= 2);
});
