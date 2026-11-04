import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { experimentK_dynamicRoute } from '../../src/experiments/k-dynamic-route.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('results match upstream byte for byte', () => {
  assert.equal(JSON.stringify(experimentK_dynamicRoute()), JSON.stringify(golden.K));
});

test('routing counts fewer comparisons than a scan and refuses an ambiguous match', () => {
  const result = experimentK_dynamicRoute();
  assert.equal(result.pass, true);
  assert.ok(result.bucketCompares < result.linearCompares);
  assert.equal(result.falseMatchRejected, true);
});
