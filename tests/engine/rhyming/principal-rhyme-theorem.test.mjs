import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRINCIPAL_RHYME_CATALOG,
  PRT_ENGINE_SHELF,
  recognizeRhymes,
  nestedRhymes,
  phenomenaRhyme,
  prtEnginePinRecord,
  PRT_WORKING_FORM,
} from '../../../src/engine/rhyming/principal-rhyme-theorem.mjs';

test('catalog has PR-01…PR-20 plus meta-rhyme', () => {
  assert.equal(PRINCIPAL_RHYME_CATALOG.length, 21);
  assert.ok(PRINCIPAL_RHYME_CATALOG.some((e) => e.id === 'PR-01'));
  assert.ok(PRINCIPAL_RHYME_CATALOG.some((e) => e.id === 'PR-∞'));
});

test('engine shelf #55 pin record', () => {
  const pin = prtEnginePinRecord();
  assert.equal(pin.id, 55);
  assert.equal(PRT_ENGINE_SHELF, 55);
  assert.match(pin.grammar, /Recognize/);
  assert.equal(PRT_WORKING_FORM.compact, 'Different things. Same rhyme.');
});

test('recognize compression / Tiny Gateway as PR-09 family', () => {
  const ranked = recognizeRhymes(
    'Tiny Gateway compression reconstruction selective materialization of nested delta templates',
    { topK: 3 },
  );
  assert.ok(ranked.some((r) => r.id === 'PR-09'));
});

test('nested rhymes under PR-07', () => {
  const nested = nestedRhymes('PR-07');
  assert.ok(nested.length >= 2);
});

test('cross-domain boundary rhyme', () => {
  const r = phenomenaRhyme(
    'cell membrane boundary separating cytoplasm from environment',
    'computational agent boundary against shared world external state',
  );
  assert.equal(r.rhyme, true);
  assert.ok(r.shared.some((s) => s.id === 'PR-02'));
});
