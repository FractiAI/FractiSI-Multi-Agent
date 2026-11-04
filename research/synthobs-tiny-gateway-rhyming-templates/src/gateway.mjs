/**
 * Tiny Gateway core — rhyme-gated template → selective reconstruct → execute.
 */
import {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  deepEqual,
} from './rhyming-template.mjs';
import { createVectorStore } from './nested-vector.mjs';
import { auditRhyme } from './holographic-rhyme-gate.mjs';

export function createGateway(options = {}) {
  const catalog = createTemplateCatalog(options);
  const vectors = createVectorStore();
  const requireRhyme = options.requireRhyme === true;

  return {
    catalog,
    vectors,
    requireRhyme,
    registerTemplate(t, rhymeEvidence = null) {
      let rhymePass = t.rhymePass;
      if (requireRhyme || rhymeEvidence) {
        const audit = auditRhyme(
          rhymeEvidence || {
            pattern: t.pattern,
            expressions: t.expressions,
            nestDepth: t.nestDepth,
            driftBefore: t.driftBefore,
            driftAfter: t.driftAfter,
          },
        );
        if (!audit.pass) {
          const err = new Error(`holographic_rhyme_rejected:${audit.failed.join(',')}`);
          err.audit = audit;
          throw err;
        }
        rhymePass = true;
      }
      return catalog.register({ ...t, rhymePass });
    },
    /**
     * Discover template by organizational rhyme (structural signature).
     * Does not treat exact-text or prefix identity as a match by itself.
     */
    discoverTemplate(shape) {
      return catalog.findMatch(shape);
    },
    ingestExpression(templateId, expression, state = null) {
      const t = catalog.get(templateId);
      if (!t) throw new Error('unknown template');
      return encodeExpression(templateId, t.pattern, expression, state);
    },
    ingestRhyming(expression, state = null) {
      const match = catalog.findMatch(expression);
      if (!match) throw new Error('no_rhyming_template');
      return encodeExpression(match.id, match.pattern, expression, state);
    },
    execute({ operation, templateId, encoded, vectorRoot = null }) {
      if (operation === 'reconstruct') {
        const value = reconstructExpression(catalog, encoded);
        return { ok: true, value };
      }
      if (operation === 'workingSet') {
        const set = vectors.resolveWorkingSet(vectorRoot);
        return { ok: true, value: set, n: set.length };
      }
      if (operation === 'validateEqual') {
        const value = reconstructExpression(catalog, encoded);
        return { ok: deepEqual(value, encoded.__expect || value), value };
      }
      if (operation === 'discover') {
        const hit = catalog.findMatch(encoded);
        return { ok: Boolean(hit), value: hit };
      }
      return { ok: false, error: 'unknown_operation' };
    },
  };
}
