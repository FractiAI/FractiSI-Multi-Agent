import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { MAX_SCRIPT_LINES, assessScript, checkThinScripts } from '../../src/gates/thin-scripts.mjs';

test('this repository passes', () => {
  assert.deepEqual(checkThinScripts().problems, []);
});

test('a thin script passes', () => {
  assert.deepEqual(assessScript("import { main } from '../src/x.mjs';\nmain();\n", 'scripts/a.mjs'), []);
  assert.deepEqual(assessScript('def main():\n    return 0\n', 'scripts/a.py'), []);
});

test('negative control: too long, too many functions, or a class fails', () => {
  assert.equal(assessScript('x\n'.repeat(MAX_SCRIPT_LINES + 1), 'scripts/a.mjs').length, 1);
  assert.equal(assessScript('function a() {}\nfunction b() {}\n', 'scripts/a.mjs').length, 1);
  assert.equal(assessScript('class A {}\n', 'scripts/a.mjs').length, 1);
  assert.equal(assessScript('def a(): pass\ndef b(): pass\n', 'scripts/a.py').length, 1);
  assert.equal(assessScript('class A: pass\n', 'scripts/a.py').length, 1);
});

test('negative control: a fat script in a real tree is reported with its path', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-thin-'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.writeFileSync(path.join(root, 'scripts/fat.mjs'), 'function a() {}\nfunction b() {}\n');
  assert.match(checkThinScripts(root).problems[0], /scripts\/fat\.mjs/);
});
