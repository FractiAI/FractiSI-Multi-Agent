/** Check what the selected stages need, then run them in order and stop at the first failure. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { assertProjectFolder, resolveTemplate } from './template.mjs';

const runs = (command, args, env) => spawnSync(command, args, { env, stdio: 'ignore', timeout: 30_000 }).status === 0;

function stageProblems(stage, { env, repoRoot }) {
  const problems = [];
  const [command] = stage.command;
  if (path.isAbsolute(command) && !fs.existsSync(command)) {
    problems.push(`${stage.name} needs ${path.relative(repoRoot, command)}. Run: ${stage.needs ?? 'uv sync'}`);
  } else if (stage.imports && !runs(command, ['-c', `import ${stage.imports.join(', ')}`], env)) {
    problems.push(`${stage.name} needs ${stage.imports.join(' and ')}. Run: ${stage.needs}`);
  }
  if (stage.needs === 'TINY_TEMPLATE_ROOT') {
    try {
      resolveTemplate({ env, repoRoot });
    } catch (error) {
      problems.push(`${stage.name}: ${error.message}`);
    }
  }
  if (stage.tools) {
    for (const tool of stage.tools.filter((name) => !runs(name, ['--version'], env))) problems.push(`${stage.name} needs ${tool} on PATH.`);
  }
  if (stage.name === 'validate') {
    try {
      assertProjectFolder(repoRoot);
    } catch (error) {
      problems.push(`${stage.name}: ${error.message}`);
    }
  }
  return problems;
}

/**
 * What the selected stages need and do not have. Checked before anything runs, so a
 * missing tool cannot stop the pipeline after earlier stages rewrote their receipts.
 *
 * @param {ReadonlyArray<object>} stages
 * @param {{env?: NodeJS.ProcessEnv, repoRoot?: string}} [options]
 */
export function preflight(stages, { env = process.env, repoRoot = REPO_ROOT } = {}) {
  return [...new Set(stages.flatMap((stage) => stageProblems(stage, { env, repoRoot })))];
}

/**
 * @param {ReadonlyArray<{name: string, command: string[]}>} stages
 * @param {{log?: (message: string) => void, cwd?: string, env?: NodeJS.ProcessEnv}} [options]
 */
export function runStages(stages, { log = console.log, cwd = REPO_ROOT, env = process.env } = {}) {
  const outcomes = [];
  for (const stage of stages) {
    log(`[pipeline] ${stage.name}`);
    const started = Date.now();
    const [command, ...args] = stage.command;
    const run = spawnSync(command, args, { cwd, stdio: 'inherit', env });
    const status = run.status ?? 1;
    outcomes.push({ name: stage.name, status, seconds: (Date.now() - started) / 1000 });
    if (status !== 0) {
      log(`[pipeline] ${stage.name} failed with status ${status}${run.error ? `: ${run.error.message}` : ''}`);
      return { ok: false, outcomes };
    }
  }
  return { ok: true, outcomes };
}
