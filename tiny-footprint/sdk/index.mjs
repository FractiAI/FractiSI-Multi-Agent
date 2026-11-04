/**
 * Tiny Footprint SDK · Workstation 0.1
 * Wires to the Tiny Gateway rhyming-template engine (four-pillar rhyme gate).
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PRODUCT = 'Tiny Footprint';
export const VERSION = '0.1.0';

const here = dirname(fileURLToPath(import.meta.url));
const SUITE_CANDIDATES = [
  // Standalone product repo nests research under kit root
  join(here, '../../research/synthobs-tiny-gateway-rhyming-templates/src'),
  // SING 13 monorepo mirror → repo-root research/
  join(here, '../../../../research/synthobs-tiny-gateway-rhyming-templates/src'),
];

function suiteSrc() {
  for (const dir of SUITE_CANDIDATES) {
    if (existsSync(join(dir, 'rhyming-template.mjs'))) return dir;
  }
  throw new Error('Tiny Gateway research suite not found beside Workstation kit');
}

const suiteUrl = (name) => pathToFileURL(join(suiteSrc(), name)).href;

const {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  reconstructExpressionWithState,
  deepEqual,
  structuralSignature,
  shapesRhyme,
} = await import(suiteUrl('rhyming-template.mjs'));
const { auditRhyme, isRhyme, brickWallCandidate, trueRhymeCandidate, FOUR_PILLARS } = await import(
  suiteUrl('holographic-rhyme-gate.mjs')
);
const { createGateway } = await import(suiteUrl('gateway.mjs'));

const defaultCatalog = createTemplateCatalog();

/**
 * @param {string} templateId
 * @param {object} pattern
 * @param {object} [rhymeEvidence] - optional four-pillar evidence (expressions, nestDepth, drift*)
 */
export function registerTemplate(templateId, pattern, rhymeEvidence = null) {
  let rhymePass;
  if (rhymeEvidence) {
    const audit = auditRhyme({ pattern, ...rhymeEvidence });
    if (!audit.pass) {
      const err = new Error(`holographic_rhyme_rejected:${audit.failed.join(',')}`);
      err.audit = audit;
      throw err;
    }
    rhymePass = true;
  }
  defaultCatalog.register({ id: templateId, pattern, rhymePass });
  return {
    templateId,
    pattern,
    registeredAt: new Date().toISOString(),
    structuralSignature: structuralSignature(pattern),
    rhymePass: rhymePass ?? null,
  };
}

/**
 * @param {string} templateId
 * @param {object} expression - full expression that rhymes with the registered pattern
 */
export function sessionDelta(templateId, expression, state = null) {
  const t = defaultCatalog.get(templateId);
  if (!t) throw new Error(`unknown template ${templateId}`);
  const encoded = encodeExpression(templateId, t.pattern, expression, state);
  return { templateId, delta: encoded.delta, kind: 'session_delta', state: encoded.state ?? null };
}

/**
 * Selective reconstruction from template + delta.
 */
export function reconstruct(templateId, delta, opts = {}) {
  const encoded = { templateId, delta: delta || {}, state: opts.state };
  if (opts.withState) {
    return reconstructExpressionWithState(defaultCatalog, encoded);
  }
  const value = reconstructExpression(defaultCatalog, encoded);
  return {
    templateId,
    value,
    workingSet: { patternRef: templateId, delta, selective: true, value, ...opts },
  };
}

export function measureBytes(obj) {
  const json = JSON.stringify(obj);
  if (json === undefined) throw new TypeError('measureBytes requires a JSON-serializable value');
  return Buffer.byteLength(json, 'utf8');
}

export {
  createTemplateCatalog,
  createGateway,
  encodeExpression,
  reconstructExpression,
  deepEqual,
  structuralSignature,
  shapesRhyme,
  auditRhyme,
  isRhyme,
  brickWallCandidate,
  trueRhymeCandidate,
  FOUR_PILLARS,
};

// silence unused in some bundlers
void createRequire;
