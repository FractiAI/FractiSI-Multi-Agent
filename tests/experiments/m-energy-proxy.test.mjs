import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { experimentM_energyProxyScale } from '../../src/experiments/m-energy-proxy.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('results match upstream byte for byte', () => {
  assert.equal(JSON.stringify(experimentM_energyProxyScale()), JSON.stringify(golden.M));
});

test('a tight proxy budget shrinks the depth and touches no more bytes', () => {
  const result = experimentM_energyProxyScale();
  assert.equal(result.pass, true);
  assert.ok(result.scaledDepth < result.baselineDepth);
  assert.ok(result.scaledBytes <= result.baselineBytes);
  assert.match(result.honesty, /not wall-socket/);
});
