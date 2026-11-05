/**
 * Holographic rhyme gate for Rhyming Templates.
 *
 * Canonical SING 13 filing (docs/SYNTHOBS_HOLOGRAPHIC_RHYME_FRACTAL_EGS_2026-09.md ·
 * SYNTHOBS_HOLOGRAPHIC_SINGULARITY_CRYSTAL_NET_ZERO · zero-octave node k=0):
 * a rhyme is motion grammar — repeating · self-similar · self-correcting · recursive
 * under Φ_EGS — rooted at **Net Zero / octave 0** and nested through ascending octaves.
 *
 * Schema-key match, exact-text identity, or a mid-octave leaf nest alone is not a rhyme
 * (brick wall / schema-only / no-Net-Zero fail the audit).
 *
 * Catalog / architectural fixture only — not Mandelbrot retirement or physics QED.
 */
import { shapesRhyme, structuralSignature } from './shape.mjs';

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const NET_ZERO_OCTAVE = 0;

export const FOUR_PILLARS = Object.freeze([
  'repeating',
  'self_similar',
  'self_correcting',
  'recursive',
]);

/**
 * @typedef {object} RhymeCandidate
 * @property {object} pattern - organizational blueprint (must root at Net Zero / octave 0)
 * @property {object[]} [expressions] - instances of the organization
 * @property {number} [nestDepth] - recursive nesting depth (>= measured octave span)
 * @property {number[]} [octaveSpan] - optional declared octave ladder (must include 0)
 * @property {number} [driftBefore] - injected organizational drift
 * @property {number} [driftAfter] - drift after correction toward Net Zero
 */

/** Walk nested plain objects and collect numeric `octave` fields (depth-limited). */
export function collectOctaves(node, out = new Set(), depth = 0) {
  if (!node || typeof node !== 'object' || Array.isArray(node) || depth > 16) return out;
  if (typeof node.octave === 'number' && Number.isFinite(node.octave)) {
    out.add(node.octave);
  }
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      collectOctaves(v, out, depth + 1);
    }
  }
  return out;
}

