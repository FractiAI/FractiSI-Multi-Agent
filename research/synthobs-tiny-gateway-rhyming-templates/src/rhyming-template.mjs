/**
 * Rhyming Template engine — reusable organizational patterns + expression deltas.
 */
export function createTemplateCatalog() {
  /** @type {Map<string, object>} */
  const templates = new Map();
  return {
    register(template) {
      if (!template?.id || !template?.pattern) throw new Error('invalid template');
      templates.set(template.id, Object.freeze({ ...template }));
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
    /** Structural match: same pattern keys + types (not superficial string equality). */
    findMatch(shape) {
      for (const t of templates.values()) {
        if (shapeKeysMatch(t.pattern, shape)) return t;
      }
      return null;
    },
    all() {
      return [...templates.values()];
    },
  };
}

function shapeKeysMatch(pattern, shape) {
  const pk = Object.keys(pattern).sort();
  const sk = Object.keys(shape).sort();
  if (pk.length !== sk.length) return false;
  for (let i = 0; i < pk.length; i++) {
    if (pk[i] !== sk[i]) return false;
    if (typeof pattern[pk[i]] !== typeof shape[sk[i]]) return false;
  }
  return true;
}

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

export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
