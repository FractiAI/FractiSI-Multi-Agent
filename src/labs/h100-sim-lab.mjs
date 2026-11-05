/**
 * Adapter for the H100 residency roofline. Arithmetic only, but it runs in Python, so a
 * host without Python records `not_run`. Like every lab, it reports what ran now.
 */
import path from 'node:path';
import { PATHS } from '../core/paths.mjs';
import { resolvePython, runLabScript } from './python-runner.mjs';

export function runH100RhymeSim(opts = {}) {
  return runLabScript({
    script: path.join(PATHS.labScripts, 'h100_prefix_cache_sim.py'),
    args: [],
    python: resolvePython({ explicit: opts.python ?? process.env.TINY_FOOTPRINT_PYTHON }),
    timeoutMs: opts.timeoutMs ?? 30_000,
  });
}
