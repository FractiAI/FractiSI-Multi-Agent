import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { RHYME_SESSIONS, compareRhymeToCache, differingWordSessions, identicalTextSessions, mixedSessions } from '../../src/experiments/rhyme-vs-cache.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-733b48e.json', import.meta.url), 'utf8'));

test('with different words the rhyme beats the exact cache, and reconstruction matches', () => {
  const result = compareRhymeToCache(differingWordSessions());
  assert.equal(result.equivalent, true);
  assert.equal(result.shapeHits, RHYME_SESSIONS);
  assert.equal(result.exactTextHits, 0);
  assert.equal(result.cacheBytes, result.naiveBytes);
  assert.ok(result.rhymeBytes < result.cacheBytes);
  assert.equal(result.rhymeAuditPass, true);
  assert.equal(JSON.stringify(result), JSON.stringify(golden.rhymeDiffering));
});

test('with identical words the exact cache wins', () => {
  const result = compareRhymeToCache(identicalTextSessions());
  assert.equal(result.equivalent, true);
  assert.equal(result.exactTextHits, RHYME_SESSIONS - 1);
  assert.ok(result.cacheBytes < result.rhymeBytes);
  assert.equal(JSON.stringify(result), JSON.stringify(golden.rhymeIdentical));
});

test('a duplicate fraction controls how many records repeat', () => {
  assert.equal(new Set(mixedSessions(0, 10).map((s) => JSON.stringify(s))).size, 10);
  assert.equal(new Set(mixedSessions(1, 10).map((s) => JSON.stringify(s))).size, 1);
  assert.equal(new Set(mixedSessions(0.5, 10).map((s) => JSON.stringify(s))).size, 6);
  assert.throws(() => mixedSessions(1.5), RangeError);
});

test('a cohort that does not rhyme is refused', () => {
  assert.throws(() => compareRhymeToCache([{ other: 'shape' }, { other: 'shape' }]), /four-pillar audit/);
});
