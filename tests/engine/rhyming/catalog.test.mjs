import assert from 'node:assert/strict';
import test from 'node:test';
import { createTemplateCatalog } from '../../../src/engine/rhyming/catalog.mjs';

test('registering stores a frozen template that can be found by id and by shape', () => {
  const catalog = createTemplateCatalog();
  assert.equal(catalog.register({ id: 't', pattern: { a: 1 } }), 't');
  assert.equal(catalog.has('t'), true);
  assert.equal(catalog.size(), 1);
  assert.equal(Object.isFrozen(catalog.get('t')), true);
  assert.equal(catalog.findMatch({ a: 2 }).id, 't');
  assert.equal(catalog.findMatch({ b: 2 }), null);
  assert.equal(catalog.all().length, 1);
});

test('an invalid template is refused and an unknown id reads as null', () => {
  const catalog = createTemplateCatalog();
  assert.throws(() => catalog.register({ id: 't' }), /invalid template/);
  assert.throws(() => catalog.register({ pattern: {} }), /invalid template/);
  assert.equal(catalog.get('absent'), null);
});
