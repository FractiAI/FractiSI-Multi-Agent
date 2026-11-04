import assert from 'node:assert/strict';
import test from 'node:test';
import { createVectorStore } from '../../../src/engine/vectors/store.mjs';

function chain() {
  const store = createVectorStore();
  store.put({ id: 'a', cross: ['b'] });
  store.put({ id: 'b', children: ['c'] });
  store.put({ id: 'c', deps: ['d'] });
  store.put({ id: 'd', complement: 'e' });
  store.put({ id: 'e' });
  store.put({ id: 'unrelated' });
  return store;
}

test('a working set is the closure across every link kind, and nothing else', () => {
  const ids = chain().resolveWorkingSet('a').map((v) => v.id).sort();
  assert.deepEqual(ids, ['a', 'b', 'c', 'd', 'e']);
});

test('depth bounds the closure', () => {
  assert.deepEqual(chain().resolveWorkingSet('a', { maxDepth: 1 }).map((v) => v.id).sort(), ['a', 'b']);
});

test('cycles and dangling links terminate', () => {
  const store = createVectorStore();
  store.put({ id: 'a', cross: ['b', 'missing'] });
  store.put({ id: 'b', cross: ['a'] });
  assert.equal(store.resolveWorkingSet('a').length, 2);
  assert.deepEqual(store.resolveWorkingSet('missing'), []);
});

test('a vector needs an id, and the store reports its contents', () => {
  const store = chain();
  assert.throws(() => store.put({}), /needs id/);
  assert.equal(store.size(), 6);
  assert.equal(store.all().length, 6);
  assert.equal(store.get('a').id, 'a');
  assert.equal(store.get('absent'), null);
});
