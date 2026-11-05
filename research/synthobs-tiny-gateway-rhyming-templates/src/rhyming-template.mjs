/**
 * Rhyming Template engine — organizational patterns + nested expression deltas.
 *
 * Structural eligibility (recursive signature) is a prefilter only.
 * Holographic rhyme (four pillars) is audited by holographic-rhyme-gate.mjs.
 * Exact-text identity and prefix-cache reuse are contrast mechanisms, not rhymes.
 */
export function structuralSignature(value, depth = 0) {
  if (depth > 12) return '…';
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    const inner = value.length ? structuralSignature(value[0], depth + 1) : '';
    return `array<${inner}>`;
  }
  const t = typeof value;
  if (t !== 'object') return t;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${k}:${structuralSignature(value[k], depth + 1)}`).join(',')}}`;
}

/** Recursive organization match: same keys and same structural kinds (not typeof conflation). */
export function shapesRhyme(pattern, shape) {
  if (pattern === null || shape === null) return pattern === shape;
  if (Array.isArray(pattern) || Array.isArray(shape)) {
    if (!Array.isArray(pattern) || !Array.isArray(shape)) return false;
    // Arrays rhyme structurally when element kinds rhyme (compare first elems / empty).
    if (pattern.length === 0 && shape.length === 0) return true;
    if (pattern.length === 0 || shape.length === 0) return false;
    return shapesRhyme(pattern[0], shape[0]);
  }
  if (typeof pattern !== 'object' || typeof shape !== 'object') {
    return typeof pattern === typeof shape;
  }
  const pk = Object.keys(pattern).sort();
  const sk = Object.keys(shape).sort();
  if (pk.length !== sk.length) return false;
  for (let i = 0; i < pk.length; i++) {
    if (pk[i] !== sk[i]) return false;
    if (!shapesRhyme(pattern[pk[i]], shape[sk[i]])) return false;
  }
  return true;
}

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

/** Lazy import avoid cycle — geometric-rhyme-route imports structuralSignature from here. */
function requireScore() {
  // Inline minimal score to keep catalog self-contained for exact path;
  // best mode uses dynamic import sync via cached module.
  if (!requireScore._mod) {
    // Synchronous ESM pattern: duplicate tiny score using shapesRhyme + key overlap
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

/** Deep field-level delta: nested plain objects merge; arrays/leaves replace. */
export function diffDelta(base, expr) {
  if (deepEqual(base, expr)) return undefined;
  if (
    base &&
    expr &&
    typeof base === 'object' &&
    typeof expr === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(expr) &&
    base !== null &&
    expr !== null
  ) {
    const delta = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(expr)]);
    for (const k of keys) {
      if (!(k in expr)) {
        delta[k] = { __missing: true };
        continue;
      }
      if (!(k in base)) {
        delta[k] = structuredClone(expr[k]);
        continue;
      }
      const d = diffDelta(base[k], expr[k]);
      if (d !== undefined) delta[k] = d;
    }
    return Object.keys(delta).length ? delta : undefined;
  }
  return structuredClone(expr);
}

export function mergeDelta(base, delta) {
  if (delta === undefined) return structuredClone(base);
  if (delta && typeof delta === 'object' && delta.__missing === true) return undefined;
  if (
    base &&
    delta &&
    typeof base === 'object' &&
    typeof delta === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(delta) &&
    base !== null &&
    delta !== null &&
    !Array.isArray(delta)
  ) {
    // Leaf replace when delta is a typed leaf container? Plain object → deep merge.
    const out = structuredClone(base);
    for (const k of Object.keys(delta)) {
      const merged = mergeDelta(base[k], delta[k]);
      if (merged === undefined && delta[k] && delta[k].__missing) {
        delete out[k];
      } else {
        out[k] = merged;
      }
    }
    return out;
  }
  return structuredClone(delta);
}

/**
 * Expression = templateRef + nested delta (+ optional separate state).
 * encodeExpression refuses extra/missing top-level keys vs pattern (agree with findMatch).
 */
export function encodeExpression(templateId, basePattern, expression, state = null) {
  if (!shapesRhyme(basePattern, expression)) {
    throw new Error(`expression does not rhyme with template ${templateId}`);
  }
  const delta = diffDelta(basePattern, expression) || {};
  const out = { templateId, delta };
  if (state != null) out.state = state;
  return out;
}

/** Reconstruct organizational value only (state is returned separately when present). */
export function reconstructExpression(catalog, encoded) {
  const t = catalog.get(encoded.templateId);
  if (!t) throw new Error(`missing template ${encoded.templateId}`);
  return mergeDelta(t.pattern, encoded.delta || {});
}

export function reconstructExpressionWithState(catalog, encoded) {
  return {
    value: reconstructExpression(catalog, encoded),
    state: encoded.state != null ? structuredClone(encoded.state) : null,
  };
}

export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
