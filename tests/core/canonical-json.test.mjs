import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { canonicalStringify, sha256, sha256File } from '../../src/core/canonical-json.mjs';

test('key order does not change the output', () => {
  assert.equal(canonicalStringify({ b: 1, a: { d: 2, c: 3 } }), canonicalStringify({ a: { c: 3, d: 2 }, b: 1 }));
});

test('arrays keep their order and output ends with a newline', () => {
  const text = canonicalStringify({ list: [3, 1, 2] });
  assert.deepEqual(JSON.parse(text).list, [3, 1, 2]);
  assert.ok(text.endsWith('\n'));
});

test('a non-finite number throws and names where it was', () => {
  assert.throws(() => canonicalStringify({ a: { b: [1, NaN] } }), /\$\.a\.b\[1\]/);
  assert.throws(() => canonicalStringify({ value: Infinity }), TypeError);
});

test('hashes match known values and agree between text and file', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tf-hash-')), 'x.txt');
  fs.writeFileSync(file, 'abc');
  assert.equal(sha256File(file), sha256('abc'));
});
