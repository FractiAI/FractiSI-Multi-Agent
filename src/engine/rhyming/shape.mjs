/**
 * Shape comparison for Rhyming Templates. A recursive structural signature is a
 * prefilter, and `shapesRhyme` confirms the same keys and the same kinds of values.
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
