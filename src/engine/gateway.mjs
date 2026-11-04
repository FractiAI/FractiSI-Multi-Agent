/**
 * Tiny Gateway core: request -> template -> selective reconstruct -> execute.
 *
 * Known limit: `validateEqual` compares against `encoded.__expect` and is
 * trivially true when that field is absent. No experiment relies on it.
 */
import { createTemplateCatalog, encodeExpression, reconstructExpression, deepEqual } from './rhyming/index.mjs';
import { createVectorStore } from './vectors/store.mjs';

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
