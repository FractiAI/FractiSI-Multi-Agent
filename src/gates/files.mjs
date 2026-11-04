/** Repository walking shared by the gates. Generated and tool-owned folders are excluded. */
import fs from 'node:fs';
import path from 'node:path';

export const EXCLUDED_DIRS = Object.freeze(new Set([
  '.git', 'node_modules', '.venv', '.venv-cuda', '__pycache__', '.pytest_cache', '.ruff_cache', '.mypy_cache', '.claude', 'graft', 'htmlcov', '.coverage',
]));

/**
 * Renderer folders that are ignored by Git, so a clone never has them. The tracked
 * renderer output (web edition, reports) needs guides like any other folder.
 */
export const RENDERER_OWNED = Object.freeze(new Set(['output/logs', 'output/slides', 'output/citations']));

/** @param {string} root */
export function listDirectories(root, relative = '') {
  const dirs = [relative];
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (!entry.isDirectory() || EXCLUDED_DIRS.has(entry.name)) continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (RENDERER_OWNED.has(child)) continue;
    dirs.push(...listDirectories(root, child));
  }
  return dirs;
}

/** @param {string} root */
export function listFiles(root, relative = '') {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return EXCLUDED_DIRS.has(entry.name) ? [] : listFiles(root, child);
    return [child];
  });
}
