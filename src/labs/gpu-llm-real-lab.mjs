/**
 * Adapter for the real-model lab (torch and transformers). Heavy and optional:
 * it runs only when requested, and a host without the environment reports
 * `not_run` rather than borrowing another machine's receipt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, repoPath } from '../core/paths.mjs';
import { notRunReport } from './lab-status.mjs';
import { runLabScript } from './python-runner.mjs';

export const GPU_LLM_DEFAULTS = Object.freeze({ sessions: 6, userTurns: 2, newTokens: 8, trials: 3, trainSteps: 5 });

/** Interpreter candidates in priority order: explicit, the uv project env, the DirectML venv. */
export function findLlmPython({ explicit, exists = fs.existsSync } = {}) {
  if (explicit) return explicit;
  const candidates = [repoPath('.venv', 'bin', 'python'), repoPath('.venv-cuda', 'Scripts', 'python.exe')];
  return candidates.find((candidate) => exists(candidate)) ?? null;
}

export function runGpuLlmRealLab(opts = {}) {
  const requested = opts.force === true || process.env.TINY_FOOTPRINT_FORCE_LLM_LAB === '1';
  if (!requested) {
    return notRunReport('not_requested', 'Set TINY_FOOTPRINT_FORCE_LLM_LAB=1 or benchmark.forceLlmLab to run this lab.');
  }
  const command = findLlmPython({ explicit: opts.python ?? process.env.TINY_FOOTPRINT_LLM_PYTHON });
  if (!command) {
    return notRunReport('no_llm_environment', 'Run `uv sync --group llm`, or set TINY_FOOTPRINT_LLM_PYTHON.');
  }
  const o = { ...GPU_LLM_DEFAULTS, ...opts };
  return runLabScript({
    script: path.join(PATHS.labScripts, 'gpu_llm_real_lab.py'),
    args: [
      '--sessions', String(o.sessions),
      '--user-turns', String(o.userTurns),
      '--new-tokens', String(o.newTokens),
      '--trials', String(o.trials),
      '--train-steps', String(o.trainSteps),
    ],
    python: { command, prefixArgs: [] },
    timeoutMs: opts.timeoutMs ?? 600_000,
  });
}
