/**
 * Energy-aware substrate scaling — byte-touch / compare joule PROXY.
 *
 * PROXY: true on every receipt. Not a calorimeter. Not PUE. Not CapEx−energy.
 */
export function createEnergyModel({
  joulesPerByteTouch = 1e-9,
  joulesPerCompare = 5e-10,
  joulesPerReconstruct = 2e-9,
  wattsIdleProxy = 0,
} = {}) {
  return {
    PROXY: true,
    joulesPerByteTouch,
    joulesPerCompare,
    joulesPerReconstruct,
    wattsIdleProxy,
    estimateOpCost({ bytesTouched = 0, compares = 0, reconstructs = 0 } = {}) {
      const j =
        bytesTouched * joulesPerByteTouch +
        compares * joulesPerCompare +
        reconstructs * joulesPerReconstruct;
      return {
        PROXY: true,
        joules: j,
        wattsIdleProxy,
        bytesTouched,
        compares,
        reconstructs,
      };
    },
  };
}

/**
 * Scale a plan under a joule budget: shrink maxDepth / candidateCap / bufferLevels.
 */
export function scaleUnderBudget(plan, budgetJ, model = createEnergyModel()) {
  const base = {
    maxDepth: plan.maxDepth ?? 8,
    candidateCap: plan.candidateCap ?? 32,
    bufferLevels: plan.bufferLevels ?? 4,
    bytesTouched: plan.bytesTouched ?? 0,
    compares: plan.compares ?? 0,
    reconstructs: plan.reconstructs ?? 0,
  };
  let cur = { ...base };
  let estimate = model.estimateOpCost(cur);
  let scaled = false;
  const steps = [];

  while (budgetJ != null && estimate.joules > budgetJ) {
    scaled = true;
    if (cur.maxDepth > 1) {
      cur.maxDepth -= 1;
      cur.bytesTouched = Math.floor(cur.bytesTouched * 0.75);
      steps.push({ lever: 'maxDepth', value: cur.maxDepth });
    } else if (cur.candidateCap > 1) {
      cur.candidateCap = Math.max(1, Math.floor(cur.candidateCap / 2));
      cur.compares = Math.floor(cur.compares * 0.5);
      steps.push({ lever: 'candidateCap', value: cur.candidateCap });
    } else if (cur.bufferLevels > 1) {
      cur.bufferLevels -= 1;
      cur.bytesTouched = Math.floor(cur.bytesTouched * 0.85);
      steps.push({ lever: 'bufferLevels', value: cur.bufferLevels });
    } else {
      break;
    }
    estimate = model.estimateOpCost(cur);
  }

  return {
    PROXY: true,
    scaled,
    budgetJ: budgetJ ?? null,
    plan: cur,
    estimate,
    steps,
    honesty:
      'Byte-touch / compare joule proxy inside the vector loop — not wall-socket energy, not datacenter PUE, not a CapEx claim.',
  };
}

export function emptyEnergyCounters() {
  return { bytesTouched: 0, compares: 0, reconstructs: 0, PROXY: true };
}

export function touchBytes(counters, n) {
  counters.bytesTouched += n;
  return counters;
}

export function touchCompare(counters, n = 1) {
  counters.compares += n;
  return counters;
}
