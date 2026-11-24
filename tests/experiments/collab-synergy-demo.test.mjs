import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../../src/experiments/collab-synergy-demo.mjs';

test('collab-synergy-demo module loads', () => {
  assert.equal(typeof mod, 'object');
});
