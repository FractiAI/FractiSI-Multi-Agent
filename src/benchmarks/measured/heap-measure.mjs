/**
 * One heap measurement, in the process running it: wire text is prepared first and
 * retained throughout, the store is built, and the heap is read after forced full
 * collections on both sides. Requires `node --expose-gc`.
 *
 * The whole build runs twice first and is thrown away, so lazily compiled code, tier-up
 * and inline caches are not charged to whichever condition allocates them. A warm pass
 * over only a few sessions is not enough: hot functions tier up during a large build,
 * which moved readings by kilobytes between runs. Two controls measure the instrument:
 * `control_empty` allocates nothing, and `control_known` allocates a packed double array
 * of a size that can be computed in advance.
 */
import { performance } from 'node:perf_hooks';
import { bytesOf } from '../../core/bytes.mjs';
import { getWorkload } from './session-stores.mjs';

const WARM_PASSES = 2;
const DOUBLE_BYTES = 8;
const MAX_COLLECTIONS = 32;
const SETTLED_WITHIN_BYTES = 1024;

export const CONTROLS = Object.freeze({
  control_empty: () => null,
  control_known: (doubles) => new Array(doubles).fill(0.5),
});

/**
 * Collect until the heap stops shrinking, and return the reading taken right after the
 * last collection. A fixed number of collections is not enough: a discarded warm-pass
 * store of 256 sessions survived two forced collections, was counted in the "before"
 * reading, and made a full store read as almost nothing. A reading taken any later
 * includes what the reader itself allocated.
 */
export function settledMemory() {
  let previous = Infinity;
  let usage;
  for (let i = 0; i < MAX_COLLECTIONS; i++) {
    globalThis.gc();
    usage = process.memoryUsage();
    if (Math.abs(previous - usage.heapUsed) <= SETTLED_WITHIN_BYTES) break;
    previous = usage.heapUsed;
  }
  return usage;
}

/** A baseline reading, taken after one full pass so the reader's own code is already warm. */
export function baselineMemory() {
  settledMemory();
  return settledMemory();
}

/**
 * @param {object} spec
 * @param {string} spec.workload
 * @param {string} spec.condition
 * @param {number} spec.sessions
 * @param {number} [spec.seed]
 * @param {number} [spec.turns]
 */
export function measureControl(spec) {
  if (typeof globalThis.gc !== 'function') throw new Error('heap measurement requires node --expose-gc');
  const control = CONTROLS[spec.condition];
  if (!control) throw new Error(`unknown control: ${spec.condition}`);
  const doubles = spec.doubles ?? 0;
  control(Math.min(doubles, 16));
  const before = baselineMemory();
  const store = control(doubles);
  const after = settledMemory();
  return {
    ...spec,
    heldDoubles: store === null ? 0 : store.length,
    heapUsedDelta: after.heapUsed - before.heapUsed,
    expectedBytes: doubles * DOUBLE_BYTES,
  };
}

export function measureHeap(spec) {
  if (typeof globalThis.gc !== 'function') throw new Error('heap measurement requires node --expose-gc');
  const workload = getWorkload(spec.workload);
  const wires = workload.wires(spec);
  const build = workload.build[spec.condition];
  if (!build) throw new Error(`unknown condition: ${spec.condition}`);

  for (let pass = 0; pass < WARM_PASSES; pass++) build(wires);
  const before = baselineMemory();
  const start = performance.now();
  const store = build(wires);
  const buildMs = performance.now() - start;
  const after = settledMemory();

  // The store and wire text are both read after the heap reading, so neither is
  // eligible for collection before it.
  const wireBytes = wires.reduce((sum, wire) => sum + Buffer.byteLength(wire, 'utf8'), 0);
  const representationBytes = bytesOf(workload.serializable[spec.condition](store));
  return {
    ...spec,
    buildMs,
    heapUsedDelta: after.heapUsed - before.heapUsed,
    externalDelta: after.external - before.external,
    arrayBuffersDelta: after.arrayBuffers - before.arrayBuffers,
    rssDelta: after.rss - before.rss,
    wireBytes,
    representationBytes,
  };
}
