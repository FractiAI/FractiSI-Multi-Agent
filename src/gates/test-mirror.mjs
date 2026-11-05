/**
 * Tests mirror the source tree. Each source module has a test at the same relative
 * path, and each test has a module, so moving one without the other fails. Barrels
 * that only re-export have nothing to test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

/** Test folders with no source counterpart, each with a stated purpose in its guide. */
export const NON_MIRRORED_TEST_ROOTS = Object.freeze(['tests/fixtures/', 'tests/integration/']);

/** A module whose only statements are re-exports. */
export function isBarrel(source) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .trim();
  const REEXPORT = /export\s+(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+['"][^'"]+['"]\s*;?/g;
  return code.length > 0 && code.replace(REEXPORT, '').trim() === '';
}

function expectedTest(sourcePath) {
  const relative = sourcePath.replace(/^src\//, '');
  const dir = path.posix.dirname(relative);
  const base = path.posix.basename(relative);
  if (base.endsWith('.mjs')) return path.posix.join('tests', dir, base.replace(/\.mjs$/, '.test.mjs'));
  return path.posix.join('tests', dir, `test_${base}`);
}

function expectedSources(testPath) {
  const relative = testPath.replace(/^tests\//, '');
  const dir = path.posix.dirname(relative);
  const base = path.posix.basename(relative);
  if (base.endsWith('.test.mjs')) return [path.posix.join('src', dir, base.replace(/\.test\.mjs$/, '.mjs'))];
  return [path.posix.join('src', dir, base.replace(/^test_/, ''))];
}

/** @param {string} [root] */
export function checkTestMirror(root = REPO_ROOT) {
  const problems = [];
  const files = listFiles(root);
  const sources = files.filter((f) => f.startsWith('src/') && (f.endsWith('.mjs') || f.endsWith('.py')) && !f.endsWith('__init__.py'));
  const tests = files.filter((f) => f.startsWith('tests/') && !NON_MIRRORED_TEST_ROOTS.some((r) => f.startsWith(r)) && (f.endsWith('.test.mjs') || /\/test_[^/]+\.py$/.test(f)));
  const fileSet = new Set(files);
  for (const source of sources) {
    if (source.endsWith('.mjs') && isBarrel(fs.readFileSync(path.join(root, source), 'utf8'))) continue;
    if (!fileSet.has(expectedTest(source))) problems.push(`${source}: no test at ${expectedTest(source)}`);
  }
  for (const test of tests) {
    if (!expectedSources(test).some((source) => fileSet.has(source))) problems.push(`${test}: no module at ${expectedSources(test)[0]}`);
  }
  return { name: 'tests mirror the source tree', problems };
}
