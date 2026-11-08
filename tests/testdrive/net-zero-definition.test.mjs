import assert from 'node:assert/strict';
import test from 'node:test';
import { NET_ZERO_DEFINITION, netZeroDefinitionLines } from '../../src/testdrive/net-zero-definition.mjs';

test('Net Zero is locked as balanced zero, not nothing zero', () => {
  assert.equal(NET_ZERO_DEFINITION.punch, 'Balanced zero, not nothing zero.');
  assert.match(NET_ZERO_DEFINITION.lede, /active equilibrium/i);
  assert.ok(NET_ZERO_DEFINITION.notNetZero.length >= 3);
});

test('definition lines carry the punch line', () => {
  assert.match(netZeroDefinitionLines().join('\n'), /Balanced zero, not nothing zero/);
});
