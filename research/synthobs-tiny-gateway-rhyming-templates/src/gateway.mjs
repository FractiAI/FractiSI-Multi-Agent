/**
 * Tiny Gateway core — request → template → selective reconstruct → execute.
 */
import {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  deepEqual,
} from './rhyming-template.mjs';
import { createVectorStore } from './nested-vector.mjs';

export function createGateway() {
  const catalog = createTemplateCatalog();
  const vectors = createVectorStore();
  return {
    catalog,
    vectors,
    registerTemplate(t) {
      return catalog.register(t);
    },
    ingestExpression(templateId, expression, state = null) {
      const t = catalog.get(templateId);
      if (!t) throw new Error('unknown template');
      return encodeExpression(templateId, t.pattern, expression, state);
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
      return { ok: false, error: 'unknown_operation' };
    },
  };
}
