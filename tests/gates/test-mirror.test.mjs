import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkTestMirror, isBarrel } from '../../src/gates/test-mirror.mjs';

function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-mirror-'));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  return root;
}

test('this repository passes', () => {
  assert.deepEqual(checkTestMirror().problems, []);
});

test('mirrored Node and Python modules pass', () => {
  const root = tree({
    'src/a/x.mjs': 'export const x = 1;',
    'tests/a/x.test.mjs': '',
    'src/p/y.py': 'x = 1',
    'src/p/__init__.py': '',
    'tests/p/test_y.py': '',
  });
  assert.deepEqual(checkTestMirror(root).problems, []);
});

test('negative control: a module with no test fails', () => {
  assert.equal(checkTestMirror(tree({ 'src/a/x.mjs': 'export const x = 1;' })).problems.length, 1);
  assert.equal(checkTestMirror(tree({ 'src/p/y.py': 'x = 1' })).problems.length, 1);
});

test('negative control: a test whose module moved fails', () => {
  assert.match(checkTestMirror(tree({ 'tests/a/gone.test.mjs': '' })).problems[0], /no module/);
  assert.match(checkTestMirror(tree({ 'tests/p/test_gone.py': '' })).problems[0], /no module/);
});

test('barrels need no test; fixtures and integration tests need no module', () => {
  const root = tree({
    'src/a/index.mjs': "export * from './x.mjs';\nexport { y } from './y.mjs';\n",
    'tests/integration/flow.test.mjs': '',
    'tests/fixtures/data.test.mjs': '',
  });
  assert.deepEqual(checkTestMirror(root).problems, []);
});

test('a module that re-exports and also holds logic is not a barrel', () => {
  assert.equal(isBarrel("export * from './x.mjs';"), true);
  assert.equal(isBarrel("/** note */\nexport { a } from './a.mjs';"), true);
  assert.equal(isBarrel("export * from './x.mjs';\nexport const y = 1;"), false);
  assert.equal(isBarrel('export function f() {}'), false);
  assert.equal(isBarrel("export * from './a.mjs'\nexport function f(){return 42}\n"), false);
  assert.equal(isBarrel("export * from './a.mjs'\nexport { b } from './b.mjs'\n"), true);
  assert.equal(isBarrel("export * as ns from './a.mjs';"), true);
  assert.equal(isBarrel(''), false);
});
