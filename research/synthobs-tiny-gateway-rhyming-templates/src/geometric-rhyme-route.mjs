/**
 * Geometric / structural rhyme routing — signature buckets + scored partials.
 *
 * Not semantic retrieval. Not a full pairwise rhyme matrix.
 * Not hexagon–circle Soft Story geometry.
 */
import { structuralSignature, shapesRhyme } from './rhyming-template.mjs';

/** Key-set Jaccard + nested kind agreement − depth mismatch penalty. */
export function structuralDistance(a, b, depth = 0) {
  if (a === null || b === null) return a === b ? 0 : 1;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return 1;
    if (a.length === 0 && b.length === 0) return 0;
    if (a.length === 0 || b.length === 0) return 0.75;
    return structuralDistance(a[0], b[0], depth + 1);
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return typeof a === typeof b ? 0 : 1;
  }
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  const aSet = new Set(ak);
  const bSet = new Set(bk);
  let inter = 0;
  for (const k of aSet) if (bSet.has(k)) inter += 1;
  const union = new Set([...ak, ...bk]).size || 1;
  const jaccard = inter / union;
  let kindAgree = 0;
  let kindN = 0;
  for (const k of aSet) {
    if (!bSet.has(k)) continue;
    kindN += 1;
    const d = structuralDistance(a[k], b[k], depth + 1);
    kindAgree += 1 - d;
  }
  const kindScore = kindN ? kindAgree / kindN : 0;
  const depthPenalty = Math.min(0.15, depth * 0.01);
  // distance in [0,1]: 0 = identical structure
  return Math.min(1, Math.max(0, 1 - 0.55 * jaccard - 0.45 * kindScore + depthPenalty));
}

export function rhymeScore(pattern, shape) {
  if (shapesRhyme(pattern, shape)) return 1;
  return Math.max(0, 1 - structuralDistance(pattern, shape));
}

/**
 * Rank candidates without expanding an N×N pairwise matrix —
 * score only the provided candidate list against the query shape.
 */
export function rankPartialRhymes(shape, candidates, { limit = 5 } = {}) {
  const ranked = candidates
    .map((t) => ({
      id: t.id,
      score: rhymeScore(t.pattern, shape),
      exact: shapesRhyme(t.pattern, shape),
      structuralSignature: t.structuralSignature || structuralSignature(t.pattern),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return ranked.slice(0, limit);
}

export function explainRoute(hit) {
  if (!hit) return { ok: false, reason: 'no_hit' };
  return {
    ok: true,
    id: hit.id,
    score: hit.score,
    exact: hit.exact === true,
    mode: hit.mode,
    compares: hit.compares,
    bucketSize: hit.bucketSize,
    candidates: hit.candidates,
  };
}

/**
 * Route by signature prefilter then shapesRhyme confirm.
 * @param {object} catalog - createTemplateCatalog() instance (needs routeTemplate or findMatch+all)
 */
export function routeBySignature(shape, catalog, opts = {}) {
  if (typeof catalog.routeTemplate === 'function') {
    return catalog.routeTemplate(shape, opts);
  }
  // Fallback for older catalogs: linear findMatch
  const hit = catalog.findMatch(shape);
  return {
    id: hit?.id ?? null,
    score: hit ? 1 : 0,
    exact: Boolean(hit),
    mode: 'linear_fallback',
    compares: catalog.size?.() ?? null,
    bucketSize: catalog.size?.() ?? null,
    candidates: hit ? [{ id: hit.id, score: 1, exact: true }] : [],
  };
}
