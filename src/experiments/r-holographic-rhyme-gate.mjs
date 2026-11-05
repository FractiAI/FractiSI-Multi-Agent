import { createTemplateCatalog, deepEqual, encodeExpression, reconstructExpression } from '../engine/rhyming/index.mjs';
import {
  FOUR_PILLARS,
  auditRhyme,
  brickWallCandidate,
  midOctaveOnlyCandidate,
  trueRhymeCandidate,
} from '../engine/rhyming/gate.mjs';
import { shapesRhyme, structuralSignature } from '../engine/rhyming/shape.mjs';
import { RHYME_PATTERN, compareRhymeToCache, differingWordSessions, identicalTextSessions } from './rhyme-vs-cache.mjs';

/**
 * R · Holographic rhyme gate — four pillars from Net Zero (octave 0) through ascending octaves.
 * Brick wall / schema-only / mid-octave-only / exact-text ≠ rhyme.
 * Prefix-cache reuse remains a separate meter (experiments F/I/J), not a rhyme proof.
 */
export function experimentR_holographicRhymeGate() {
  const differing = differingWordSessions();
  const identical = identicalTextSessions();
  const trueCandidate = trueRhymeCandidate(differing, 2, 0.15);
  const trueAudit = auditRhyme(trueCandidate);
  const brick = brickWallCandidate(40);
  const brickAudit = auditRhyme(brick);

  const schemaOnly = auditRhyme({
    pattern: { a: 1, b: 'x' },
    expressions: [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
    ],
    nestDepth: 0,
  });

  const midOnly = midOctaveOnlyCandidate();
  const midOnlyAudit = auditRhyme(midOnly);

  const vsCacheDiffering = compareRhymeToCache(differing);
  const vsCacheIdentical = compareRhymeToCache(identical);

  let falseMatchRejected = false;
  try {
    const cat = createTemplateCatalog();
    cat.register({ id: 'invoice', pattern: { id: 0, name: '', amount: 0 } });
    cat.register({ id: 'person', pattern: { id: 0, name: '', amount: 0 } });
  } catch (e) {
    falseMatchRejected = /false_match_risk/.test(String(e?.message || e));
  }

  const arrayObjectDistinct =
    structuralSignature({ tags: ['a'] }) !== structuralSignature({ tags: { a: true } }) &&
    !shapesRhyme({ tags: ['a'] }, { tags: { a: true } });

  const base = { meta: { role: 'user', octave: 1 }, utterance: '' };
  const expr = { meta: { role: 'lead', octave: 1 }, utterance: 'q1' };
  const cat = createTemplateCatalog();
  cat.register({ id: 'tpl_nested', pattern: base });
  const enc = encodeExpression('tpl_nested', base, expr);
  const nestedFieldDelta =
    enc.delta?.meta &&
    enc.delta.meta.role === 'lead' &&
    enc.delta.meta.octave === undefined &&
    deepEqual(reconstructExpression(cat, enc), expr);

  const pass =
    trueAudit.pass &&
    trueAudit.netZeroRoot === true &&
    Array.isArray(trueAudit.octaveSpan) &&
    trueAudit.octaveSpan.includes(0) &&
    FOUR_PILLARS.every((p) => trueAudit.pillars[p]?.pass) &&
    !brickAudit.pass &&
    brickAudit.failed.includes('self_similar') &&
    !schemaOnly.pass &&
    !midOnlyAudit.pass &&
    midOnlyAudit.failed.includes('recursive') &&
    midOnlyAudit.pillars.recursive?.reason === 'missing_net_zero_octave_0_root' &&
    vsCacheDiffering.equivalent &&
    vsCacheDiffering.rhymeAuditPass &&
    vsCacheDiffering.netZeroRoot === true &&
    vsCacheDiffering.rhymeBytes < vsCacheDiffering.cacheBytes &&
    vsCacheIdentical.equivalent &&
    vsCacheIdentical.cacheBytes < vsCacheIdentical.rhymeBytes &&
    falseMatchRejected &&
    arrayObjectDistinct &&
    nestedFieldDelta;

  return {
    id: 'R_holographic_rhyme_gate',
    title: 'Holographic rhyme gate (Net Zero → octaves · four pillars · mid-octave-only fails)',
    trueAudit,
    brickAudit,
    schemaOnly,
    midOnlyAudit,
    vsCacheDiffering: {
      rhymeBytes: vsCacheDiffering.rhymeBytes,
      cacheBytes: vsCacheDiffering.cacheBytes,
      equivalent: vsCacheDiffering.equivalent,
      netZeroRoot: vsCacheDiffering.netZeroRoot,
      octaveSpan: vsCacheDiffering.octaveSpan,
    },
    vsCacheIdentical: {
      rhymeBytes: vsCacheIdentical.rhymeBytes,
      cacheBytes: vsCacheIdentical.cacheBytes,
      equivalent: vsCacheIdentical.equivalent,
    },
    falseMatchRejected,
    arrayObjectDistinct,
    nestedFieldDelta,
    pattern: RHYME_PATTERN,
    pass,
    honesty:
      'Four-pillar catalog audit rooted at Net Zero (octave 0) through ascending octaves. Brick wall / schema-only / mid-octave-only / exact-text cache are contrast cases. Shared-prefix GPU labs are prefix-reuse meters, not rhyme proofs.',
  };
}
