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

export function runGpuLiveChatLab(opts = {}) {
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
  let report = null;
  if (fs.existsSync(OUT)) {
    try {
      report = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    } catch {
      report = null;
    }
  }
  if (!report && r.stdout) {
    try {
      report = JSON.parse(r.stdout);
    } catch {
      report = { ok: false, error: 'unparseable_stdout', stderr: r.stderr };
    }
  }
  if (!report) {
    report = {
      ok: false,
      error: r.error?.message || r.stderr || 'gpu_lab_failed',
      status: r.status,
    };
  }
  return report;
}
