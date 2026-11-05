import assert from 'node:assert/strict';
import test from 'node:test';
import { createEnergyModel, emptyEnergyCounters, scaleUnderBudget, touchBytes, touchCompare } from '../../../src/engine/energy/proxy.mjs';

test('the estimate is arithmetic on counts and labels itself a proxy', () => {
  const model = createEnergyModel({ joulesPerByteTouch: 2, joulesPerCompare: 3, joulesPerReconstruct: 5 });
  assert.deepEqual(model.estimateOpCost({ bytesTouched: 1, compares: 1, reconstructs: 1 }), {
    PROXY: true, joules: 10, wattsIdleProxy: 0, bytesTouched: 1, compares: 1, reconstructs: 1,
  });
  assert.equal(model.PROXY, true);
});

test('a plan within budget is left alone', () => {
  const result = scaleUnderBudget({ maxDepth: 8, bytesTouched: 10 }, 1, createEnergyModel());
  assert.equal(result.scaled, false);
  assert.equal(result.plan.maxDepth, 8);
  assert.deepEqual(result.steps, []);
});

test('a tight budget shrinks depth first, then candidates, then buffer levels', () => {
  const model = createEnergyModel({ joulesPerByteTouch: 1, joulesPerCompare: 1, joulesPerReconstruct: 0 });
  const result = scaleUnderBudget({ maxDepth: 3, candidateCap: 4, bufferLevels: 2, bytesTouched: 1000, compares: 1000 }, 1, model);
  assert.equal(result.scaled, true);
  assert.equal(result.plan.maxDepth, 1);
  assert.equal(result.plan.candidateCap, 1);
  assert.equal(result.plan.bufferLevels, 1);
  assert.deepEqual(result.steps.slice(0, 2).map((s) => s.lever), ['maxDepth', 'maxDepth']);
});

test('no budget means no scaling', () => {
  assert.equal(scaleUnderBudget({ bytesTouched: 1e12 }, null).scaled, false);
});

test('counters add up', () => {
  const counters = emptyEnergyCounters();
  touchBytes(counters, 5);
  touchCompare(counters);
  touchCompare(counters, 2);
  assert.equal(counters.bytesTouched, 5);
  assert.equal(counters.compares, 3);
  assert.equal(counters.PROXY, true);
});
