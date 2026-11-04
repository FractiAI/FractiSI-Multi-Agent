import assert from 'node:assert/strict';
import test from 'node:test';
import { mulberry32, shuffled } from '../../src/core/rng.mjs';

test('the generator is deterministic for a seed and differs between seeds', () => {
  const draw = (seed) => {
    const rng = mulberry32(seed);
    return [rng(), rng(), rng()];
  };
  assert.deepEqual(draw(7), draw(7));
  assert.notDeepEqual(draw(7), draw(8));
});

test('the generator stays in the unit interval', () => {
  const rng = mulberry32(20261103);
  for (let i = 0; i < 2000; i++) {
    const value = rng();
    assert.ok(value >= 0 && value < 1);
  }
});

test('shuffled is deterministic, returns a permutation and leaves its input alone', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const a = shuffled(input, mulberry32(1));
  const b = shuffled(input, mulberry32(1));
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.notDeepEqual(a, input);
});
