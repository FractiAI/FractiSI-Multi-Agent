import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { experimentG_gatewayExactness } from '../../src/experiments/g-gateway-exactness.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentG_gatewayExactness()), JSON.stringify(golden.G));
});

test('both seeds reconstruct every packet', () => {
  const result = experimentG_gatewayExactness(1, 2);
  assert.equal(result.primary.exactRate, 1);
  assert.equal(result.validation.exactRate, 1);
  assert.equal(result.pass, true);
});
