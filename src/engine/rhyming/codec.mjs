/**
 * Expression codec: an expression is a template reference plus a delta of field
 * overrides and optional state.
 *
 * Known limit: the delta records overrides only, so an expression that omits a
 * key the pattern defines reconstructs with that key present. Shape matching
 * (`catalog.findMatch`) excludes such expressions; direct callers must not pass
 * them. `tests/engine/rhyming/codec.test.mjs` pins this behaviour.
 */

/** Expression = templateRef + delta (field overrides) + state */
export function encodeExpression(templateId, basePattern, expression, state = null) {
  const delta = {};
  for (const k of Object.keys(expression)) {
    if (JSON.stringify(expression[k]) !== JSON.stringify(basePattern[k])) {
      delta[k] = expression[k];
    }
  }
  const out = { templateId, delta };
  if (state != null) out.state = state;
  return out;
}

export function reconstructExpression(catalog, encoded) {
  const t = catalog.get(encoded.templateId);
  if (!t) throw new Error(`missing template ${encoded.templateId}`);
  return {
    ...structuredClone(t.pattern),
    ...structuredClone(encoded.delta || {}),
    ...(encoded.state ? { __state: structuredClone(encoded.state) } : {}),
  };
}

/** JSON-text equality; sensitive to key order, so it can only err toward false negatives. */
export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
