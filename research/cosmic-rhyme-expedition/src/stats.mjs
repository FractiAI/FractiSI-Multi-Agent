/** Small regenerable stats helpers. */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace(arr, rnd) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
}

export function quantile(xs, q) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return 0;
  const i = (s.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return s[lo];
  return s[lo] * (hi - i) + s[hi] * (i - lo);
}

export function bootstrapCi(deltas, alpha = 0.05) {
  return {
    low: quantile(deltas, alpha / 2),
    high: quantile(deltas, 1 - alpha / 2),
    mean: mean(deltas),
  };
}

/** Benjamini–Hochberg FDR. Returns set of indices that survive. */
export function bhSurvive(pValues, q = 0.1) {
  const indexed = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const m = indexed.length;
  let maxK = -1;
  for (let k = 0; k < m; k += 1) {
    if (indexed[k].p <= ((k + 1) / m) * q) maxK = k;
  }
  const keep = new Set();
  for (let k = 0; k <= maxK; k += 1) keep.add(indexed[k].i);
  return keep;
}

export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i += 1) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}
