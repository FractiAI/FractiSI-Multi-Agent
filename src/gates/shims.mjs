/**
 * Compatibility paths stay compatibility paths. A module under the research suite's
 * src/ may only re-export, so a second copy of the engine cannot grow back.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, SUITE_NAME } from '../core/paths.mjs';
import { listFiles } from './files.mjs';
import { isBarrel } from './test-mirror.mjs';

/** @param {string} [root] */
export function checkShims(root = REPO_ROOT) {
  const prefix = `research/${SUITE_NAME}/src/`;
  const modules = listFiles(root).filter((f) => f.startsWith(prefix) && f.endsWith('.mjs'));
  const sdk = 'tiny-footprint/sdk/index.mjs';
  const problems = [...modules, sdk]
    .filter((file) => fs.existsSync(path.join(root, file)))
    .filter((file) => !isBarrel(fs.readFileSync(path.join(root, file), 'utf8')))
    .map((file) => `${file}: holds logic; the canonical code belongs under src/`);
  return { name: 'compatibility paths only re-export', problems };
}
