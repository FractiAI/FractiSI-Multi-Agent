import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { SUITE_NAME } from '../../src/core/paths.mjs';
import { checkShims } from '../../src/gates/shims.mjs';

function tree(body) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-shim-'));
  const file = path.join(root, 'research', SUITE_NAME, 'src', 'a.mjs');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkShims().problems, []);
});

test('a re-export passes', () => {
  assert.deepEqual(checkShims(tree("export * from '../../../src/x.mjs';\n")).problems, []);
});

test('negative control: logic growing back in a compatibility path fails', () => {
  assert.match(checkShims(tree('export function engine() { return 1; }\n')).problems[0], /holds logic/);
});
