/**
 * Dependencies point down. A module imports only from its own folder or a lower layer,
 * so a change low in the stack cannot depend on what is built above it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

/** Lowest first. Folders on one line do not import each other. */
export const LAYERS = Object.freeze([
  ['core'],
  ['engine', 'labs'],
  ['platform'],
  ['experiments', 'sdk'],
  ['benchmarks', 'workloads'],
  ['analysis'],
  ['manuscript'],
  ['reporting', 'share', 'gates', 'docs_tools', 'testdrive'],
  ['pipeline', 'verification', 'cli'],
]);

const layerOf = (folder) => LAYERS.findIndex((layer) => layer.includes(folder));
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.[^'"]+)['"]/g;

/** @param {string} [root] */
export function checkLayers(root = REPO_ROOT) {
  const problems = [];
  for (const file of listFiles(root).filter((f) => f.startsWith('src/') && f.endsWith('.mjs'))) {
    const folder = file.split('/')[1];
    const own = layerOf(folder);
    if (own === -1) {
      problems.push(`${file}: src/${folder} has no layer in src/gates/layers.mjs`);
      continue;
    }
    for (const [, specifier] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(IMPORT)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)).split('/');
      if (target[0] !== 'src' || target[1] === folder) continue;
      const imported = layerOf(target[1]);
      if (imported === -1 || imported >= own) problems.push(`${file}: imports src/${target[1]}, which is not below src/${folder}`);
    }
  }
  return { name: 'dependencies point down', problems };
}
