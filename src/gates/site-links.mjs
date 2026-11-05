/** Links in the published HTML pages must resolve, as vercel.json serves them. External links are not fetched. */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

const LINK = /(?:href|src)=["']([^"'#?]+)/g;
/**
 * The renderer owns output/, and the template's validator checks it. library/papers/ holds
 * papers rendered elsewhere, whose cross-links point at files in their home repositories.
 */
const EXCLUDED_PREFIXES = Object.freeze(['output/', 'library/papers/']);
/** vercel.json sets cleanUrls, so /open/ serves open/index.html and /simple serves simple.html. */
const SERVED_SUFFIXES = Object.freeze(['', '.html', '/index.html']);

/** @param {string} html */
export function extractPageLinks(html) {
  return [...html.matchAll(LINK)].map((match) => match[1]);
}

function isExternal(target) {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//');
}

function resolves(root, page, target) {
  const served = target.startsWith('/') ? target.slice(1) : path.join(path.dirname(page), target);
  return SERVED_SUFFIXES.some((suffix) => fs.existsSync(path.join(root, `${decodeURI(served).replace(/\/$/, '')}${suffix}`)));
}

/** @param {string} [root] */
export function checkSiteLinks(root = REPO_ROOT) {
  const problems = [];
  const pages = listFiles(root).filter((f) => f.endsWith('.html') && !EXCLUDED_PREFIXES.some((p) => f.startsWith(p)));
  for (const page of pages) {
    for (const target of extractPageLinks(fs.readFileSync(path.join(root, page), 'utf8'))) {
      if (!isExternal(target) && !resolves(root, page, target)) problems.push(`${page}: broken link ${target}`);
    }
  }
  return { name: 'links in the published pages resolve', problems };
}
