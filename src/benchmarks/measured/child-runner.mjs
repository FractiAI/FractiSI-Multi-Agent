/**
 * Every measurement runs in its own child process: isolated JIT and heap state, and
 * a process is the independent unit that the bootstrap resamples.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { shuffled, mulberry32 } from '../../core/rng.mjs';
import { PATHS } from '../../core/paths.mjs';

export const CHILD_SCRIPT = path.join(PATHS.labScripts, 'benchmark_child.mjs');

/**
 * Heap readings hold data alone. Tier-up allocates code in the same heap from a
 * background thread, which moved readings by up to eight kilobytes and split cells into
 * two modes. With it off, repeated processes read the same number. Retained object
 * layouts do not depend on the tier. Latency and RSS keep normal settings, because they
 * describe a realistic process.
 */
const HEAP_ISOLATION_FLAGS = Object.freeze(['--no-opt', '--no-maglev', '--no-sparkplug', '--single-threaded-gc']);
const accepted = new Map();

function runtimeAccepts(flag) {
  if (!accepted.has(flag)) {
    accepted.set(flag, spawnSync(process.execPath, [flag, '-e', '0'], { stdio: 'ignore' }).status === 0);
  }
  return accepted.get(flag);
}

/** The isolation flags this Node accepts; older runtimes lack some tiers. */
export function heapIsolationFlags() {
  return HEAP_ISOLATION_FLAGS.filter(runtimeAccepts);
}

/** @param {{kind: string}} spec */
export function childFlags(spec) {
  const isolate = spec.kind === 'heap' || spec.kind === 'control';
  return ['--expose-gc', ...(isolate ? heapIsolationFlags() : [])];
}

/** @param {{kind: 'heap'|'control'|'latency'|'rss'} & object} spec */
export function runChild(spec, { timeoutMs = 120_000 } = {}) {
  const run = spawnSync(process.execPath, [...childFlags(spec), CHILD_SCRIPT, JSON.stringify(spec)], {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (run.error) throw run.error;
  if (run.status !== 0) {
    throw new Error(`benchmark child failed (${run.status}) for ${JSON.stringify(spec)}:\n${run.stderr}`);
  }
  return JSON.parse(run.stdout);
}

/**
 * Run a whole design in seeded random order, so slow drift on the host spreads
 * across conditions rather than landing on whichever runs last.
 *
 * @param {object[]} specs
 * @param {number} seed
 * @param {(done: number, total: number) => void} [onProgress]
 */
export function runDesign(specs, seed, onProgress) {
  const order = shuffled(specs, mulberry32(seed));
  return order.map((spec, i) => {
    const result = runChild(spec);
    onProgress?.(i + 1, order.length);
    return result;
  });
}
