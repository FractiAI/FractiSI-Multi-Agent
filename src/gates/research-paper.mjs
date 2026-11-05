/** The research paper's two copies stay identical, keep their characters, and name commands that exist. */
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../core/paths.mjs';

const SUITE = 'research/synthobs-tiny-gateway-rhyming-templates';
const PAPER = 'SYNTHOBS_TINY_GATEWAY_RHYMING_TEMPLATES_EGS_2026-11.md';
export const PAPER_COPIES = Object.freeze([`${SUITE}/docs/${PAPER}`, `${SUITE}/paper/${PAPER}`]);

/** A question mark inside a word, between spaces or alone in a table cell is a character lost to an encoding. */
const LOST_CHARACTER = /\p{L}\?\p{L}|(?:^|\s)\?(?:\s|$)/u;
const NPM_COMMAND = /npm run ([\w:.-]+)/g;

/** @param {string} text */
export function lostCharacterLines(text) {
  return text.split('\n').flatMap((line, index) => (LOST_CHARACTER.test(line) ? [index + 1] : []));
}

/** @param {string} [root] */
export function checkResearchPaper(root = REPO_ROOT) {
  const problems = [];
  const [first, second] = PAPER_COPIES.map((file) => fs.readFileSync(path.join(root, file), 'utf8'));
  if (first !== second) problems.push(`${PAPER_COPIES[0]} and ${PAPER_COPIES[1]} differ`);
  for (const line of lostCharacterLines(first)) problems.push(`${PAPER_COPIES[0]}:${line}: a character was lost`);
  const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts;
  for (const [, command] of first.matchAll(NPM_COMMAND)) {
    if (!scripts[command]) problems.push(`${PAPER_COPIES[0]} names npm run ${command}, which package.json does not define`);
  }
  return { name: 'the research paper copies match and keep their characters', problems };
}
