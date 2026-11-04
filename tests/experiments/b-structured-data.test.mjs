import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildStructuredWorkload, experimentB_structuredData } from '../../src/experiments/b-structured-data.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentB_structuredData()), JSON.stringify(golden.B));
});

test('the same seed gives the same workload and another seed gives another', () => {
  assert.equal(JSON.stringify(buildStructuredWorkload(1).tiny), JSON.stringify(buildStructuredWorkload(1).tiny));
  assert.notEqual(JSON.stringify(buildStructuredWorkload(1).tiny), JSON.stringify(buildStructuredWorkload(2).tiny));
});

test('the experiment reports its own identity and passes its bar', () => {
  const result = experimentB_structuredData();
  assert.equal(result.id, 'B_structured_data');
  assert.equal(result.pass, true);
  assert.ok(result.tinyBytes < result.baselineBytes);
});
