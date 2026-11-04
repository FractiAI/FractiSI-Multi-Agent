/**
 * Holographic rhyme gate for Rhyming Templates.
 *
 * Canonical SING 13 filing (docs/SYNTHOBS_HOLOGRAPHIC_RHYME_FRACTAL_EGS_2026-09.md):
 * a rhyme is motion grammar — repeating · self-similar · self-correcting · recursive
 * under Φ_EGS. Schema-key match or exact-text identity alone is not a rhyme
 * (brick wall fails the audit).
 *
 * Catalog / architectural fixture only — not Mandelbrot retirement or physics QED.
 */
import { PHI_EGS } from './constants.mjs';
import { structuralSignature, shapesRhyme } from './rhyming-template.mjs';

export const FOUR_PILLARS = Object.freeze([
  'repeating',
  'self_similar',
  'self_correcting',
  'recursive',
]);

/**
 * @typedef {object} RhymeCandidate
 * @property {object} pattern - organizational blueprint
 * @property {object[]} [expressions] - instances of the organization
 * @property {number} [nestDepth] - recursive nesting depth achieved (>=1 for recursive)
 * @property {number} [driftBefore] - injected organizational drift
 * @property {number} [driftAfter] - drift after correction / rejection dampening
 */

/**
 * Local nested blueprint: first plain-object field that itself carries organization.
 * Self-similarity requires a local part that mirrors the whole's structural grammar.
 */
export function localBlueprint(pattern) {
  if (!pattern || typeof pattern !== 'object' || Array.isArray(pattern)) return null;
  for (const key of Object.keys(pattern).sort()) {
    const v = pattern[key];
    if (v && typeof v === 'object' && !Array.isArray(v) && v !== null) {
      return v;
    }
  }
  return null;
}

function hasNestedMirror(pattern) {
  const local = localBlueprint(pattern);
  if (!local) return false;
  // Local part must share at least one organizational key with the whole
  // and expose its own nested structure or a kind/schema echo of the parent.
  const parentKeys = new Set(Object.keys(pattern));
  const localKeys = Object.keys(local);
  const shared = localKeys.filter((k) => parentKeys.has(k));
  if (shared.length === 0) return false;
  // Mirror strength: structural signature of local is a coherent object grammar
  // (not a leaf bag of primitives only) OR shares kind/schema with parent.
  const localSig = structuralSignature(local);
  if (localSig.startsWith('{') && localSig.includes(':')) {
    if ('kind' in pattern && 'kind' in local && pattern.kind === local.kind) return true;
    if ('schema' in pattern && 'schema' in local) return true;
    // Nested object that reuses parent organizational keys counts as mirror grammar
    return shared.length >= 1 && localKeys.length >= 2;
  }
  return false;
}

function pillarRepeating(candidate) {
  const exprs = candidate.expressions || [];
  if (exprs.length < 2) {
    return { pass: false, reason: 'need_at_least_two_expressions' };
  }
  const allShape = exprs.every((e) => shapesRhyme(candidate.pattern, e));
  if (!allShape) {
    return { pass: false, reason: 'expressions_do_not_share_organization' };
  }
  return { pass: true, n: exprs.length };
}

function pillarSelfSimilar(candidate) {
  if (!hasNestedMirror(candidate.pattern)) {
    return { pass: false, reason: 'no_local_blueprint_mirroring_whole' };
  }
  const local = localBlueprint(candidate.pattern);
  // Local fingerprint must be a proper object grammar (holographic part→whole)
  const ok = Boolean(local && structuralSignature(local).startsWith('{'));
  return ok
    ? { pass: true, localSignature: structuralSignature(local) }
    : { pass: false, reason: 'local_blueprint_not_organizational' };
}

function pillarRecursive(candidate) {
  const depth = Number(candidate.nestDepth ?? 0);
  if (!(depth >= 1)) {
    return { pass: false, reason: 'nest_depth_below_one' };
  }
  // Ascending spiral lock: depth must be finite and strictly positive (not a dead loop flag)
  if (candidate.deadLoop === true) {
    return { pass: false, reason: 'closed_dead_loop' };
  }
  return { pass: true, nestDepth: depth };
}

function pillarSelfCorrecting(candidate) {
  const before = candidate.driftBefore;
  const after = candidate.driftAfter;
  if (typeof before !== 'number' || typeof after !== 'number') {
    // Default catalog dampener: Φ^{-2} toward zero when drift was demonstrated
    if (typeof before === 'number' && after == null) {
      const corrected = before / PHI_EGS ** 2;
      return {
        pass: corrected < before && corrected > 0,
        driftBefore: before,
        driftAfter: corrected,
        appliedDefaultDampener: true,
      };
    }
    return { pass: false, reason: 'drift_correction_not_demonstrated' };
  }
  if (!(after < before && after >= 0)) {
    return { pass: false, reason: 'drift_not_dampened' };
  }
  return { pass: true, driftBefore: before, driftAfter: after };
}

/**
 * Four-pillar holographic rhyme audit.
 * All four must pass — one pillar is coincidence (brick wall repeats only).
 */
export function auditRhyme(candidate) {
  if (!candidate?.pattern || typeof candidate.pattern !== 'object') {
    return {
      pass: false,
      pillars: {},
      failed: FOUR_PILLARS.slice(),
      reason: 'missing_pattern',
    };
  }
  const pillars = {
    repeating: pillarRepeating(candidate),
    self_similar: pillarSelfSimilar(candidate),
    recursive: pillarRecursive(candidate),
    self_correcting: pillarSelfCorrecting(candidate),
  };
  const failed = FOUR_PILLARS.filter((p) => !pillars[p].pass);
  return {
    pass: failed.length === 0,
    pillars,
    failed,
    honesty:
      'Catalog motion-grammar audit for Rhyming Templates — not a claim that schema match or prefix cache is a rhyme.',
  };
}

export function isRhyme(candidate) {
  return auditRhyme(candidate).pass;
}

/** Brick-wall cohort: repeats, but is not self-similar / recursive / self-correcting. */
export function brickWallCandidate(n = 40) {
  const pattern = { unit: 'brick', index: 0 };
  const expressions = Array.from({ length: n }, (_, i) => ({ unit: 'brick', index: i }));
  return { pattern, expressions, nestDepth: 0 };
}

/**
 * True rhyme cohort: nested self-similar organization, multi-expression repeat,
 * recursive nest depth, and demonstrated drift dampening.
 */
export function trueRhymeCandidate(expressions, nestDepth = 2, driftBefore = 0.15) {
  const pattern = {
    kind: 'session',
    schema: 'rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: {
      kind: 'session',
      role: 'user',
      octave: 1,
    },
    utterance: '',
  };
  return {
    pattern,
    expressions,
    nestDepth,
    driftBefore,
    driftAfter: driftBefore / PHI_EGS ** 2,
  };
}
