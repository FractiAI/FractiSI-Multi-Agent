/**
 * The Golden Night — Soft Story civilization-coherence expedition.
 * Regenerable Monte Carlo over six transition strategies on an 11-dimension
 * (99-octave) Omni-Lattice aggregate. Not a claim of overnight reflash.
 */
import {
  DOCUMENT_ID,
  REGISTRY_ID,
  SEED,
  ENGINE_SHELF_PINNED,
  SERIES,
  TITLE,
} from './constants.mjs';
import {
  CIVILIZATION_DIMENSIONS,
  GOLDILOCKS_SEQUENCE,
  OMNI_LATTICE_NODES,
  OCTAVES_PER_DIMENSION,
  REFERENCE_TRIALS_PER_STRATEGY,
  STRATEGY_ORDER,
  STRATEGIES,
  GN_DOES_NOT_PROVE,
  GN_RESEARCH_QUESTION,
  goldenNightRecord,
  runReferenceComparison,
  runSensitivityExperiment,
  weightedGeometricMean,
} from '../../../src/engine/rhyming/golden-night-goldilocks-path.mjs';

function exp(id, title, pass, detail, tier = 'simulated') {
  return { id, title, pass: Boolean(pass), detail, tier };
}

export function runGoldenNightSuite({
  trials = REFERENCE_TRIALS_PER_STRATEGY,
  seed = SEED,
} = {}) {
  const record = goldenNightRecord();

  const e1 = exp(
    'E1',
    '99-octave Omni-Lattice catalog (11×9)',
    OMNI_LATTICE_NODES === 99 &&
      CIVILIZATION_DIMENSIONS.length === 11 &&
      OCTAVES_PER_DIMENSION === 9,
    { nodes: OMNI_LATTICE_NODES, dimensions: CIVILIZATION_DIMENSIONS.length },
    'deterministic',
  );

  const e2 = exp(
    'E2',
    'Six competing transition strategies registered',
    STRATEGY_ORDER.length === 6 && STRATEGY_ORDER.every((id) => STRATEGIES[id]),
    { strategies: STRATEGY_ORDER },
    'deterministic',
  );

  const e3Means = CIVILIZATION_DIMENSIONS.map(() => 0.9);
  const geo = weightedGeometricMean(e3Means);
  const e3 = exp(
    'E3',
    'Weighted geometric mean coherence operator',
    Math.abs(geo - 0.9) < 1e-9,
    { C: geo },
    'deterministic',
  );

  const e4Seq = exp(
    'E4',
    'Goldilocks sequence has nine transition steps',
    GOLDILOCKS_SEQUENCE.length === 9,
    { steps: GOLDILOCKS_SEQUENCE.length },
    'deterministic',
  );

  const reference = runReferenceComparison({ trials, seed });
  const g = reference.byId['goldilocks-path'];
  const inc = reference.byId['incremental-upgrade'];
  const ctrl = reference.byId['centralized-control'];
  const intel = reference.byId['intelligence-first'];

  const e5 = exp(
    'E5',
    'Goldilocks path highest mean coherence in reference Monte Carlo',
    reference.ranked[0].strategyId === 'goldilocks-path' && g.meanCoherence > 0.9,
    {
      mean: g.meanCoherence,
      p10: g.p10,
      leader: reference.ranked[0].strategyId,
      table: reference.rows.map((r) => ({
        strategy: r.label,
        mean: Number(r.meanCoherence.toFixed(3)),
        p10: Number(r.p10.toFixed(3)),
        criticalFailurePct: Number((100 * r.criticalFailureRate).toFixed(2)),
        riskAdjusted: Number(r.riskAdjustedCoherence.toFixed(3)),
      })),
    },
    'simulated',
  );

  const minCritical = Math.min(...reference.rows.map((r) => r.criticalFailureRate));
  const e6 = exp(
    'E6',
    'Goldilocks path lowest critical-failure rate among six strategies',
    Math.abs(g.criticalFailureRate - minCritical) < 1e-12 &&
      g.criticalFailureRate < 0.05 &&
      g.criticalFailureRate > 0.01 &&
      ctrl.criticalFailureRate > 0.9 &&
      intel.criticalFailureRate > 0.3,
    {
      goldilocksCriticalPct: Number((100 * g.criticalFailureRate).toFixed(2)),
      centralizedCriticalPct: Number((100 * ctrl.criticalFailureRate).toFixed(2)),
      intelligenceCriticalPct: Number((100 * intel.criticalFailureRate).toFixed(2)),
    },
    'simulated',
  );

  const e7 = exp(
    'E7',
    'Risk-adjusted coherence favors Goldilocks over incremental-upgrade',
    g.riskAdjustedCoherence > inc.riskAdjustedCoherence + 0.05,
    {
      goldilocksRA: Number(g.riskAdjustedCoherence.toFixed(3)),
      incrementalRA: Number(inc.riskAdjustedCoherence.toFixed(3)),
    },
    'simulated',
  );

  const sensitivity = runSensitivityExperiment({ trials, seed });
  const e8 = exp(
    'E8',
    'Sensitivity: weakened Goldilocks loses risk-adjusted advantage',
    sensitivity.advantageLost === true &&
      sensitivity.goldilocks.riskAdjustedCoherence < g.riskAdjustedCoherence - 0.05,
    {
      weakenedRA: Number(sensitivity.goldilocks.riskAdjustedCoherence.toFixed(3)),
      incrementalRA: Number(sensitivity.incremental.riskAdjustedCoherence.toFixed(3)),
      advantageLost: sensitivity.advantageLost,
    },
    'simulated',
  );

  const experiments = [e1, e2, e3, e4Seq, e5, e6, e7, e8];
  const passCount = experiments.filter((e) => e.pass).length;
  return {
    documentId: DOCUMENT_ID,
    registryId: REGISTRY_ID,
    series: SERIES,
    title: TITLE,
    researchQuestion: GN_RESEARCH_QUESTION,
    seed,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    trialsPerStrategy: trials,
    totalTrials: trials * STRATEGY_ORDER.length,
    omniLatticeNodes: OMNI_LATTICE_NODES,
    record,
    reference,
    sensitivity,
    doesNotProve: GN_DOES_NOT_PROVE,
    experiments,
    passCount,
    total: experiments.length,
    pass: passCount === experiments.length,
  };
}
