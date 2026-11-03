/**
 * Orchestrate Tiny Footprint REAL local-GPU LLM lab (DirectML/CUDA + transformers).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'gpu_llm_real_lab.py');
const OUT = path.join(ROOT, 'data', 'gpu_llm_real_lab.json');
const VENV_PY = path.join(ROOT, '.venv-cuda', 'Scripts', 'python.exe');

function readReceipt() {
  if (!fs.existsSync(OUT)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

export function runGpuLlmRealLab(opts = {}) {
  const force = opts.force === true || process.env.TINY_FOOTPRINT_FORCE_LLM_LAB === '1';
  const cached = readReceipt();
  // Default: reuse last real-GPU receipt (CI / vitest). Live re-run only when forced.
  if (!force && cached?.ok) {
    return { ...cached, liveRun: false, cached: true };
  }

  const py =
    process.env.TINY_FOOTPRINT_LLM_PYTHON ||
    (fs.existsSync(VENV_PY) ? VENV_PY : null);

  if (!py) {
    return (
      cached || {
        ok: false,
        error: 'no_directml_venv',
        hint: 'Create research/.../.venv-cuda with torch-directml + transformers==4.44.2',
      }
    );
  }

  const args = [
    SCRIPT,
    '--sessions',
    String(opts.sessions ?? 6),
    '--user-turns',
    String(opts.userTurns ?? 2),
    '--new-tokens',
    String(opts.newTokens ?? 8),
    '--trials',
    String(opts.trials ?? 3),
    '--train-steps',
    String(opts.trainSteps ?? 5),
    '--out',
    OUT,
  ];
  const r = spawnSync(py, args, { encoding: 'utf8', timeout: 600_000 });
  const report = readReceipt();
  if (report?.ok) {
    return { ...report, liveRun: true, status: r.status };
  }
  if (report) {
    return { ...report, liveRun: true, status: r.status, stderr: r.stderr };
  }
  return {
    ok: false,
    error: r.error?.message || r.stderr || 'gpu_llm_real_lab_failed',
    status: r.status,
  };
}
