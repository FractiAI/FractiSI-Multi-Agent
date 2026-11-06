import assert from 'node:assert/strict';
import test from 'node:test';
import { runComparativeBench } from '../../src/platform/comparative-bench.mjs';

test('comparative bench returns measured A/B/C arms without inventing production costs', () => {
  const report = runComparativeBench({ agentCounts: [5, 10], runs: 2 });
  assert.equal(report.measured, true);
  assert.equal(report.simulatedProductionCost, false);
  assert.equal(report.results.length, 4);
  for (const row of report.results) {
    assert.ok(row.arms.A);
    assert.ok(row.arms.B);
    assert.ok(row.arms.C);
    assert.equal(typeof row.arms.C.usefulCompletedTasks, 'number');
  }
});
