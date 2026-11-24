import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../src/experiments/relational-intelligence-demo.mjs';

test('relational-intelligence-demo module loads', () => {
  assert.equal(typeof mod, 'object');
});
