import assert from 'node:assert/strict';
import test from 'node:test';
import { shapeKeysMatch } from '../../../src/engine/rhyming/shape.mjs';

test('same keys and value kinds rhyme, whatever the values', () => {
  assert.equal(shapeKeysMatch({ a: 1, b: 'x' }, { b: 'y', a: 99 }), true);
});

test('a missing key, an extra key or a different kind does not rhyme', () => {
  assert.equal(shapeKeysMatch({ a: 1 }, { a: 1, b: 2 }), false);
  assert.equal(shapeKeysMatch({ a: 1, b: 2 }, { a: 1 }), false);
  assert.equal(shapeKeysMatch({ a: 1 }, { a: 'one' }), false);
  assert.equal(shapeKeysMatch({ a: 1 }, { b: 1 }), false);
});
