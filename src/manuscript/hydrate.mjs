/**
 * Hydrate authored sections into output/manuscript/. Fail-closed: an unknown token,
 * an unused token, or an unresolved token after substitution stops the build. The
 * template's shared injector only warns, so this is the project's completeness proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify, sha256 } from '../core/canonical-json.mjs';

/** Repository documentation that lives beside sections and is never rendered. */
export const DOC_FILES = Object.freeze(['AGENTS.md', 'README.md', 'SYNTAX.md', 'MANUSCRIPT_STATUS.md']);
const AUXILIARY_FILES = Object.freeze(['preamble.md']);
const TOKEN = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

/** @param {string} sourceDir */
export function listSectionFiles(sourceDir) {
  return fs
    .readdirSync(sourceDir)
    .filter((name) => name.endsWith('.md') && !DOC_FILES.includes(name) && !AUXILIARY_FILES.includes(name))
    .sort();
}

/**
 * @param {string} text
 * @param {Record<string, string>} variables
 * @param {Set<string>} [used] collects tokens seen
 */
export function substitute(text, variables, used = new Set()) {
  const unknown = [];
  const resolved = text.replace(TOKEN, (match, token) => {
    used.add(token);
    if (!(token in variables)) {
      unknown.push(token);
      return match;
    }
    return variables[token];
  });
  return { resolved, unknown };
}

/**
 * Compute the hydrated tree in memory.
 *
 * @param {object} options
 * @param {string} options.sourceDir authored manuscript directory
 * @param {Record<string, string>} options.variables
 */
export function hydrateSections({ sourceDir, variables }) {
  const used = new Set();
  const unknown = {};
  const sections = {};
  for (const name of [...listSectionFiles(sourceDir), 'config.yaml']) {
    const { resolved, unknown: missing } = substitute(fs.readFileSync(path.join(sourceDir, name), 'utf8'), variables, used);
    if (missing.length > 0) unknown[name] = [...new Set(missing)];
    sections[name] = resolved;
  }
  if (Object.keys(unknown).length > 0) throw new Error(`unknown manuscript tokens: ${JSON.stringify(unknown)}`);
  const unused = Object.keys(variables).filter((token) => !used.has(token));
  if (unused.length > 0) throw new Error(`catalog tokens no section uses: ${unused.join(', ')}`);
  for (const [name, content] of Object.entries(sections)) {
    if (TOKEN.test(content)) throw new Error(`token survived hydration in ${name}`);
    TOKEN.lastIndex = 0;
  }
  return sections;
}

/**
 * @param {object} options
 * @param {string} options.sourceDir
 * @param {string} options.outDir hydrated manuscript directory
 * @param {Record<string, string>} options.variables
 * @param {Record<string, string>} options.bindings extra hashes to record in the manifest
 */
export function writeHydratedManuscript({ sourceDir, outDir, variables, bindings = {} }) {
  const sections = hydrateSections({ sourceDir, variables });
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of fs.readdirSync(outDir)) {
    // Stale sections must not survive into a render. Folder guides stay.
    if (name.endsWith('.md') && !DOC_FILES.includes(name)) fs.rmSync(path.join(outDir, name));
  }
  for (const [name, content] of Object.entries(sections)) fs.writeFileSync(path.join(outDir, name), content);
  for (const name of ['preamble.md', 'references.bib']) fs.copyFileSync(path.join(sourceDir, name), path.join(outDir, name));
  const manifest = {
    schema: 'tiny-footprint-hydration/v1',
    authored: Object.fromEntries(Object.keys(sections).map((name) => [name, sha256(fs.readFileSync(path.join(sourceDir, name)))])),
    hydrated: Object.fromEntries(Object.entries(sections).map(([name, content]) => [name, sha256(content)])),
    bindings,
  };
  fs.writeFileSync(path.join(outDir, 'hydration_manifest.json'), canonicalStringify(manifest));
  return manifest;
}
