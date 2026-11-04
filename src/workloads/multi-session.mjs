/**
 * Reference multi-session workload: a shared system pattern versus duplicated.
 * Counts JSON bytes; `tiny benchmark` measures the real heap.
 */
import { performance } from 'node:perf_hooks';
import { measureBytes } from '../sdk/index.mjs';

const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
const DEFAULT_SESSIONS = 12;

/** @param {string | undefined} value */
export function parseSessionCount(value) {
  const requested = Number.parseInt(value || String(DEFAULT_SESSIONS), 10);
  return Number.isInteger(requested) && requested > 0 ? requested : DEFAULT_SESSIONS;
}

export function conventionalStore(sessions) {
  const store = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    store.push({ system: SYSTEM, history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = store.reduce((n, x) => n + measureBytes(x), 0);
  return { mode: 'conventional', ms, bytes, sessions };
}

export function tinyStore(sessions) {
  const shared = { system: SYSTEM };
  const deltas = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    deltas.push({ history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = measureBytes(shared) + deltas.reduce((n, x) => n + measureBytes(x), 0);
  return { mode: 'tiny_footprint', ms, bytes, sessions };
}

export function runMultiSessionDemo(sessions = parseSessionCount(process.env.TINY_FOOTPRINT_SESSIONS)) {
  const conventional = conventionalStore(sessions);
  const tiny = tinyStore(sessions);
  return {
    product: 'Tiny Footprint',
    demo: 'multi-session',
    conventional,
    tiny,
    byteReduction: 1 - tiny.bytes / conventional.bytes,
  };
}
