/**
 * Rhyming Template catalog: patterns frozen on registration, indexed by structural
 * signature, and routed by signature bucket with a `shapesRhyme` confirmation.
 * Two templates with one signature are refused unless the caller opts out.
 */
import { shapesRhyme, structuralSignature } from './shape.mjs';

export function createTemplateCatalog(options = {}) {
  /** @type {Map<string, object>} */
  const templates = new Map();
  /** @type {Map<string, string[]>} signature → template ids */
  const signatureIndex = new Map();
  const requireUniqueSignature = options.requireUniqueSignature !== false;

  function indexAdd(sig, id) {
    const list = signatureIndex.get(sig) || [];
    if (!list.includes(id)) list.push(id);
    signatureIndex.set(sig, list);
  }

  function indexRemove(sig, id) {
    const list = signatureIndex.get(sig);
    if (!list) return;
    const next = list.filter((x) => x !== id);
    if (next.length) signatureIndex.set(sig, next);
    else signatureIndex.delete(sig);
  }

  return {
    register(template) {
      if (!template?.id || !template?.pattern) throw new Error('invalid template');
      if (template.rhymePass === false) {
        throw new Error(`template ${template.id} failed holographic rhyme audit`);
      }
      const sig = structuralSignature(template.pattern);
      if (requireUniqueSignature) {
        const collisions = signatureIndex.get(sig) || [];
        for (const otherId of collisions) {
          if (otherId !== template.id) {
            throw new Error(
              `false_match_risk: template ${template.id} collides with ${otherId} on structural signature`,
            );
          }
        }
      }
      const prev = templates.get(template.id);
      if (prev?.structuralSignature) indexRemove(prev.structuralSignature, template.id);
      templates.set(
        template.id,
        Object.freeze({
          ...template,
          structuralSignature: sig,
        }),
      );
      indexAdd(sig, template.id);
      return template.id;
    },
    unregister(id) {
      const t = templates.get(id);
      if (!t) return false;
      indexRemove(t.structuralSignature, id);
      templates.delete(id);
      return true;
    },
    get(id) {
      return templates.get(id) || null;
    },
    has(id) {
      return templates.has(id);
    },
    size() {
      return templates.size;
    },
    signatureBucket(sig) {
      return [...(signatureIndex.get(sig) || [])];
    },
    /**
     * Find organizational match by recursive structural signature.
     * Ambiguous multi-matches return null (false-match rejection).
     * Uses signature-index prefilter (not a full N×N matrix).
     */
    findMatch(shape) {
      const route = this.routeTemplate(shape, { mode: 'exact' });
      if (!route.id) return null;
      return templates.get(route.id) || null;
    },
    /**
     * Dynamic structural routing: signature bucket → shapesRhyme confirm,
     * optional scored partials without pairwise matrix expansion.
     */
    routeTemplate(shape, { mode = 'exact', maxCandidates = 8 } = {}) {
      const sig = structuralSignature(shape);
      const bucketIds = signatureIndex.get(sig) || [];
      let compares = 0;
      const exactHits = [];
      for (const id of bucketIds) {
        const t = templates.get(id);
        if (!t) continue;
        compares += 1;
        if (shapesRhyme(t.pattern, shape)) exactHits.push(t);
      }
      if (mode === 'exact') {
        if (exactHits.length === 1) {
          return {
            id: exactHits[0].id,
            score: 1,
            exact: true,
            mode: 'exact',
            compares,
            bucketSize: bucketIds.length,
            candidates: [{ id: exactHits[0].id, score: 1, exact: true }],
          };
        }
        // Signature miss: optional linear exact scan only when bucket empty
        // (new shape keys not yet indexed under same sig) — still O(n) worst case,
        // but avoids N×N pairwise scoring.
        if (bucketIds.length === 0) {
          for (const t of templates.values()) {
            compares += 1;
            if (shapesRhyme(t.pattern, shape)) exactHits.push(t);
          }
          if (exactHits.length === 1) {
            return {
              id: exactHits[0].id,
              score: 1,
              exact: true,
              mode: 'exact_linear_fallback',
              compares,
              bucketSize: 0,
              candidates: [{ id: exactHits[0].id, score: 1, exact: true }],
            };
          }
        }
        return {
          id: null,
          score: 0,
          exact: false,
          mode: 'exact',
          compares,
          bucketSize: bucketIds.length,
          candidates: exactHits.map((t) => ({ id: t.id, score: 1, exact: true })),
        };
      }
      // best / partial: score bucket first; if empty, score up to maxCandidates from catalog
      const pool =
        bucketIds.length > 0
          ? bucketIds.map((id) => templates.get(id)).filter(Boolean)
          : [...templates.values()].slice(0, Math.max(maxCandidates * 2, 16));
      const { rhymeScore } = requireScore();
      const ranked = pool
        .map((t) => {
          compares += 1;
          return {
            id: t.id,
            score: rhymeScore(t.pattern, shape),
            exact: shapesRhyme(t.pattern, shape),
          };
        })
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, maxCandidates);
      const top = ranked[0] || null;
      return {
        id: top?.id ?? null,
        score: top?.score ?? 0,
        exact: top?.exact === true,
        mode: 'best',
        compares,
        bucketSize: bucketIds.length,
        candidates: ranked,
      };
    },
    all() {
      return [...templates.values()];
    },
  };
}

/** A small partial-rhyme score, kept here so the catalog needs nothing from the route module. */
function requireScore() {
  if (!requireScore._mod) {
    requireScore._mod = {
      rhymeScore(pattern, shape) {
        if (shapesRhyme(pattern, shape)) return 1;
        if (pattern == null || shape == null) return 0;
        if (typeof pattern !== 'object' || typeof shape !== 'object') {
          return typeof pattern === typeof shape ? 0.5 : 0;
        }
        if (Array.isArray(pattern) || Array.isArray(shape)) {
          return Array.isArray(pattern) && Array.isArray(shape) ? 0.5 : 0;
        }
        const pk = Object.keys(pattern);
        const sk = new Set(Object.keys(shape));
        let inter = 0;
        for (const k of pk) if (sk.has(k)) inter += 1;
        const union = new Set([...pk, ...sk]).size || 1;
        return inter / union;
      },
    };
  }
  return requireScore._mod;
}
