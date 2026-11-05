/**
 * Adapter for the live GPU chat-stack lab (Python, nvcuda, nvidia-smi).
 * The lab reports `not_run` where the NVIDIA runtime is absent.
 */
import path from 'node:path';
import { PATHS } from '../core/paths.mjs';
import { resolvePython, runLabScript } from './python-runner.mjs';

export const GPU_LIVE_DEFAULTS = Object.freeze({ sessions: 16, kvMib: 4, sysMib: 12, weightMib: 32, latencyTrials: 24 });

export function runGpuLiveChatLab(opts = {}) {
  const o = { ...GPU_LIVE_DEFAULTS, ...opts };
  return runLabScript({
    script: path.join(PATHS.labScripts, 'gpu_live_chat_hbm_lab.py'),
    args: [
      '--sessions', String(o.sessions),
      '--kv-mib', String(o.kvMib),
      '--sys-mib', String(o.sysMib),
      '--weight-mib', String(o.weightMib),
      '--latency-trials', String(o.latencyTrials),
    ],
    python: resolvePython({ explicit: opts.python ?? process.env.TINY_FOOTPRINT_PYTHON }),
    timeoutMs: opts.timeoutMs ?? 120_000,
  });
}
