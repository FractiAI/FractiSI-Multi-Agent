/** Relative links in authored Markdown must resolve. External links are not fetched. */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';
import { listFiles } from './files.mjs';

const LINK = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const EXCLUDED_PREFIXES = Object.freeze(['output/manuscript/', 'docs/manuscript/']);

/** @param {string} markdown */
export function extractLinks(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...withoutCode.matchAll(LINK)].map((match) => match[1]);
}

function isRelative(target) {
  return !/^[a-z][a-z0-9+.-]*:/i.test(target) && !target.startsWith('#') && !target.startsWith('/');
}

/** @param {string} [root] */
export function checkDocLinks(root = REPO_ROOT) {
  const problems = [];
  const docs = listFiles(root).filter((f) => f.endsWith('.md') && !EXCLUDED_PREFIXES.some((p) => f.startsWith(p)));
  for (const doc of docs) {
    for (const target of extractLinks(fs.readFileSync(path.join(root, doc), 'utf8')).filter(isRelative)) {
      const clean = target.split('#')[0].split('?')[0];
      if (clean && !fs.existsSync(path.join(root, path.dirname(doc), clean))) problems.push(`${doc}: broken link ${target}`);
    }
  }
  return { name: 'relative documentation links resolve', problems };
}
