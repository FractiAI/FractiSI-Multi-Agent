/**
 * Binding to a docxology/template checkout, which owns rendering. This code finds
 * that checkout and checks it. It never changes the checkout's topology: the view
 * under projects/working/ is created by the operator, with the printed command.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, REPO_ROOT } from '../core/paths.mjs';

export const TEMPLATE_PROJECT_NAME = 'tiny-footprint-workstation';
const VIEW_LANE = 'working';

/** @param {{env?: NodeJS.ProcessEnv, repoRoot?: string}} [options] */
export function resolveTemplate({ env = process.env, repoRoot = REPO_ROOT } = {}) {
  const root = env.TINY_TEMPLATE_ROOT;
  if (!root) {
    throw new Error('Set TINY_TEMPLATE_ROOT to a docxology/template checkout. See docs/benchmarks/running.md.');
  }
  if (!fs.existsSync(path.join(root, 'scripts', 'pipeline', 'stage_03_render.py'))) {
    throw new Error(`Not a template checkout, no render stage found: ${root}`);
  }
  const python = env.TINY_TEMPLATE_PYTHON ?? path.join(root, '.venv', 'bin', 'python');
  if (!fs.existsSync(python)) {
    throw new Error(`No template Python at ${python}. Run uv sync in the template, or set TINY_TEMPLATE_PYTHON.`);
  }
  const view = path.join(root, 'projects', VIEW_LANE, TEMPLATE_PROJECT_NAME);
  const real = fs.existsSync(view) ? fs.realpathSync(view) : null;
  if (real !== fs.realpathSync(repoRoot)) {
    throw new Error(`The template has no view of this checkout. Create it with:\n  mkdir -p "${path.dirname(view)}"\n  ln -sfn "${fs.realpathSync(repoRoot)}" "${view}"`);
  }
  return { root, python, project: `${VIEW_LANE}/${TEMPLATE_PROJECT_NAME}` };
}

/**
 * The template's validator looks for <resolved folder name>_combined.pdf, so it follows
 * the view's target and a checkout under another name cannot pass it.
 *
 * @param {string} [repoRoot]
 */
export function assertProjectFolder(repoRoot = REPO_ROOT) {
  const folder = path.basename(fs.realpathSync(repoRoot));
  if (folder !== TEMPLATE_PROJECT_NAME) {
    throw new Error(`The template expects this checkout in a folder named ${TEMPLATE_PROJECT_NAME}, not ${folder}.`);
  }
}

/**
 * The environment for template stages. A set SOURCE_DATE_EPOCH puts the template in its
 * deterministic mode, so the PDF's stamp follows the measured run and not the clock.
 *
 * @param {NodeJS.ProcessEnv} env
 * @param {{dataDir?: string}} [options]
 */
export function deterministicEnv(env, { dataDir = PATHS.outputData } = {}) {
  if (env.SOURCE_DATE_EPOCH) return env;
  const summary = JSON.parse(fs.readFileSync(path.join(dataDir, 'analysis_summary.json'), 'utf8'));
  const measuredAt = Date.parse(summary.heap.load.start.at);
  if (!Number.isFinite(measuredAt)) throw new Error('the measured receipt has no usable start time');
  return { ...env, SOURCE_DATE_EPOCH: String(Math.floor(measuredAt / 1000)) };
}

/** @param {string} root template checkout */
export function templateCommit(root) {
  const pinned = path.join(root, 'TEMPLATE_COMMIT');
  if (fs.existsSync(pinned)) return fs.readFileSync(pinned, 'utf8').trim();
  const read = (...args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 10_000 });
  // A plain export nested inside another repository must not report that repository's commit.
  const top = read('rev-parse', '--show-toplevel');
  if (top.status !== 0 || fs.realpathSync(top.stdout.trim()) !== fs.realpathSync(root)) return 'unknown';
  const head = read('rev-parse', 'HEAD');
  return head.status === 0 ? head.stdout.trim() : 'unknown';
}
