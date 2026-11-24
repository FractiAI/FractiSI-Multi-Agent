/**
 * Scripts orchestrate; they hold no logic. The rule is enforced by shape: a short
 * file, no function bodies beyond an entry point, and no branching business logic.
 * Scope: customer CLI under `scripts/`, workloads, and tiny-footprint SDK shims.
 * Empirical research pipelines and a small allowlist of pre-existing fat site/skin
 * entrypoints are out of scope for this shape gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

export const MAX_SCRIPT_LINES = 60;
const MAX_NODE_FUNCTIONS = 1;
const MAX_PYTHON_FUNCTIONS = 1;

/** Pre-existing fat entrypoints (site / holographic). Do not grow this without moving logic to src/. */
const FAT_SCRIPT_ALLOWLIST = Object.freeze(new Set([
  'scripts/build-site.mjs',
  'scripts/holographic-auto-session.mjs',
  'scripts/install-holographic-auto-session-protocol.mjs',
]));

const roots = (file) =>
  (file.startsWith('scripts/') || file.startsWith('workloads/') || file.startsWith('tiny-footprint/sdk/')) &&
  !FAT_SCRIPT_ALLOWLIST.has(file);

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
