/**
 * Source fingerprints bind a receipt to the code that produced it, so evidence
 * cannot silently outlive a change to its producer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from '../core/canonical-json.mjs';
import { REPO_ROOT } from '../core/paths.mjs';

/** What determines the deterministic, measured and GPU-lab results. */
export const RESULT_SOURCE_ROOTS = Object.freeze([
  'src/core',
  'src/engine',
  'src/experiments',
  'src/benchmarks',
  'src/labs',
  'src/tiny_footprint_labs/gpu_live',
  'scripts/benchmark_child.mjs',
  'scripts/gpu_live_chat_hbm_lab.py',
  'benchmarks/plan.json',
]);

/** What determines a real-model result. `src/tiny_footprint_labs/llm/matrix.py` holds the same list. */
export const LLM_SOURCE_ROOTS = Object.freeze([
  'src/tiny_footprint_labs/llm',
  'src/tiny_footprint_labs/common',
  'scripts/gpu_llm_real_lab.py',
  'benchmarks/plan.json',
]);

const SOURCE_SUFFIXES = Object.freeze(['.mjs', '.json', '.py']);

function listFiles(root, entry) {
  const absolute = path.join(root, entry);
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [entry];
  return fs
    .readdirSync(absolute, { withFileTypes: true })
    .filter((item) => (item.isDirectory() ? !item.name.startsWith('.') : SOURCE_SUFFIXES.includes(path.extname(item.name))))
    .flatMap((item) => listFiles(root, path.join(entry, item.name)));
}

/**
 * @param {readonly string[]} [roots] repo-relative files or directories
 * @param {string} [repoRoot]
 */
export function sourceFingerprint(roots = RESULT_SOURCE_ROOTS, repoRoot = REPO_ROOT) {
  const files = roots.flatMap((entry) => listFiles(repoRoot, entry)).sort();
  const manifest = files.map((file) => `${sha256(fs.readFileSync(path.join(repoRoot, file)))}  ${file}`).join('\n');
  return { algorithm: 'sha256-of-sorted-file-hashes', fileCount: files.length, sha256: sha256(manifest) };
}
