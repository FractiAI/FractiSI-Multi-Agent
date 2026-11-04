import assert from 'node:assert/strict';
import test from 'node:test';
import { RHYME_SESSIONS, compareRhymeToCache, differingWordSessions, identicalTextSessions, mixedSessions } from '../../src/experiments/rhyme-vs-cache.mjs';

test('with different words the rhyme beats the exact cache, and reconstruction matches', () => {
  const result = compareRhymeToCache(differingWordSessions());
  assert.equal(result.equivalent, true);
  assert.equal(result.shapeHits, RHYME_SESSIONS);
  assert.equal(result.exactTextHits, 0);
  assert.equal(result.cacheBytes, result.naiveBytes);
  assert.equal(result.naiveBytes, 6704);
  assert.equal(result.rhymeBytes, 4758);
});

test('with identical words the exact cache wins', () => {
  const result = compareRhymeToCache(identicalTextSessions());
  assert.equal(result.equivalent, true);
  assert.equal(result.exactTextHits, RHYME_SESSIONS - 1);
  assert.equal(result.cacheBytes, 164);
  assert.equal(result.rhymeBytes, 4691);
});

test('a duplicate fraction controls how many records repeat', () => {
  assert.equal(new Set(mixedSessions(0, 10).map((s) => JSON.stringify(s))).size, 10);
  assert.equal(new Set(mixedSessions(1, 10).map((s) => JSON.stringify(s))).size, 1);
  assert.equal(new Set(mixedSessions(0.5, 10).map((s) => JSON.stringify(s))).size, 6);
  assert.throws(() => mixedSessions(1.5), RangeError);
});

test('a record that does not rhyme is refused', () => {
  assert.throws(() => compareRhymeToCache([{ other: 'shape' }]), /did not rhyme/);
});
