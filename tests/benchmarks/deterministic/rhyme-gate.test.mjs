import assert from 'node:assert/strict';
import test from 'node:test';
import { rhymeByteFraction, rhymeGateProbe } from '../../../src/benchmarks/deterministic/rhyme-gate.mjs';

test('the gate refuses a plain brick wall, as it says it does', () => {
  const { plainWall } = rhymeGateProbe();
  assert.equal(plainWall.pass, false);
  assert.ok(plainWall.failed.includes('self_similar'));
});

test('the same bricks pass once they have a nested field and declare the numbers the gate reads', () => {
  const probe = rhymeGateProbe().wallWithNestedFieldAndDeclaredValues;
  assert.equal(probe.pass, true);
  assert.deepEqual(probe.failed, []);
});

test('the byte fraction is computed over the cohort, and differs from the one the simulation hard-codes', () => {
  const fraction = rhymeByteFraction();
  assert.equal(fraction.cohortSharedFraction, 1 - fraction.expressionBytes / fraction.fullBytes);
  assert.ok(fraction.cohortSharedFraction > 0 && fraction.cohortSharedFraction < 1);
  assert.notEqual(fraction.cohortSharedFraction, fraction.simulationSharedFraction);
});
