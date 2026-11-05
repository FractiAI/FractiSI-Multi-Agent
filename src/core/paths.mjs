/**
 * Canonical repository locations. Modules resolve paths here rather than
 * walking relative directories, so a moved file breaks in one place.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(HERE, '..', '..');

/** @param {...string} parts */
export function repoPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

export const SUITE_NAME = 'synthobs-tiny-gateway-rhyming-templates';

export const PATHS = Object.freeze({
  config: repoPath('tiny-footprint', 'configuration', 'default.json'),
  packageJson: repoPath('package.json'),
  plan: repoPath('benchmarks', 'plan.json'),
  reports: repoPath('benchmarks', 'reports'),
  sharePackets: repoPath('benchmarks', 'reports', 'share-packets'),
  suite: repoPath('research', SUITE_NAME),
  historicalReceipts: repoPath('research', SUITE_NAME, 'data'),
  labScripts: repoPath('scripts'),
  output: repoPath('output'),
  outputData: repoPath('output', 'data'),
  outputFigures: repoPath('output', 'figures'),
  outputManuscript: repoPath('output', 'manuscript'),
  outputPdf: repoPath('output', 'pdf'),
  manuscriptSource: repoPath('docs', 'manuscript'),
  webDocs: repoPath('docs', 'web'),
  adaptersGuide: repoPath('tiny-footprint', 'adapters', 'README.md'),
});
