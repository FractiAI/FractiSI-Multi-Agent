/**
 * The manuscript's formal statements, listed for the template's evidence registry.
 *
 * The renderer resolves `[@prop:x]` to the statement authored in a
 * `::: {.proposition #prop:x}` block, while the registry reads any such reference as a
 * bibliographic citation. Deriving this ledger from the authored blocks gives the
 * registry a fact per statement, bound to the file that defines it, so a reference to
 * a statement nobody wrote still fails validation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canonicalStringify } from '../core/canonical-json.mjs';
import { PATHS, REPO_ROOT } from '../core/paths.mjs';

/** The name has to contain "claim" and "ledger" for the registry to read it. */
export const FORMALISM_LEDGER_NAME = 'formalism_claim_ledger.json';

const FORMAL_BLOCK = /^:::\s*\{\.[A-Za-z]+\s+#((?:alg|conj|def|inv|prop|thm):[A-Za-z0-9_-]+)\s*\}/gm;
const SOURCE_PREFIX = path.relative(REPO_ROOT, PATHS.manuscriptSource).split(path.sep).join('/');

/** @param {string} sourceDir authored manuscript folder */
export function buildFormalismLedger(sourceDir = PATHS.manuscriptSource) {
  const claims = [];
  for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md')).sort()) {
    const text = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    for (const [, label] of text.matchAll(FORMAL_BLOCK)) {
      claims.push({ id: label, kind: 'citation', value: label, source_path: `${SOURCE_PREFIX}/${file}` });
    }
  }
  return { schema: 'tiny-footprint-formalism-ledger/v1', claims };
}

/**
 * @param {string} dataDir
 * @param {string} [sourceDir]
 * @returns {number} statements listed
 */
export function writeFormalismLedger(dataDir, sourceDir = PATHS.manuscriptSource) {
  const ledger = buildFormalismLedger(sourceDir);
  fs.writeFileSync(path.join(dataDir, FORMALISM_LEDGER_NAME), canonicalStringify(ledger));
  return ledger.claims.length;
}
