/**
 * Materialization latency, in the process running it: the time to turn one stored
 * session back into its full request text. Before any timing, every session is
 * checked to reconstruct to its original wire text exactly.
 */
import { quantileSorted } from '../../core/stats.mjs';
import { buildConditionFor, getWorkload } from './session-stores.mjs';

/**
 * @param {object} spec
 * @param {string} spec.workload
 * @param {string} spec.condition
 * @param {number} spec.sessions
 * @param {number} spec.warmupOps
 * @param {number} spec.measuredOps
 * @param {number} spec.batch operations per timer reading
 * @param {number} [spec.seed]
 * @param {number} [spec.turns]
 */
export function measureLatency(spec) {
  const workload = getWorkload(spec.workload);
  const wires = workload.wires(spec);
  const build = workload.build[buildConditionFor(spec.condition)];
  const materialize = workload.materialize[spec.condition];
  if (!build || !materialize) throw new Error(`unknown condition: ${spec.condition}`);
  const store = build(wires);

  const exact = wires.filter((wire, i) => materialize(store, i) === wire).length;
  let sink = 0;
  const pass = (ops, onBatch) => {
    let next = 0;
    for (let done = 0; done < ops; done += spec.batch) {
      const start = process.hrtime.bigint();
      for (let k = 0; k < spec.batch; k++) {
        sink += materialize(store, next).length;
        next = (next + 1) % spec.sessions;
      }
      if (onBatch) onBatch(Number(process.hrtime.bigint() - start) / spec.batch);
    }
  };
  pass(spec.warmupOps);
  const perOpNs = [];
  pass(spec.measuredOps, (ns) => perOpNs.push(ns));
  perOpNs.sort((a, b) => a - b);
  return {
    ...spec,
    exactReconstructions: exact,
    checkedReconstructions: wires.length,
    p50Ns: quantileSorted(perOpNs, 0.5),
    p95Ns: quantileSorted(perOpNs, 0.95),
    batchesTimed: perOpNs.length,
    sink,
  };
}