/** Sorted unique octave ladder on the pattern (and optional candidate.octaveSpan). */
export function measureOctaveSpan(candidate) {
  const set = collectOctaves(candidate?.pattern);
  if (Array.isArray(candidate?.octaveSpan)) {
    for (const o of candidate.octaveSpan) {
      if (typeof o === 'number' && Number.isFinite(o)) set.add(o);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/** True when the pattern roots a Net Zero / zero-octave locus. */
export function hasNetZeroRoot(pattern) {
  if (!pattern || typeof pattern !== 'object') return false;
  const nz = pattern.netZero;
  if (nz && typeof nz === 'object' && !Array.isArray(nz) && nz.octave === NET_ZERO_OCTAVE) {
    return true;
  }
  // Alternate filing: top-level octave: 0 on the pattern itself
  if (pattern.octave === NET_ZERO_OCTAVE) return true;
  return false;
}

/**
 * Local nested blueprint: prefer `organization` (octave ascent), else first nested
 * plain object that is not the Net Zero root leaf alone.
 */
export function localBlueprint(pattern) {
  if (!pattern || typeof pattern !== 'object' || Array.isArray(pattern)) return null;
  if (pattern.organization && typeof pattern.organization === 'object' && !Array.isArray(pattern.organization)) {
    return pattern.organization;
  }
  for (const key of Object.keys(pattern).sort()) {
    if (key === 'netZero') continue;
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
  const parentKeys = new Set(Object.keys(pattern));
  const localKeys = Object.keys(local);
  const shared = localKeys.filter((k) => parentKeys.has(k));
  if (shared.length === 0) return false;
  const localSig = structuralSignature(local);
  if (localSig.startsWith('{') && localSig.includes(':')) {
    if ('kind' in pattern && 'kind' in local && pattern.kind === local.kind) return true;
    if ('schema' in pattern && 'schema' in local) return true;
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
  const ok = Boolean(local && structuralSignature(local).startsWith('{'));
  return ok
    ? { pass: true, localSignature: structuralSignature(local) }
    : { pass: false, reason: 'local_blueprint_not_organizational' };
}

/**
 * Recursive = octave ascension from Net Zero, not a free-declared nestDepth alone.
 * Requires: Net Zero root, octave ladder including 0, measured span >= 1, nestDepth >= span.
 */
function pillarRecursive(candidate) {
  if (candidate.deadLoop === true) {
    return { pass: false, reason: 'closed_dead_loop' };
  }
  if (!hasNetZeroRoot(candidate.pattern)) {
    return { pass: false, reason: 'missing_net_zero_octave_0_root' };
  }
  const span = measureOctaveSpan(candidate);
  if (!span.includes(NET_ZERO_OCTAVE)) {
    return { pass: false, reason: 'octave_span_missing_net_zero' };
  }
  const measuredDepth = span.length >= 2 ? span[span.length - 1] - span[0] : 0;
  if (!(measuredDepth >= 1)) {
    return { pass: false, reason: 'octave_ladder_not_ascending' };
  }
  const depth = Number(candidate.nestDepth ?? measuredDepth);
  if (!(depth >= measuredDepth)) {
    return {
      pass: false,
      reason: 'nest_depth_below_measured_octave_span',
      measuredDepth,
      nestDepth: depth,
      octaveSpan: span,
    };
  }
  return {
    pass: true,
    nestDepth: depth,
    measuredDepth,
    octaveSpan: span,
    netZeroRoot: true,
  };
}

/** Self-correcting = drift dampened toward Net Zero (closer to 0). */
function pillarSelfCorrecting(candidate) {
  const before = candidate.driftBefore;
  let after = candidate.driftAfter;
  let appliedDefaultDampener = false;
  if (typeof before !== 'number') {
    return { pass: false, reason: 'drift_correction_not_demonstrated' };
  }
  if (typeof after !== 'number') {
    after = before / PHI_EGS ** 2;
    appliedDefaultDampener = true;
  }
  // Toward Net Zero: magnitude shrinks and stays non-negative
  if (!(after < before && after >= 0)) {
    return { pass: false, reason: 'drift_not_dampened_toward_net_zero' };
  }
  return {
    pass: true,
    driftBefore: before,
    driftAfter: after,
    towardNetZero: true,
    ...(appliedDefaultDampener ? { appliedDefaultDampener: true } : {}),
  };
}

/**
 * Four-pillar holographic rhyme audit rooted at Net Zero → ascending octaves.
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
    octaveSpan: measureOctaveSpan(candidate),
    netZeroRoot: hasNetZeroRoot(candidate.pattern),
    honesty:
      'Catalog motion-grammar audit: Net Zero (octave 0) → ascending octaves · four pillars. Schema match, mid-octave leaf nest, or prefix cache alone is not a rhyme.',
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
 * Mid-octave-only nest (no Net Zero root) — must fail recursive pillar.
 * Contrast case: structural nesting without starting at octave 0.
 */
export function midOctaveOnlyCandidate(expressions) {
  const pattern = {
    kind: 'session',
    schema: 'rhyme_v1_mid',
    motion: 'repeat-mirror-recurse-correct',
    organization: {
      kind: 'session',
      role: 'user',
      octave: 1,
      organization: { kind: 'session', role: 'lead', octave: 2 },
    },
    utterance: '',
  };
  return {
    pattern,
    expressions: expressions || [
      { ...pattern, organization: { ...pattern.organization, role: 'user' }, utterance: 'a' },
      { ...pattern, organization: { ...pattern.organization, role: 'lead' }, utterance: 'b' },
    ],
    nestDepth: 2,
    driftBefore: 0.15,
    driftAfter: 0.15 / PHI_EGS ** 2,
  };
}

/**
 * True rhyme cohort: Net Zero root (octave 0) · nested self-similar octave ascent ·
 * multi-expression repeat · measured nest depth · drift dampening toward Net Zero.
 */
export function trueRhymeCandidate(expressions, nestDepth = 2, driftBefore = 0.15) {
  const pattern = {
    kind: 'session',
    schema: 'rhyme_v2',
    motion: 'repeat-mirror-recurse-correct',
    netZero: {
      kind: 'session',
      octave: NET_ZERO_OCTAVE,
      role: 'origin',
      equilibrium: true,
    },
    organization: {
      kind: 'session',
      role: 'user',
      octave: 1,
      organization: {
        kind: 'session',
        role: 'lead',
        octave: 2,
      },
    },
    utterance: '',
  };
  const octaveSpan = [0, 1, 2];
  const measuredDepth = 2;
  return {
    pattern,
    expressions,
    nestDepth: Math.max(nestDepth, measuredDepth),
    octaveSpan,
    driftBefore,
    driftAfter: driftBefore / PHI_EGS ** 2,
  };
}
