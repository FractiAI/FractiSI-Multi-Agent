import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../src/platform/prereqs.mjs';

test('prereqs module loads', () => {
  assert.equal(typeof mod, 'object');
});
