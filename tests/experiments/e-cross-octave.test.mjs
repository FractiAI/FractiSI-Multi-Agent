import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildCrossOctaveWorkload, experimentE_crossOctave } from '../../src/experiments/e-cross-octave.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-0dcf9d2.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentE_crossOctave()), JSON.stringify(golden.E));
});


test('the experiment reports its own identity and passes its bar', () => {
  const result = experimentE_crossOctave();
  assert.equal(result.id, 'E_cross_octave');
  assert.equal(result.pass, true);
  assert.ok(result.tinyBytes < result.baselineBytes);
});

test('the working set is one request, not a representation of the lattice', () => {
  const { conventional, working } = buildCrossOctaveWorkload();
  assert.ok(working.length < conventional.length / 4);
  const ids = new Set(working.map((vector) => vector.id));
  assert.ok(conventional.some((vector) => !ids.has(vector.id)));
});
