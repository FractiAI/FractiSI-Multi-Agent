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
