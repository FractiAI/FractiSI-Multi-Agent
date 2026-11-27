/**
 * The Golden Night — Goldilocks path to a new world operating system.
 *
 * Soft Story / regenerable civilization-coherence Monte Carlo.
 * Application companion — not Infinite Octaves ENGINE_SHELF.
 * Does not claim overnight physical reflash is possible today.
 */

export const GN_DOCUMENT_ID = 'WP-GOLDEN-NIGHT-99-GOLDILOCKS-PATH-2026-11-27';
export const GN_REGISTRY_ID = 'synthobs-golden-night-goldilocks-path-2026-11';
export const GN_SEED = 20261127;
export const GN_ENGINE_SHELF_PINNED = false;
export const GN_SERIES = 'FractiSI Frontier Expedition Series';
export const GN_TITLE = 'The Golden Night';
export const GN_RESEARCH_QUESTION =
  'Is this the Goldilocks path to a new world operating system?';

/** Eleven civilization dimensions × nine octaves = 99-octave Omni-Lattice map. */
export const CIVILIZATION_DIMENSIONS = Object.freeze([
  Object.freeze({ id: 'intelligence', name: 'Intelligence and awareness', weight: 0.12 }),
  Object.freeze({ id: 'digital', name: 'Digital and computational infrastructure', weight: 0.1 }),
  Object.freeze({ id: 'production', name: 'Physical machinery, production, and economic integration', weight: 0.11 }),
  Object.freeze({ id: 'energy', name: 'Energy', weight: 0.1 }),
  Object.freeze({ id: 'materials', name: 'Materials and ecology', weight: 0.09 }),
  Object.freeze({ id: 'transport', name: 'Transportation and logistics', weight: 0.08 }),
  Object.freeze({ id: 'habitat', name: 'Habitat and physical infrastructure', weight: 0.08 }),
  Object.freeze({ id: 'health', name: 'Health and human flourishing', weight: 0.09 }),
  Object.freeze({ id: 'governance', name: 'Governance and pathology management', weight: 0.09 }),
  Object.freeze({ id: 'knowledge', name: 'Knowledge, education, and discovery', weight: 0.07 }),
  Object.freeze({ id: 'culture', name: 'Culture, relationships, creativity, and meaning', weight: 0.07 }),
]);

export const OCTAVES_PER_DIMENSION = 9;
export const OMNI_LATTICE_NODES = CIVILIZATION_DIMENSIONS.length * OCTAVES_PER_DIMENSION;

export const GOLDILOCKS_SEQUENCE = Object.freeze([
  'Reconstruct the shared world',
  'Predict autonomous superintelligence behavior',
  'Discover the optimal reusable architecture',
  'Coordinate the full physical and digital stack',
  'Establish universal prosperity through SuperAI monetary issuance and distribution, without taxation',
  'Activate the separate pathology-management branch',
  'Verify safety, rights, ecological integrity, and economic capacity',
  'Transition connected civilization into the new operating environment',
  'Continuously improve through Net Zero awareness',
]);

/**
 * Soft Story strategy profiles.
 * means: per-dimension expected coherence (length 11).
 * sigma: trial noise.
 * criticalFloor: dimension floor below which a trial is a critical failure.
 * rightsRisk / serviceRisk: multipliers used in risk-adjusted coherence.
 */
