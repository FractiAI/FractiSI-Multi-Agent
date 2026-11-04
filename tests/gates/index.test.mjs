import assert from 'node:assert/strict';
import test from 'node:test';
import { runAllGates } from '../../src/gates/index.mjs';

test('every gate runs and this repository passes all of them', () => {
  const gates = runAllGates();
  assert.equal(gates.length, 6);
  for (const gate of gates) assert.deepEqual(gate.problems, [], gate.name);
});
