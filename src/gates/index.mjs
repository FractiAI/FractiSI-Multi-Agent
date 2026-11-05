/** All repository structure gates, run together by tests and by project verification. */
import { checkDocLinks } from './doc-links.mjs';
import { checkFolderGuides } from './folder-guides.mjs';
import { checkLayers } from './layers.mjs';
import { checkResearchPaper } from './research-paper.mjs';
import { checkShims } from './shims.mjs';
import { checkSiteLinks } from './site-links.mjs';
import { checkTestMirror } from './test-mirror.mjs';
import { checkThinScripts } from './thin-scripts.mjs';

/** @param {string} [root] */
export function runAllGates(root) {
  return [checkFolderGuides(root), checkTestMirror(root), checkThinScripts(root), checkShims(root), checkLayers(root), checkDocLinks(root), checkSiteLinks(root), checkResearchPaper(root)];
}
