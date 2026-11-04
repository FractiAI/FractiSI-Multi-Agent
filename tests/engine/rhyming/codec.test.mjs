import assert from 'node:assert/strict';
import test from 'node:test';
import { createTemplateCatalog } from '../../../src/engine/rhyming/catalog.mjs';
import { deepEqual, encodeExpression, reconstructExpression } from '../../../src/engine/rhyming/codec.mjs';

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

test('state travels beside the delta', () => {
  const encoded = encodeExpression('t', pattern, { kind: 'k' }, { tick: 3 });
  assert.deepEqual(encoded.state, { tick: 3 });
  assert.deepEqual(reconstructExpression(catalog, encoded).__state, { tick: 3 });
});

test('reconstructing against an unknown template throws', () => {
  assert.throws(() => reconstructExpression(catalog, { templateId: 'absent', delta: {} }), /missing template/);
});

test('deepEqual compares JSON text, so key order matters', () => {
  assert.equal(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true);
  assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), false);
});

test('known limit: a key the expression omits comes back from the pattern', () => {
  const encoded = encodeExpression('t', pattern, { kind: 'k', role: 'user' });
  assert.equal(reconstructExpression(catalog, encoded).n, 1);
  assert.equal(deepEqual(reconstructExpression(catalog, encoded), { kind: 'k', role: 'user' }), false);
  assert.equal(catalog.findMatch({ kind: 'k', role: 'user' }), null, 'shape matching excludes such an expression');
});
