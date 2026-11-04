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
  const requireUniqueSignature = options.requireUniqueSignature !== false;

  return {
    register(template) {
      if (!template?.id || !template?.pattern) throw new Error('invalid template');
      if (template.rhymePass === false) {
        throw new Error(`template ${template.id} failed holographic rhyme audit`);
      }
      const sig = structuralSignature(template.pattern);
      if (requireUniqueSignature) {
        for (const existing of templates.values()) {
          if (structuralSignature(existing.pattern) === sig && existing.id !== template.id) {
            throw new Error(
              `false_match_risk: template ${template.id} collides with ${existing.id} on structural signature`,
            );
          }
        }
      }
      templates.set(
        template.id,
        Object.freeze({
          ...template,
          structuralSignature: sig,
        }),
      );
      return template.id;
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
    /**
     * Find organizational match by recursive structural signature.
     * Ambiguous multi-matches return null (false-match rejection).
     */
    findMatch(shape) {
      const hits = [];
      for (const t of templates.values()) {
        if (shapesRhyme(t.pattern, shape)) hits.push(t);
      }
      if (hits.length === 1) return hits[0];
      return null;
    },
    all() {
      return [...templates.values()];
    },
  };
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
