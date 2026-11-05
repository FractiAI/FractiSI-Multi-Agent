import assert from 'node:assert/strict';
import test from 'node:test';
import { shapesRhyme, structuralSignature } from '../../../src/engine/rhyming/shape.mjs';

test('the same keys holding the same kinds of values rhyme, whatever the values', () => {
  assert.equal(shapesRhyme({ a: 1, b: 'x' }, { b: 'y', a: 99 }), true);
  assert.equal(shapesRhyme({ o: { r: 'user' } }, { o: { r: 'lead' } }), true);
  assert.equal(structuralSignature({ a: 1, b: 'x' }), structuralSignature({ b: 'y', a: 2 }));
});

test('extra keys, missing keys, renamed keys and changed kinds do not rhyme', () => {
  assert.equal(shapesRhyme({ a: 1 }, { a: 1, b: 2 }), false);
  assert.equal(shapesRhyme({ a: 1, b: 2 }, { a: 1 }), false);
  assert.equal(shapesRhyme({ a: 1 }, { a: 'one' }), false);
  assert.equal(shapesRhyme({ a: 1 }, { b: 1 }), false);
  assert.equal(shapesRhyme({ o: { r: 1 } }, { o: { s: 1 } }), false);
});

test('arrays and objects are different kinds, and null is its own kind', () => {
  assert.equal(shapesRhyme({ tags: ['a'] }, { tags: { a: true } }), false);
  assert.notEqual(structuralSignature({ tags: ['a'] }), structuralSignature({ tags: { a: true } }));
  assert.equal(shapesRhyme({ a: null }, { a: null }), true);
  assert.equal(shapesRhyme({ a: null }, { a: 1 }), false);
  assert.equal(shapesRhyme({ a: [] }, { a: [] }), true);
  assert.equal(shapesRhyme({ a: [] }, { a: [1] }), false);
});

test('very deep values stop at a fixed depth rather than recursing forever', () => {
  let deep = {};
  for (let i = 0; i < 40; i++) deep = { deep };
  assert.ok(structuralSignature(deep).includes('…'));
});
