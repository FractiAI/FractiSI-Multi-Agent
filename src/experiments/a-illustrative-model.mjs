/** A: illustrative section 7 arithmetic. A hypothesis model, not a measurement. */

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

export function experimentA_illustrativeModel() {
  const m = illustrativeMemoryModel();
  const pass = Math.abs(m.reductionPct - 78.7) < 0.15 && Math.abs(m.nonWeightCutNeededPct - 94.12) < 0.2;
  return {
    id: 'A_illustrative_model',
    title: 'Illustrative 78.7% memory model arithmetic',
    ...m,
    pass,
    honesty: 'Architectural arithmetic only — not a measured DRAM/HBM result.',
  };
}
