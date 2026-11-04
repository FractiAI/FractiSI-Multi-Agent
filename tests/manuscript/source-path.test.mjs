import assert from 'node:assert/strict';
import test from 'node:test';
import { readPath } from '../../src/manuscript/source-path.mjs';

const root = { a: { b: 7 }, rows: [{ k: 'x', n: 1, v: 10 }, { k: 'y', n: 1, v: 20 }, { k: 'y', n: 2, v: 30 }], zero: 0, none: null, bad: NaN };

test('dotted paths and row selectors read values', () => {
  assert.equal(readPath(root, 'a.b'), 7);
  assert.equal(readPath(root, 'rows[k=x].v'), 10);
  assert.equal(readPath(root, 'rows[k=y,n=2].v'), 30);
  assert.equal(readPath(root, 'zero'), 0);
});

test('absent evidence throws and names where', () => {
  assert.throws(() => readPath(root, 'a.c'), /missing evidence at a\.c/);
  assert.throws(() => readPath(root, 'none'), /missing evidence/);
  assert.throws(() => readPath(root, 'absent.x'), /missing evidence at absent/);
});

test('a non-finite value throws', () => {
  assert.throws(() => readPath(root, 'bad'), /non-finite/);
});

test('a selector must identify exactly one row', () => {
  assert.throws(() => readPath(root, 'rows[k=y].v'), /expected one row/);
  assert.throws(() => readPath(root, 'rows[k=z].v'), /found 0/);
  assert.throws(() => readPath(root, 'a[k=x].v'), /not a list/);
});
