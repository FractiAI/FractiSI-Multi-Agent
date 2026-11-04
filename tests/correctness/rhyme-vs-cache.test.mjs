import assert from 'node:assert/strict';
import {
  compareRhymeToCache,
  differingWordSessions,
  identicalTextSessions,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rhyme-vs-cache.mjs';

const differing = compareRhymeToCache(differingWordSessions());
assert.equal(differing.equivalent, true);
assert.equal(differing.rhymeAuditPass, true);
assert.equal(differing.shapeHits, 40);
assert.equal(differing.exactTextHits, 0);
assert.equal(differing.cacheBytes, differing.naiveBytes);
assert.equal(differing.naiveBytes, 8064);
assert.equal(differing.rhymeBytes, 5554);
assert.ok(differing.rhymeBytes < differing.cacheBytes);

const identical = compareRhymeToCache(identicalTextSessions());
assert.equal(identical.equivalent, true);
assert.equal(identical.exactTextHits, 39);
assert.equal(identical.cacheBytes, 198);
assert.equal(identical.rhymeBytes, 5572);
assert.ok(identical.cacheBytes < identical.rhymeBytes);

console.log('rhyme vs cache ok');
