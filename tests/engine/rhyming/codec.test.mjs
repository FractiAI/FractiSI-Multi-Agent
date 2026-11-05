import assert from 'node:assert/strict';
import test from 'node:test';
import { createTemplateCatalog } from '../../../src/engine/rhyming/catalog.mjs';
import { deepEqual, diffDelta, encodeExpression, mergeDelta, reconstructExpression, reconstructExpressionWithState } from '../../../src/engine/rhyming/codec.mjs';

const pattern = { kind: 'k', role: 'user', n: 1 };
const catalog = createTemplateCatalog();
catalog.register({ id: 't', pattern });

test('only differing fields enter the delta', () => {
  assert.deepEqual(encodeExpression('t', pattern, { kind: 'k', role: 'lead', n: 1 }), { templateId: 't', delta: { role: 'lead' } });
});

test('an expression round-trips exactly, without sharing memory with the template', () => {
  const expression = { kind: 'k', role: 'lead', n: 2 };
  const rebuilt = reconstructExpression(catalog, encodeExpression('t', pattern, expression));
  assert.deepEqual(rebuilt, expression);
  const withObject = createTemplateCatalog();
  withObject.register({ id: 'o', pattern: { nested: { a: 1 } } });
  const copy = reconstructExpression(withObject, { templateId: 'o', delta: {} });
  copy.nested.a = 99;
  assert.equal(withObject.get('o').pattern.nested.a, 1);
});

test('state travels beside the delta and stays out of the reconstructed value', () => {
  const encoded = encodeExpression('t', pattern, { kind: 'k', role: 'user', n: 1 }, { tick: 3 });
  assert.deepEqual(encoded.state, { tick: 3 });
  assert.deepEqual(reconstructExpression(catalog, encoded), pattern);
  assert.deepEqual(reconstructExpressionWithState(catalog, encoded), { value: pattern, state: { tick: 3 } });
  assert.equal(reconstructExpressionWithState(catalog, { templateId: 't', delta: {} }).state, null);
});

test('reconstructing against an unknown template throws', () => {
  assert.throws(() => reconstructExpression(catalog, { templateId: 'absent', delta: {} }), /missing template/);
});

test('deepEqual compares JSON text, so key order matters', () => {
  assert.equal(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true);
  assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), false);
});

test('an expression that does not rhyme with its template is refused', () => {
  assert.throws(() => encodeExpression('t', pattern, { kind: 'k', role: 'user' }), /does not rhyme/);
  assert.throws(() => encodeExpression('t', pattern, { kind: 'k', role: 'user', n: 'one' }), /does not rhyme/);
  assert.equal(catalog.findMatch({ kind: 'k', role: 'user' }), null, 'shape matching agrees');
});

test('nested deltas hold only the fields that differ', () => {
  const base = { meta: { role: 'user', octave: 1 }, text: '' };
  assert.deepEqual(diffDelta(base, { meta: { role: 'lead', octave: 1 }, text: 'q' }), { meta: { role: 'lead' }, text: 'q' });
  assert.equal(diffDelta(base, structuredClone(base)), undefined);
});

test('a merge rebuilds a nested value exactly, without sharing memory with the template', () => {
  const base = { meta: { role: 'user', octave: 1 }, text: '' };
  const merged = mergeDelta(base, { meta: { role: 'lead' } });
  assert.deepEqual(merged, { meta: { role: 'lead', octave: 1 }, text: '' });
  merged.meta.octave = 99;
  assert.equal(base.meta.octave, 1);
});

test('a key removed from a value is recorded and removed again on the way back', () => {
  const delta = diffDelta({ a: 1, b: 2 }, { a: 1 });
  assert.deepEqual(delta, { b: { __missing: true } });
  assert.deepEqual(mergeDelta({ a: 1, b: 2 }, delta), { a: 1 });
});

test('arrays are replaced whole, not merged', () => {
  assert.deepEqual(mergeDelta({ list: [1, 2, 3] }, { list: [9] }), { list: [9] });
});
