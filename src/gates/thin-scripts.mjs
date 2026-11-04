/**
 * Scripts orchestrate; they hold no logic. The rule is enforced by shape: a short
 * file, no function bodies beyond an entry point, and no branching business logic.
 * Compatibility shims under research/ are held to the same standard.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

export const MAX_SCRIPT_LINES = 60;
const MAX_NODE_FUNCTIONS = 1;
const MAX_PYTHON_FUNCTIONS = 1;

const roots = (file) => file.startsWith('scripts/') || file.startsWith('workloads/') || /^research\/[^/]+\/(scripts|src)\//.test(file) || file.startsWith('tiny-footprint/sdk/');

/** @param {string} source @param {string} file */
export function assessScript(source, file) {
  const problems = [];
  const lines = source.split('\n').length;
  if (lines > MAX_SCRIPT_LINES) problems.push(`${file}: ${lines} lines, over the ${MAX_SCRIPT_LINES} limit`);
  if (file.endsWith('.py')) {
    const functions = (source.match(/^\s*def\s+/gm) ?? []).length;
    if (functions > MAX_PYTHON_FUNCTIONS) problems.push(`${file}: ${functions} functions; move logic to src/`);
    if (/^\s*class\s+/m.test(source)) problems.push(`${file}: defines a class; move it to src/`);
  } else {
    const functions = (source.match(/^\s*(export\s+)?(async\s+)?function\s+/gm) ?? []).length;
    if (functions > MAX_NODE_FUNCTIONS) problems.push(`${file}: ${functions} functions; move logic to src/`);
    if (/^\s*class\s+/m.test(source)) problems.push(`${file}: defines a class; move it to src/`);
  }
  return problems;
}

/** @param {string} [root] */
export function checkThinScripts(root = REPO_ROOT) {
  const scripts = listFiles(root).filter((f) => roots(f) && (f.endsWith('.mjs') || f.endsWith('.py')));
  return {
    name: 'scripts are thin orchestrators',
    problems: scripts.flatMap((file) => assessScript(fs.readFileSync(path.join(root, file), 'utf8'), file)),
  };
}
