import assert from 'node:assert/strict';
import test from 'node:test';
import { PLATFORM_LAYERS, COORD_COMPOSE_STACK, COMMUNITY_STACK } from '../../src/testdrive/platform-layers.mjs';

test('platform surfaces use names, not letter codes', () => {
  assert.ok(PLATFORM_LAYERS.length >= 5);
  assert.doesNotMatch(JSON.stringify(PLATFORM_LAYERS), /Layer [A-F]\b/);
});

test('stack strings name the product surfaces', () => {
  assert.equal(COORD_COMPOSE_STACK, 'Coordination · Shared state · Composition');
  assert.match(COMMUNITY_STACK, /Tiny Footprint/);
  assert.match(COMMUNITY_STACK, /Git awareness/);
});
