import { createTemplateCatalog } from '../engine/rhyming/catalog.mjs';
import { rhymeScore } from '../engine/rhyming/route.mjs';

/**
 * K · Dynamic structural signature routing (companion meter — not in H pin).
 * Signature-bucket route vs naïve linear scan; false-match reject; partial rank.
 */
export function experimentK_dynamicRoute() {
  const catalog = createTemplateCatalog({ requireUniqueSignature: true });
  const patterns = [
    { id: 'tpl_a', pattern: { kind: 'rec', schema: 'a', id: 0, name: '' } },
    { id: 'tpl_b', pattern: { kind: 'rec', schema: 'b', role: '', dept: '' } },
    { id: 'tpl_c', pattern: { kind: 'event', type: 'x', ts: 0, payload: { n: 0 } } },
    { id: 'tpl_d', pattern: { kind: 'msg', from: '', to: '', body: '' } },
    { id: 'tpl_e', pattern: { kind: 'node', octave: 0, children: [], cross: [] } },
  ];
  for (const p of patterns) catalog.register(p);

  // Linear baseline compares = catalog size per query
  const queries = [
    { kind: 'rec', schema: 'a', id: 7, name: 'u7' },
    { kind: 'event', type: 'x', ts: 9, payload: { n: 1 } },
    { kind: 'msg', from: 'a', to: 'b', body: 'hi' },
  ];
  let linearCompares = 0;
  let bucketCompares = 0;
  let exactHits = 0;
  for (const q of queries) {
    linearCompares += catalog.size();
    const route = catalog.routeTemplate(q, { mode: 'exact' });
    bucketCompares += route.compares;
    if (route.id && route.exact) exactHits += 1;
  }

  // Colliding signatures under requireUniqueSignature=false → exact returns null
  const amb = createTemplateCatalog({ requireUniqueSignature: false });
  amb.register({ id: 'c1', pattern: { k: 'same', v: 1 } });
  amb.register({ id: 'c2', pattern: { k: 'same', v: 2 } });
  const ambRoute = amb.routeTemplate({ k: 'same', v: 3 }, { mode: 'exact' });
  const falseMatchRejected = ambRoute.id === null && ambRoute.candidates.length >= 2;

  // Partial rank without full matrix: score only bucket/pool
  const best = catalog.routeTemplate({ kind: 'rec', schema: 'a', id: 1, name: 'x' }, { mode: 'best', maxCandidates: 3 });
  const partialOk = best.candidates.length <= 3 && best.score >= 0.5;

  const bucketCheaper = bucketCompares < linearCompares;
  const pass = exactHits === queries.length && falseMatchRejected && partialOk && bucketCheaper;

  return {
    id: 'K_dynamic_route',
    title: 'Dynamic structural signature routing (bucket ≪ linear · false-match reject)',
    linearCompares,
    bucketCompares,
    exactHits,
    falseMatchRejected,
    partialTopScore: best.score,
    candidateCap: best.candidates.length,
    rhymeScoreSample: rhymeScore(patterns[0].pattern, queries[0]),
    pass,
    honesty:
      'Structural signature routing + scored partial rhyme — not semantic search, not full pairwise matrix expansion, not automatic discovery without false-match controls.',
  };
}
