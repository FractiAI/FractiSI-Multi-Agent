import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { experimentR_holographicRhymeGate } from '../../src/experiments/r-holographic-rhyme-gate.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('results match upstream byte for byte', () => {
  assert.equal(JSON.stringify(experimentR_holographicRhymeGate()), JSON.stringify(golden.R));
});

test('the gate passes the rhyme cohort and refuses the contrast cases', () => {
  const result = experimentR_holographicRhymeGate();
  assert.equal(result.pass, true);
  assert.equal(result.trueAudit.pass, true);
  assert.equal(result.brickAudit.pass, false);
  assert.equal(result.schemaOnly.pass, false);
  assert.equal(result.falseMatchRejected, true);
  assert.equal(result.arrayObjectDistinct, true);
  assert.equal(result.nestedFieldDelta, true);
});
