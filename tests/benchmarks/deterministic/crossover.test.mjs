import assert from 'node:assert/strict';
import test from 'node:test';
import { rhymeCacheCrossover } from '../../../src/benchmarks/deterministic/crossover.mjs';

test('the rhyme leads with no duplicates and the cache leads with all duplicates', () => {
  const result = rhymeCacheCrossover({ sessions: 40, duplicateFractions: [0, 0.5, 1] });
  assert.equal(result.points[0].smaller, 'rhyme');
  assert.equal(result.points.at(-1).smaller, 'cache');
  assert.equal(result.allEquivalent, true);
});

test('the crossover is the first grid point where the cache is smaller', () => {
  const result = rhymeCacheCrossover({ sessions: 40, duplicateFractions: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] });
  const first = result.points.find((p) => p.cacheBytes < p.rhymeBytes);
  assert.equal(result.cacheFirstSmallerAt, first.duplicateFraction);
});

test('with no cache win on the grid the crossover is absent, not zero', () => {
  assert.equal(rhymeCacheCrossover({ sessions: 40, duplicateFractions: [0] }).cacheFirstSmallerAt, null);
});
