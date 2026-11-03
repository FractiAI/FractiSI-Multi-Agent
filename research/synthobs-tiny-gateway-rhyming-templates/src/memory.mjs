/** Stable JSON byte size (UTF-8) as portable resident-representation proxy. */
export function bytesOf(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

export function reduction(baselineBytes, tinyBytes) {
  if (baselineBytes <= 0) return { ratio: 0, saved: 0 };
  const saved = baselineBytes - tinyBytes;
  return { ratio: saved / baselineBytes, saved, baselineBytes, tinyBytes };
}

/** Illustrative §7 model — architectural arithmetic, not a measurement. */
export function illustrativeMemoryModel() {
  const baseline = {
    weights: 0.15,
    kv: 0.35,
    activations: 0.1,
    caches: 0.2,
    duplicates: 0.2,
  };
  const remainFrac = {
    weights: 1.0,
    kv: 0.1,
    activations: 0.2,
    caches: 0.02,
    duplicates: 0.02,
  };
  const remaining =
    baseline.weights * remainFrac.weights +
    baseline.kv * remainFrac.kv +
    baseline.activations * remainFrac.activations +
    baseline.caches * remainFrac.caches +
    baseline.duplicates * remainFrac.duplicates;
  const reductionRatio = 1 - remaining;
  const nonWeight = 1 - baseline.weights;
  const nonWeightCutNeeded = 0.8 / nonWeight;
  return {
    remainingPct: remaining * 100,
    reductionPct: reductionRatio * 100,
    nonWeightCutNeededPct: nonWeightCutNeeded * 100,
    approaches80: Math.abs(reductionRatio - 0.787) < 0.001 || (reductionRatio >= 0.78 && reductionRatio < 0.8),
  };
}
