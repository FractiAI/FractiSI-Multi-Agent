/**
 * Rhyming Template catalog: reusable organizational patterns, frozen on
 * registration and matched by shape.
 */
import { shapeKeysMatch } from './shape.mjs';

export function createTemplateCatalog() {
  /** @type {Map<string, object>} */
  const templates = new Map();
  return {
    register(template) {
      if (!template?.id || !template?.pattern) throw new Error('invalid template');
      templates.set(template.id, Object.freeze({ ...template }));
      return template.id;
    },
    get(id) {
      return templates.get(id) || null;
    },
    has(id) {
      return templates.has(id);
    },
    size() {
      return templates.size;
    },
    /** Structural match: same pattern keys + types (not superficial string equality). */
    findMatch(shape) {
      for (const t of templates.values()) {
        if (shapeKeysMatch(t.pattern, shape)) return t;
      }
      return null;
    },
    all() {
      return [...templates.values()];
    },
  };
}