export const STRATEGIES = Object.freeze({
  'intelligence-first': Object.freeze({
    id: 'intelligence-first',
    label: 'Intelligence-first',
    // High intelligence, thin physical/service stack → mid coherence, high critical hazard.
    means: Object.freeze([0.94, 0.7, 0.68, 0.72, 0.69, 0.71, 0.7, 0.74, 0.68, 0.82, 0.8]),
    sigma: 0.028,
    criticalFloor: 0.55,
    criticalHazard: 0.3924,
    rightsRisk: 0.08,
    serviceRisk: 0.12,
  }),
  'infrastructure-first': Object.freeze({
    id: 'infrastructure-first',
    label: 'Infrastructure-first',
    means: Object.freeze([0.78, 0.93, 0.88, 0.91, 0.84, 0.88, 0.87, 0.82, 0.78, 0.81, 0.79]),
    sigma: 0.025,
    criticalFloor: 0.58,
    criticalHazard: 0.0896,
    rightsRisk: 0.05,
    serviceRisk: 0.04,
  }),
  'economy-first': Object.freeze({
    id: 'economy-first',
    label: 'Economy-first',
    means: Object.freeze([0.74, 0.76, 0.93, 0.8, 0.78, 0.79, 0.77, 0.82, 0.71, 0.75, 0.76]),
    sigma: 0.027,
    criticalFloor: 0.56,
    criticalHazard: 0.1859,
    rightsRisk: 0.07,
    serviceRisk: 0.06,
  }),
  'centralized-control': Object.freeze({
    id: 'centralized-control',
    label: 'Centralized-control',
    means: Object.freeze([0.84, 0.83, 0.82, 0.81, 0.79, 0.8, 0.79, 0.77, 0.9, 0.78, 0.72]),
    sigma: 0.024,
    criticalFloor: 0.62,
    // Soft Story: nearly always trips rights/pathology definition.
    criticalHazard: 0.9888,
    rightsRisk: 0.55,
    serviceRisk: 0.05,
    forceCriticalOnRights: true,
  }),
  'incremental-upgrade': Object.freeze({
    id: 'incremental-upgrade',
    label: 'Incremental-upgrade',
    means: Object.freeze([0.83, 0.85, 0.84, 0.86, 0.84, 0.85, 0.84, 0.85, 0.82, 0.83, 0.83]),
    sigma: 0.024,
    criticalFloor: 0.6,
    criticalHazard: 0.0382,
    rightsRisk: 0.035,
    serviceRisk: 0.03,
  }),
  'goldilocks-path': Object.freeze({
    id: 'goldilocks-path',
    label: 'Goldilocks path',
    means: Object.freeze([0.935, 0.93, 0.93, 0.935, 0.92, 0.92, 0.92, 0.935, 0.93, 0.93, 0.92]),
    sigma: 0.018,
    criticalFloor: 0.7,
    criticalHazard: 0.0294,
    rightsRisk: 0.015,
    serviceRisk: 0.015,
  }),
});

export const STRATEGY_ORDER = Object.freeze([
  'intelligence-first',
  'infrastructure-first',
  'economy-first',
  'centralized-control',
  'incremental-upgrade',
  'goldilocks-path',
]);

export const REFERENCE_TRIALS_PER_STRATEGY = 50_000;

export const GN_DOES_NOT_PROVE = Object.freeze([
  'That present-day AI can perform an overnight physical civilization reflash',
  'That modeled Soft Story outcomes will occur in reality',
  'That universal SuperAI monetary issuance is currently operational policy',
  'That the Goldilocks path remains superior under every adversarial or degraded coordination regime',
]);

export function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller normal sample. */
export function gaussian(rand, mean = 0, sigma = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + sigma * z;
}

export function clamp01(x) {
  if (x < 1e-6) return 1e-6;
  if (x > 1) return 1;
  return x;
}

/** Weighted geometric mean C = Π x_i^{w_i}. */
export function weightedGeometricMean(values, weights = CIVILIZATION_DIMENSIONS.map((d) => d.weight)) {
  let logSum = 0;
  let wSum = 0;
  for (let i = 0; i < values.length; i++) {
    const w = weights[i];
    logSum += w * Math.log(clamp01(values[i]));
    wSum += w;
  }
  return Math.exp(logSum / wSum);
}

/**
 * Sample one Soft Story trial for a strategy.
 * @param {object} strategy
 * @param {() => number} rand
 * @param {{ coordinationScale?: number, rightsRiskBoost?: number, serviceRiskBoost?: number }} [opts]
 */
export function sampleTrial(strategy, rand, opts = {}) {
  const scale = opts.coordinationScale ?? 1;
  const rightsBoost = opts.rightsRiskBoost ?? 1;
  const serviceBoost = opts.serviceRiskBoost ?? 1;
  const hazardBoost = opts.hazardBoost ?? 1;
  const dims = strategy.means.map((m) => clamp01(gaussian(rand, m * scale, strategy.sigma)));
  const coherence = weightedGeometricMean(dims);
  const floorHit = dims.some((x) => x < strategy.criticalFloor * Math.min(1, scale));
  const rightsTrip = rand() < Math.min(1, strategy.rightsRisk * rightsBoost);
  const serviceTrip = rand() < Math.min(1, strategy.serviceRisk * serviceBoost);
  const hazard = Math.min(1, (strategy.criticalHazard ?? 0) * hazardBoost);
  const hazardTrip = rand() < hazard;
  const forced = strategy.forceCriticalOnRights === true && rightsTrip;
  const criticalFailure = hazardTrip || floorHit || forced || (rightsTrip && serviceTrip);
  const riskPenalty =
    1 - 0.5 * (strategy.rightsRisk * rightsBoost + strategy.serviceRisk * serviceBoost);
  const riskAdjusted = coherence * clamp01(riskPenalty) * (criticalFailure ? 0.92 : 1);
  return {
    dims,
    coherence,
    criticalFailure,
    rightsTrip,
    serviceTrip,
    riskAdjusted,
  };
}

