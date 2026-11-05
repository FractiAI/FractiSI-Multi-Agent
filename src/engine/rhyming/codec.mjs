/**
 * Expression codec: an expression is a template reference plus a nested field-level
 * delta, with optional separate state. Encoding refuses an expression that does not
 * rhyme with its template, and a field missing from an expression is recorded as a
 * tombstone, so reconstruction is exact.
 */
import { shapesRhyme } from './shape.mjs';

/** JSON-text equality; sensitive to key order, so it can only err toward false negatives. */
export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
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

/**
 * @param {unknown} base
 * @param {unknown} delta
 * @param {{ clone?: boolean }} [opts] - `clone: false` shares template object identity
 *   (fast path for read/serialize). Default `true` keeps reconstructed values independent.
 */
export function mergeDelta(base, delta, opts = {}) {
  const clone = opts.clone !== false;
  const copy = (value) => (clone ? structuredClone(value) : value);
  if (delta === undefined) return copy(base);
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
    const out = clone ? structuredClone(base) : { ...base };
    for (const k of Object.keys(delta)) {
      const merged = mergeDelta(base[k], delta[k], opts);
      if (merged === undefined && delta[k] && delta[k].__missing) {
        delete out[k];
      } else {
        out[k] = merged;
      }
    }
    return out;
  }
  return copy(delta);
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

/**
 * Reconstruct organizational value only (state is returned separately when present).
 * @param {{ clone?: boolean }} [opts] - default clone true; pass `clone: false` when the
 *   caller will only read or immediately serialize (avoids the structuredClone tax Daniel measured).
 */
export function reconstructExpression(catalog, encoded, opts = {}) {
  const t = catalog.get(encoded.templateId);
  if (!t) throw new Error(`missing template ${encoded.templateId}`);
  return mergeDelta(t.pattern, encoded.delta || {}, opts);
}

export function reconstructExpressionWithState(catalog, encoded, opts = {}) {
  const clone = opts.clone !== false;
  return {
    value: reconstructExpression(catalog, encoded, opts),
    state: encoded.state != null ? (clone ? structuredClone(encoded.state) : encoded.state) : null,
  };
}
