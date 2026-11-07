import assert from 'node:assert/strict';
import test from 'node:test';
import { COMMANDS, main } from '../../src/cli/main.mjs';

test('the documented commands exist', () => {
  assert.deepEqual(Object.keys(COMMANDS).sort(), ['agents', 'benchmark', 'capture', 'compose', 'coord-bench', 'demo', 'deploy', 'doctor', 'init', 'install', 'integrate', 'join', 'propose', 'repo', 'report', 'share', 'status', 'test-drive', 'testdrive', 'try']);
});

test('an unknown command returns a failure and no command runs doctor by default', async () => {
  assert.equal(await main(['node', 'tiny', 'nope']), 1);
  assert.equal(await main(['node', 'tiny']), 0);
});
