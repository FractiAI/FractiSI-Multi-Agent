/**
 * Nested vectors — hierarchy + cross-links + octave/node/complement refs.
 */
export function createVectorStore() {
  /** @type {Map<string, object>} */
  const vectors = new Map();
  return {
    put(vec) {
      if (!vec?.id) throw new Error('vector needs id');
      vectors.set(vec.id, vec);
      return vec.id;
    },
    get(id) {
      return vectors.get(id) || null;
    },
    /** Selective reconstruction: only requested id + dependency closure. */
    resolveWorkingSet(rootId, { maxDepth = 8 } = {}) {
      const out = [];
      const seen = new Set();
      const stack = [{ id: rootId, depth: 0 }];
      while (stack.length) {
        const { id, depth } = stack.pop();
        if (seen.has(id) || depth > maxDepth) continue;
        seen.add(id);
        const v = vectors.get(id);
        if (!v) continue;
        out.push(v);
        for (const c of v.children || []) stack.push({ id: c, depth: depth + 1 });
        for (const x of v.cross || []) stack.push({ id: x, depth: depth + 1 });
        if (v.complement) stack.push({ id: v.complement, depth: depth + 1 });
        for (const d of v.deps || []) stack.push({ id: d, depth: depth + 1 });
      }
      return out;
    },
    all() {
      return [...vectors.values()];
    },
    size() {
      return vectors.size;
    },
  };
}
