import assert from 'node:assert/strict';
import test from 'node:test';
import { conventionalStore, parseSessionCount, runMultiSessionDemo, tinyStore } from '../../src/workloads/multi-session.mjs';

test('session counts parse strictly and fall back to the default', () => {
  assert.equal(parseSessionCount('5'), 5);
  for (const bad of [undefined, 'x', '0', '-2']) assert.equal(parseSessionCount(bad), 12);
});

test('the shared form is smaller, and the difference grows with sessions', () => {
  assert.ok(tinyStore(12).bytes < conventionalStore(12).bytes);
  const reduction = (n) => runMultiSessionDemo(n).byteReduction;
  assert.ok(reduction(64) > reduction(2));
});

test('one session has no saving to speak of', () => {
  assert.ok(runMultiSessionDemo(1).byteReduction < 0.05);
});
