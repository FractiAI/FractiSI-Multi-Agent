/** Every folder ships a README.md for people and an AGENTS.md for agents. */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listDirectories } from './files.mjs';

export const GUIDE_FILES = Object.freeze(['README.md', 'AGENTS.md']);

/** @param {string} [root] */
export function checkFolderGuides(root = REPO_ROOT) {
  const problems = [];
  for (const dir of listDirectories(root)) {
    for (const guide of GUIDE_FILES) {
      const file = path.join(root, dir, guide);
      if (!fs.existsSync(file)) problems.push(`${dir || '.'}: missing ${guide}`);
      else if (fs.readFileSync(file, 'utf8').trim().length === 0) problems.push(`${dir || '.'}: empty ${guide}`);
    }
  }
  return { name: 'every folder has README.md and AGENTS.md', problems };
}
