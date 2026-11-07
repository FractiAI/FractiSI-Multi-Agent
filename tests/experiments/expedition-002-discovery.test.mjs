import test from 'node:test';
import assert from 'node:assert/strict';
import { runDiscoveryConvergenceBenchmark } from '../../src/experiments/expedition-002-discovery.mjs';

test('E2 discovery 100/100 vs flat 0/100 and convergence reductions', () => {
  const e2 = runDiscoveryConvergenceBenchmark();
  assert.equal(e2.pass, true);
  assert.equal(e2.flat.discoveries, 0);
  assert.equal(e2.fractisi.discoveries, 100);
  assert.equal(e2.fractisi.solutions, 100);
  assert.ok(e2.opsReduction >= 0.84 && e2.opsReduction <= 0.86);
  assert.equal(e2.roundsReduction, 0.5);
  assert.equal(e2.flat.propagationRounds, 6);
  assert.equal(e2.fractisi.propagationRounds, 3);
});
