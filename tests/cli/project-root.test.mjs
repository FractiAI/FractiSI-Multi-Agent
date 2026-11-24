import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../src/cli/project-root.mjs';

test('project-root module loads', () => {
  assert.equal(typeof mod, 'object');
});
