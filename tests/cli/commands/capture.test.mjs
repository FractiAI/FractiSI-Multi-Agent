import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../../src/cli/commands/capture.mjs';

test('capture module loads', () => {
  assert.equal(typeof mod, 'object');
});
