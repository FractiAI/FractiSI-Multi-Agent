/**
 * Shape comparison for Rhyming Templates: the same keys holding the same kinds
 * of values. Not superficial string equality.
 */
export function shapeKeysMatch(pattern, shape) {
  const pk = Object.keys(pattern).sort();
  const sk = Object.keys(shape).sort();
  if (pk.length !== sk.length) return false;
  for (let i = 0; i < pk.length; i++) {
    if (pk[i] !== sk[i]) return false;
    if (typeof pattern[pk[i]] !== typeof shape[sk[i]]) return false;
  }
  return true;
}
