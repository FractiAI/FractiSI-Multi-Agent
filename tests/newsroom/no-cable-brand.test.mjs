/**
 * Player 1 lock: FGC keeps wire-service voice and never names the cable network brand.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CABLE_BRAND,
  CABLE_BRAND_RE,
  CABLE_BRAND_SCAN_ROOTS,
  findCableBrandHits,
} from '../../src/newsroom/no-cable-brand.mjs';

test('cable brand constant is four letters without a contiguous literal', () => {
  assert.equal(CABLE_BRAND.length, 4);
  assert.equal(CABLE_BRAND_RE.test(CABLE_BRAND), true);
  assert.ok(CABLE_BRAND_SCAN_ROOTS.includes('content/blog'));
  assert.ok(CABLE_BRAND_SCAN_ROOTS.includes('src/newsroom'));
});

test('FGC surfaces never name the cable network brand', () => {
  const hits = findCableBrandHits();
  assert.deepEqual(hits, [], `brand name found in: ${hits.join(', ')}`);
});
