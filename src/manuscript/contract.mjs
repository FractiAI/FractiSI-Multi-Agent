/**
 * The hard-coded value gate: authored sections may not state a study value. Numbers
 * reach the manuscript through tokens, so a number typed into prose is a defect the
 * build must catch. A lexical gate cannot judge meaning, so it is strict and has a
 * short, explained allowlist; it complements review and does not replace it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { listSectionFiles } from './hydrate.mjs';

/** Proper names and standards that contain digits. Each one is a name, not a result. */
export const ALLOWED_NAMES = Object.freeze([
  'GPT-2', // model family
  'Llama 2 7B', // named model shape
  'Llama 2', // named model family
  'H100', // named accelerator
  'UTF-8', // encoding
  'V8', // JavaScript engine
  'SHA-256', // hash
  'nvidia-smi', // tool name; listed so its hyphen is not read as a range
  'S01', // supplement identifier in a cross-reference
]);

/** Constants allowed inside mathematics: identities such as 1 - T/B, not results. */
const MATH_ALLOWED = /^(?:0|1|2)$/;

const SPELLED = 'two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|twenty|thirty|forty|fifty|hundred|thousand';
const STUDY_NOUN = 'sessions?|trials?|processes|workloads?|conditions?|models?|runs?|turns?|tokens?|tiers?|stores?|arms?|figures?|tables?|repeats?|replicates?|samples?|contributions?';
const TENS = 'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety';
const ONES = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen';
const SPELLED_PERCENT = new RegExp(`\\b(?:(?:${TENS})(?:-(?:${ONES}))?|${ONES}|hundred)\\s+per\\s?cent\\b`, 'gi');
const SPELLED_FOLD = new RegExp(`\\b(?:${ONES}|${TENS}|hundred|thousand)-?fold\\b`, 'gi');
/** A result written inside code or a comment: a decimal, a percentage or a multiplier. */
const RESULT_LIKE = /\d+\.\d+|\d+\s*%|\d+(?:\.\d+)?\s*×/g;
const SPELLED_COUNT = new RegExp(`\\b(${SPELLED})\\s+(?:\\w+\\s+)?(${STUDY_NOUN})\\b`, 'gi');
/** Counts that describe this document's structure rather than a study design, each one reviewed. */
const ALLOWED_SPELLED = Object.freeze(['eight nodes', 'four contributions', 'three tiers', 'two workloads', 'two published figures']);

/** Code and comments may hold digits, such as a command's arguments, but never a result. */
function resultsInCode(raw, findings, file) {
  const report = (kind) => (block) => {
    for (const value of block.match(RESULT_LIKE) ?? []) findings.push({ file, kind, value });
    return ' ';
  };
  return raw
    .replace(/<!--[\s\S]*?-->/g, report('number_in_comment'))
    .replace(/```[\s\S]*?```/g, report('number_in_code'))
    .replace(/`[^`\n]*`/g, (code) => report('number_in_code')(code.replace(/\{\{[A-Z][A-Z0-9_]*\}\}/g, ' ')));
}

function stripForScan(text) {
  return text
    .replace(/\{\{[A-Z][A-Z0-9_]*\}\}/g, ' ') // tokens
    .replace(/!\[([^\]]*)\]\([^)]*\)(\{[^}]*\})?/g, '$1 ') // figures: the path and layout go, the caption stays
    .replace(/\[-?@[\w:.-]+(?:\s*;\s*-?@[\w:.-]+)*\]/g, ' ') // citations and cross-references, without locators
    .replace(/\[-?@[\w:.-]+/g, ' [') // a citation with a locator keeps the locator
    .replace(/(^|[\s(])@[A-Za-z0-9_:]+/g, '$1 ') // narrative citations
    .replace(/\{\s*[#.][^}=]*\}/g, ' ') // labels and classes; an attribute with a value stays
    .replace(/^:::.*$/gm, ' ') // fenced divs
    .replace(/https?:\/\/\S+/g, ' '); // links
}

function stripMath(text, findings, file) {
  const report = (math) => {
    for (const digits of math.match(/\d+(?:\.\d+)?/g) ?? []) {
      if (!MATH_ALLOWED.test(digits)) findings.push({ file, kind: 'number_in_math', value: digits });
    }
    return ' ';
  };
  return text.replace(/\$\$[\s\S]*?\$\$/g, report).replace(/\$[^$\n]*\$/g, report);
}

/**
 * @param {string} raw authored section text
 * @param {string} [file] label for findings
 */
export function scanSection(raw, file = 'section') {
  const findings = [];
  let text = stripMath(stripForScan(resultsInCode(raw, findings, file)), findings, file);
  for (const name of ALLOWED_NAMES) text = text.split(name).join(' ');
  // Ordered-list markers are document structure.
  text = text.replace(/^\s*\d+\.\s/gm, ' ');
  for (const match of text.matchAll(/\d[\d,.]*/g)) {
    findings.push({ file, kind: 'number', value: match[0], context: text.slice(Math.max(0, match.index - 30), match.index + 30).replace(/\s+/g, ' ').trim() });
  }
  for (const match of text.matchAll(SPELLED_COUNT)) {
    if (!ALLOWED_SPELLED.includes(match[0].toLowerCase())) {
      findings.push({ file, kind: 'spelled_count', value: match[0] });
    }
  }
  for (const pattern of [SPELLED_PERCENT, SPELLED_FOLD]) {
    for (const match of text.matchAll(pattern)) findings.push({ file, kind: 'spelled_value', value: match[0] });
  }
  return findings;
}

/** The title-page strings a reader sees. Identifiers such as the ORCID are not prose. */
const CONFIG_PROSE_KEY = /^\s*(?:title|subtitle|description|abstract)\s*:\s*(.*)$/gm;

/**
 * @param {string} raw config.yaml text
 * @param {string} [file]
 */
export function scanConfig(raw, file = 'config.yaml') {
  return [...raw.matchAll(CONFIG_PROSE_KEY)].flatMap(([, value]) => scanSection(value, file));
}

/** @param {string} sourceDir authored manuscript directory */
export function scanManuscript(sourceDir) {
  const sections = listSectionFiles(sourceDir).flatMap((name) => scanSection(fs.readFileSync(path.join(sourceDir, name), 'utf8'), name));
  const config = path.join(sourceDir, 'config.yaml');
  return fs.existsSync(config) ? [...sections, ...scanConfig(fs.readFileSync(config, 'utf8'))] : sections;
}
