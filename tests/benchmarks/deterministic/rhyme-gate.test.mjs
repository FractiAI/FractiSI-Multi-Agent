import assert from 'node:assert/strict';
import test from 'node:test';
import { rhymeByteFraction, rhymeGateProbe } from '../../../src/benchmarks/deterministic/rhyme-gate.mjs';

test('the gate refuses a plain brick wall, as it says it does', () => {
  const { plainWall } = rhymeGateProbe();
  assert.equal(plainWall.pass, false);
  assert.ok(plainWall.failed.includes('self_similar'));
});

test('declaring nest depth and drift on a mid-level nest is not enough without Net Zero', () => {
  const probe = rhymeGateProbe().wallWithNestedFieldAndDeclaredValues;
  assert.equal(probe.pass, false);
  assert.ok(probe.failed.includes('recursive'));
});

test('a Net Zero → ascending-octave cohort passes the four pillars', () => {
  const probe = rhymeGateProbe().netZeroOctaveRhyme;
  assert.equal(probe.pass, true);
  assert.deepEqual(probe.failed, []);
  assert.equal(probe.netZeroRoot, true);
  assert.deepEqual(probe.octaveSpan, [0, 1, 2]);
});

test('the byte fraction is computed over the cohort, and differs from the one the simulation hard-codes', () => {
  const fraction = rhymeByteFraction();
  assert.equal(fraction.cohortSharedFraction, 1 - fraction.expressionBytes / fraction.fullBytes);
  assert.ok(fraction.cohortSharedFraction > 0 && fraction.cohortSharedFraction < 1);
  assert.notEqual(fraction.cohortSharedFraction, fraction.simulationSharedFraction);
});