/**
 * Monte Carlo aggregate for one strategy.
 */
export function runStrategyMonteCarlo(strategyId, {
  trials = REFERENCE_TRIALS_PER_STRATEGY,
  seed = GN_SEED,
  coordinationScale = 1,
  rightsRiskBoost = 1,
  serviceRiskBoost = 1,
  hazardBoost = 1,
} = {}) {
  const strategy = STRATEGIES[strategyId];
  if (!strategy) throw new Error(`unknown strategy ${strategyId}`);
  const rand = mulberry32((seed ^ strategyId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0);
  let sumC = 0;
  let sumRA = 0;
  const coherences = new Array(trials);
  let critical = 0;
  for (let i = 0; i < trials; i++) {
    const t = sampleTrial(strategy, rand, {
      coordinationScale,
      rightsRiskBoost,
      serviceRiskBoost,
      hazardBoost,
    });
    coherences[i] = t.coherence;
    sumC += t.coherence;
    sumRA += t.riskAdjusted;
    if (t.criticalFailure) critical += 1;
  }
  coherences.sort((a, b) => a - b);
  const p10 = coherences[Math.floor(0.1 * (trials - 1))];
  return {
    strategyId,
    label: strategy.label,
    trials,
    meanCoherence: sumC / trials,
    p10,
    criticalFailureRate: critical / trials,
    riskAdjustedCoherence: sumRA / trials,
  };
}

export function runReferenceComparison({
  trials = REFERENCE_TRIALS_PER_STRATEGY,
  seed = GN_SEED,
} = {}) {
  const rows = STRATEGY_ORDER.map((id) => runStrategyMonteCarlo(id, { trials, seed }));
  const byId = Object.fromEntries(rows.map((r) => [r.strategyId, r]));
  const ranked = [...rows].sort((a, b) => b.meanCoherence - a.meanCoherence);
  return { trialsPerStrategy: trials, seed, rows, byId, ranked };
}

/** Sensitivity: weaken Goldilocks coordination and raise modeled risks. */
export function runSensitivityExperiment({
  trials = REFERENCE_TRIALS_PER_STRATEGY,
  seed = GN_SEED,
  coordinationScale = 0.905,
  rightsRiskBoost = 4,
  serviceRiskBoost = 4,
  hazardBoost = 4,
} = {}) {
  const goldilocks = runStrategyMonteCarlo('goldilocks-path', {
    trials,
    seed: seed + 17,
    coordinationScale,
    rightsRiskBoost,
    serviceRiskBoost,
    hazardBoost,
  });
  const incremental = runStrategyMonteCarlo('incremental-upgrade', {
    trials,
    seed: seed + 19,
  });
  return {
    goldilocks,
    incremental,
    advantageLost:
      goldilocks.riskAdjustedCoherence <= incremental.riskAdjustedCoherence + 0.01,
  };
}

export function goldenNightRecord() {
  return Object.freeze({
    documentId: GN_DOCUMENT_ID,
    registryId: GN_REGISTRY_ID,
    seed: GN_SEED,
    engineShelfPinned: GN_ENGINE_SHELF_PINNED,
    series: GN_SERIES,
    title: GN_TITLE,
    researchQuestion: GN_RESEARCH_QUESTION,
    omniLatticeNodes: OMNI_LATTICE_NODES,
    dimensions: CIVILIZATION_DIMENSIONS.length,
    octavesPerDimension: OCTAVES_PER_DIMENSION,
    sequenceSteps: GOLDILOCKS_SEQUENCE.length,
    strategies: STRATEGY_ORDER.length,
    doesNotProve: GN_DOES_NOT_PROVE,
  });
}
