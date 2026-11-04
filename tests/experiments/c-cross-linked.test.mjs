import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildCrossLinkedWorkload, experimentC_crossLinked } from '../../src/experiments/c-cross-linked.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-0dcf9d2.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentC_crossLinked()), JSON.stringify(golden.C));
});

test('the same seed gives the same workload and another seed gives another', () => {
  assert.equal(JSON.stringify(buildCrossLinkedWorkload(1).tiny), JSON.stringify(buildCrossLinkedWorkload(1).tiny));
  assert.notEqual(JSON.stringify(buildCrossLinkedWorkload(1).tiny), JSON.stringify(buildCrossLinkedWorkload(2).tiny));
});

test('the experiment reports its own identity and passes its bar', () => {
  const result = experimentC_crossLinked();
  assert.equal(result.id, 'C_cross_linked');
  assert.equal(result.pass, true);
  assert.ok(result.tinyBytes < result.baselineBytes);
});
