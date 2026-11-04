import assert from 'node:assert/strict';
import test from 'node:test';
import { createTemplateCatalog } from '../../../src/engine/rhyming/catalog.mjs';
import { explainRoute, rankPartialRhymes, rhymeScore, routeBySignature, structuralDistance } from '../../../src/engine/rhyming/route.mjs';

test('distance is zero for the same structure and grows as it departs', () => {
  assert.equal(structuralDistance({ a: 1, b: '' }, { a: 9, b: 'x' }), 0);
  assert.ok(structuralDistance({ a: 1, b: 2 }, { a: 1, c: 2 }) > 0);
  assert.equal(structuralDistance(null, {}), 1);
  assert.equal(structuralDistance(null, null), 0);
  assert.equal(structuralDistance([], {}), 1);
  assert.equal(structuralDistance([], [1]), 0.75);
});

test('a score is one for a rhyme and between zero and one otherwise', () => {
  assert.equal(rhymeScore({ a: 1 }, { a: 2 }), 1);
  const partial = rhymeScore({ a: 1, b: 2 }, { a: 1, c: 2 });
  assert.ok(partial > 0 && partial < 1);
});

test('ranking scores only the candidates it is given, best first, up to the limit', () => {
  const candidates = [{ id: 'near', pattern: { a: 1, b: 2 } }, { id: 'exact', pattern: { a: 1 } }, { id: 'far', pattern: { z: [] } }];
  const ranked = rankPartialRhymes({ a: 5 }, candidates, { limit: 2 });
  assert.deepEqual(ranked.map((r) => r.id), ['exact', 'near']);
  assert.equal(ranked[0].exact, true);
});

test('routing uses the catalog, and falls back for a catalog with no router', () => {
  const catalog = createTemplateCatalog();
  catalog.register({ id: 't', pattern: { a: 1 } });
  assert.equal(routeBySignature({ a: 2 }, catalog).id, 't');
  const older = { findMatch: () => ({ id: 'old' }), size: () => 3 };
  assert.deepEqual(routeBySignature({}, older).mode, 'linear_fallback');
  assert.equal(routeBySignature({}, older).id, 'old');
  assert.equal(routeBySignature({}, { findMatch: () => null, size: () => 0 }).id, null);
});

test('an explanation names the hit, and says when there is none', () => {
  assert.equal(explainRoute(null).ok, false);
  assert.equal(explainRoute({ id: 't', score: 1, exact: true, mode: 'exact', compares: 1, bucketSize: 1, candidates: [] }).id, 't');
});
