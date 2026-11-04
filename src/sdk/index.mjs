/**
 * Tiny Footprint SDK, Workstation 0.1. Wires to the Tiny Gateway rhyming-template engine.
 * The context and energy exports are in-process lab meters, not device claims.
 */
import { createRecursiveContextBuffer } from '../engine/context/buffer.mjs';
import { createCompressionHookRegistry, nestedDeltaFoldHook, octaveScaleCapHook, workingSetBoundHook } from '../engine/context/hooks.mjs';
import { createEnergyModel, scaleUnderBudget } from '../engine/energy/proxy.mjs';
import { createGateway } from '../engine/gateway.mjs';
import { createTemplateCatalog } from '../engine/rhyming/catalog.mjs';
import { deepEqual, encodeExpression, reconstructExpression, reconstructExpressionWithState } from '../engine/rhyming/codec.mjs';
import { FOUR_PILLARS, auditRhyme, brickWallCandidate, isRhyme, trueRhymeCandidate } from '../engine/rhyming/gate.mjs';
import { rankPartialRhymes, rhymeScore, routeBySignature, structuralDistance } from '../engine/rhyming/route.mjs';
import { shapesRhyme, structuralSignature } from '../engine/rhyming/shape.mjs';

export const PRODUCT = 'Tiny Footprint';
export const VERSION = '0.1.0';

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

export function discover(shape) {
  return defaultCatalog.findMatch(shape);
}

export function routeTemplate(shape, opts = {}) {
  return defaultCatalog.routeTemplate(shape, opts);
}

export function createContextBuffer(opts = {}) {
  return createRecursiveContextBuffer(opts);
}

export function registerCompressionHook(registry, name, handlers) {
  return registry.registerHook(name, handlers);
}

export function withEnergyBudget(plan, budgetJ, model) {
  return scaleUnderBudget(plan, budgetJ, model || createEnergyModel());
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
  routeBySignature,
  rhymeScore,
  structuralDistance,
  rankPartialRhymes,
  createCompressionHookRegistry,
  nestedDeltaFoldHook,
  octaveScaleCapHook,
  workingSetBoundHook,
  createRecursiveContextBuffer,
  createEnergyModel,
  scaleUnderBudget,
};
