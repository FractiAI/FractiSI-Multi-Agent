/**
 * Run the template's own output validator over the rendered project. It checks the
 * PDF, web edition, figure registry, evidence registry and design plan, and on
 * success writes the receipt binding the output to tracked source and stage code.
 */
import { spawnSync } from 'node:child_process';
import { REPO_ROOT } from '../core/paths.mjs';
import { assertProjectFolder, deterministicEnv, resolveTemplate } from './template.mjs';

/** @param {{env?: NodeJS.ProcessEnv, repoRoot?: string}} [options] */
export function validateRender({ env = process.env, repoRoot = REPO_ROOT } = {}) {
  const template = resolveTemplate({ env, repoRoot });
  assertProjectFolder(repoRoot);
  const run = spawnSync(
    template.python,
    ['scripts/pipeline/stage_04_validate.py', '--project', template.project],
    { cwd: template.root, stdio: 'inherit', env: deterministicEnv(env) },
  );
  if (run.status !== 0) throw new Error(`template validation failed with status ${run.status}`);
  return { project: template.project };
}
