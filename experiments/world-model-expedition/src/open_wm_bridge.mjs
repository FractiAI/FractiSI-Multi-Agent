/**
 * Bridge: run live open WM Python lab and load results into the expedition.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const labPy = join(root, 'src/open_wms/run_open_wm_lab.py');
const summaryPath = join(root, 'results/open_wm/open_wm_lab_summary.json');

export function runOpenWorldModelLab({ force = false } = {}) {
  if (process.env.SKIP_OPEN_WM === '1' && existsSync(summaryPath)) {
    return { ok: true, cached: true, summary: JSON.parse(readFileSync(summaryPath, 'utf8')) };
  }
  if (!force && process.env.OPEN_WM_CACHE === '1' && existsSync(summaryPath)) {
    return { ok: true, cached: true, summary: JSON.parse(readFileSync(summaryPath, 'utf8')) };
  }
  const py = process.env.PYTHON || 'python3';
  const res = spawnSync(py, [labPy], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env },
  });
  if (res.status !== 0) {
    return {
      ok: false,
      status: 'ERROR',
      stderr: (res.stderr || '').slice(0, 2000),
      stdout: (res.stdout || '').slice(-1000),
    };
  }
  if (!existsSync(summaryPath)) {
    return { ok: false, status: 'MISSING_SUMMARY', stdout: res.stdout?.slice(-1000) };
  }
  return {
    ok: true,
    cached: false,
    summary: JSON.parse(readFileSync(summaryPath, 'utf8')),
    runtimeNote: 'Live CPU open WM arms executed via PyTorch+Gymnasium',
  };
}

/** Map lab summary into expedition-comparable arm rows */
export function openWmArmsFromSummary(summary) {
  if (!summary?.models) return [];
  const pred = summary.predict_next_obs_mse || {};
  const plan = summary.planning_cartpole_return || {};
  return [
    {
      id: 'dreamer_family_rssm',
      status: 'EXECUTABLE',
      family: 'B_latent_predictive',
      ...summary.models.dreamer_family_rssm,
      predict_mse: pred.dreamer_family_rssm,
      plan_return: plan.dreamer_family_rssm,
      capabilities: summary.capabilities?.dreamer_family_rssm,
    },
    {
      id: 'tdmpc_lite',
      status: 'EXECUTABLE',
      family: 'B_latent_predictive',
      ...summary.models.tdmpc_lite,
      predict_mse: pred.tdmpc_lite,
      plan_return: plan.tdmpc_lite_cem,
      capabilities: summary.capabilities?.tdmpc_lite,
    },
    {
      id: 'muzero_lite',
      status: 'EXECUTABLE',
      family: 'B_latent_predictive',
      ...summary.models.muzero_lite,
      predict_mse: pred.muzero_lite,
      plan_return: plan.muzero_lite,
      capabilities: summary.capabilities?.muzero_lite,
    },
  ];
}
