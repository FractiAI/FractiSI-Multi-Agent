/**
 * Seeded mulberry32 generator. Every stochastic choice in the suite draws from
 * an explicit instance of this function, never from Math.random().
 *
 * @param {number} seed
 * @returns {() => number} generator of floats in [0, 1)
 */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle driven by a seeded generator; returns a new array.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {() => number} rng
 * @returns {T[]}
 */
export function shuffled(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
