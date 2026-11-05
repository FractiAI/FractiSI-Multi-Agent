import { createEnergyModel, scaleUnderBudget } from '../engine/energy/proxy.mjs';
import { createVectorStore } from '../engine/vectors/store.mjs';
import { DIGITAL_SEED } from './constants.mjs';

/**
 * M · Energy-proxy substrate scaling (companion meter — not in H pin).
 */
export function experimentM_energyProxyScale(seed = DIGITAL_SEED) {
  const store = createVectorStore();
  // Build a small tree
  for (let i = 0; i < 15; i++) {
    store.put({
      id: `n${i}`,
      octave: i % 5,
      children: i < 10 ? [`n${i + 1}`] : [],
      cross: i % 3 === 0 && i + 2 < 15 ? [`n${i + 2}`] : [],
      payload: { i, seed },
    });
  }
  const model = createEnergyModel({ joulesPerByteTouch: 1e-8, joulesPerCompare: 1e-8 });
  const baseline = store.resolveWorkingSet('n0', { maxDepth: 8 });
  const tightBudget = (baseline.meters?.energy?.joules || 1) * 0.15;
  const scaled = store.resolveWorkingSet('n0', {
    maxDepth: 8,
    energyBudgetJ: tightBudget,
    energyModel: model,
  });
  const planScale = scaleUnderBudget(
    {
      maxDepth: 8,
      candidateCap: 32,
      bufferLevels: 4,
      bytesTouched: baseline.meters?.energy?.bytesTouched || 1000,
      compares: baseline.meters?.energy?.compares || 100,
      reconstructs: 1,
    },
    tightBudget,
    model,
  );

  const pass =
    baseline.meters?.PROXY === true &&
    scaled.meters?.scaled === true &&
    scaled.meters.maxDepth < baseline.meters.requestedMaxDepth &&
    scaled.meters.energy.bytesTouched <= baseline.meters.energy.bytesTouched &&
    planScale.PROXY === true &&
    planScale.scaled === true;

  return {
    id: 'M_energy_proxy_scale',
    title: 'Energy-proxy substrate scaling (byte-touch joule PROXY)',
    baselineDepth: baseline.meters?.maxDepth,
    scaledDepth: scaled.meters?.maxDepth,
    baselineBytes: baseline.meters?.energy?.bytesTouched,
    scaledBytes: scaled.meters?.energy?.bytesTouched,
    baselineJ: baseline.meters?.energy?.joules,
    scaledJ: scaled.meters?.energy?.joules,
    budgetJ: tightBudget,
    planScale,
    pass,
    honesty:
      'Byte-touch / compare joule proxy inside the vector loop — not wall-socket energy, not datacenter PUE, not a CapEx claim.',
  };
}
