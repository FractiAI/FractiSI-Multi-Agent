import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { benchmark } from '../../../src/cli/commands/benchmark.mjs';

test('the command is exported and the full regression lives in integration', () => {
  assert.equal(typeof benchmark, 'function');
  assert.ok(fs.existsSync(new URL('../../integration/customer-flow.test.mjs', import.meta.url)));
});
