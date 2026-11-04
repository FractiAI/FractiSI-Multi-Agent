/**
 * Nested vectors — hierarchy + cross-links + octave/node/complement refs.
 * Optional energy-proxy counters + budget scaling (PROXY meters only).
 */
import { createEnergyModel, emptyEnergyCounters, scaleUnderBudget } from './energy-proxy.mjs';

export function createVectorStore() {
  /** @type {Map<string, object>} */
  const vectors = new Map();
  return {
    put(vec) {
      if (!vec?.id) throw new Error('vector needs id');
      vectors.set(vec.id, vec);
      return vec.id;
    },
    get(id) {
      return vectors.get(id) || null;
    },
    /**
     * Selective reconstruction: only requested id + dependency closure.
     * @param {object} [opts]
     * @param {number} [opts.maxDepth]
     * @param {number|null} [opts.energyBudgetJ] - PROXY joule budget; may shrink depth
     * @param {object} [opts.energyModel]
     * @param {object} [opts.hooks] - optional compression hook registry (onMeter only here)
     */
    resolveWorkingSet(rootId, { maxDepth = 8, energyBudgetJ = null, energyModel = null, hooks = null } = {}) {
      const counters = emptyEnergyCounters();
      let depthCap = maxDepth;
      let scaled = false;
      let scaleReceipt = null;

      if (energyBudgetJ != null) {
        const model = energyModel || createEnergyModel();
        // Rough plan: assume ~256 bytes + 2 compares per visited node at full depth fanout
        const approxNodes = Math.min(vectors.size, 2 ** Math.min(depthCap, 6));
        scaleReceipt = scaleUnderBudget(
          {
            maxDepth: depthCap,
            candidateCap: 8,
            bufferLevels: 4,
            bytesTouched: approxNodes * 256,
            compares: approxNodes * 2,
            reconstructs: 1,
          },
          energyBudgetJ,
          model,
        );
        if (scaleReceipt.scaled) {
          depthCap = scaleReceipt.plan.maxDepth;
          scaled = true;
        }
      }

      const out = [];
      const seen = new Set();
      const stack = [{ id: rootId, depth: 0 }];
      while (stack.length) {
        const { id, depth } = stack.pop();
        counters.compares += 1;
        if (seen.has(id) || depth > depthCap) continue;
        seen.add(id);
        const v = vectors.get(id);
        if (!v) continue;
        out.push(v);
        const payloadBytes = Buffer.byteLength(JSON.stringify(v), 'utf8');
        counters.bytesTouched += payloadBytes;
        for (const c of v.children || []) stack.push({ id: c, depth: depth + 1 });
        for (const x of v.cross || []) stack.push({ id: x, depth: depth + 1 });
        if (v.complement) stack.push({ id: v.complement, depth: depth + 1 });
        for (const d of v.deps || []) stack.push({ id: d, depth: depth + 1 });
      }
      counters.reconstructs += 1;

      const model = energyModel || createEnergyModel();
      const estimate = model.estimateOpCost(counters);
      const hookMeters = hooks?.collectMeters?.({ n: out.length, bytesTouched: counters.bytesTouched }) || null;

      // Array return preserved for callers; meters hang off non-enumerable prop.
      Object.defineProperty(out, 'meters', {
        value: {
          PROXY: true,
          n: out.length,
          maxDepth: depthCap,
          requestedMaxDepth: maxDepth,
          scaled,
          energy: estimate,
          scaleReceipt,
          hookMeters,
        },
        enumerable: false,
      });
      return out;
    },
    all() {
      return [...vectors.values()];
    },
    size() {
      return vectors.size;
    },
  };
}
