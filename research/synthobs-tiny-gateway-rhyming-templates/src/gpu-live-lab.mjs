/**
 * Orchestrate Tiny Footprint live GPU chat-stack lab (Python + nvcuda + nvidia-smi).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'gpu_live_chat_hbm_lab.py');
const OUT = path.join(ROOT, 'data', 'gpu_live_chat_hbm_lab.json');

function readReceipt() {
  if (!fs.existsSync(OUT)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

export function runGpuLiveChatLab(opts = {}) {
  const force = opts.force === true || process.env.TINY_FOOTPRINT_FORCE_GPU_LAB === '1';
  const cached = readReceipt();
  // Default: reuse last live-stack receipt (CI / vitest). Live re-run only when forced.
  if (!force && cached?.ok) {
    return { ...cached, liveRun: false, cached: true };
  }

  const sessions = opts.sessions ?? 16;
  const kv = opts.kvMib ?? 4;
  const sys = opts.sysMib ?? 12;
  const weight = opts.weightMib ?? 32;
  const latencyTrials = opts.latencyTrials ?? 24;
  const py = process.env.TINY_FOOTPRINT_PYTHON || 'py';
  const args = [
    '-3',
    SCRIPT,
    '--sessions',
    String(sessions),
    '--kv-mib',
    String(kv),
    '--sys-mib',
    String(sys),
    '--weight-mib',
    String(weight),
    '--latency-trials',
    String(latencyTrials),
    '--out',
    OUT,
  ];
  const r = spawnSync(py, args, { encoding: 'utf8', timeout: 120_000 });
  const report = readReceipt();
  if (report?.ok) {
    return { ...report, liveRun: true, status: r.status };
  }
  if (cached?.ok) {
    return { ...cached, liveRun: false, cached: true, lastLiveError: r.error?.message || r.stderr };
  }
  if (report) {
    return { ...report, liveRun: true, status: r.status, stderr: r.stderr };
  }
  return {
    ok: false,
    error: r.error?.message || r.stderr || 'gpu_lab_failed',
    status: r.status,
  };
}
