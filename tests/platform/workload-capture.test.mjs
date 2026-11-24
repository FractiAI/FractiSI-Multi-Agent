import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../src/platform/workload-capture.mjs';

test('workload-capture module loads', () => {
  assert.equal(typeof mod, 'object');
});
