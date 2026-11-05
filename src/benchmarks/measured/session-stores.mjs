/**
 * The session stores compared by the measured benchmarks.
 *
 * Every condition starts from per-session wire text, as a server receiving request
 * bodies would, so nothing shares memory by accident. Conditions keep only what
 * their design retains; everything else becomes garbage before the heap is read.
 *
 *   duplicated   one fully parsed object per session
 *   aliased      parsed, then shared fields point at one object: a plain JavaScript
 *                reference, and the baseline a template engine must beat in memory
 *   tiny         one registered template plus per-session expressions, via the engine
 *   exact_cache  one parsed object per distinct wire text
 *
 * Two ablations separate the idea from this implementation of it:
 *
 *   tiny_compact  the template plus bare deltas, without the per-session wrapper
 *   tiny_noclone  the shipped store, materialized without `structuredClone`
 */
import { createHash } from 'node:crypto';
import { createTemplateCatalog, encodeExpression, reconstructExpression } from '../../engine/rhyming/index.mjs';
import { buildAiContextWorkload } from '../../experiments/f-ai-context.mjs';
import {
  RHYME_PATTERN,
  differingWordSessions,
  identicalTextSessions,
} from '../../experiments/rhyme-vs-cache.mjs';

const parseAll = (wires) => wires.map((wire) => JSON.parse(wire));

/** `mergeDelta` with no cloning: the same result, sharing the template's own objects. */
function mergeWithoutClone(base, delta) {
  const isPlain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!isPlain(base) || !isPlain(delta)) return delta;
  const out = { ...base };
  for (const key of Object.keys(delta)) {
    if (delta[key]?.__missing === true) delete out[key];
    else out[key] = mergeWithoutClone(base[key], delta[key]);
  }
  return out;
}

function exactCache(wires) {
  const byDigest = new Map();
  const entries = wires.map((wire) => {
    const digest = createHash('sha256').update(wire).digest('hex');
    if (!byDigest.has(digest)) byDigest.set(digest, JSON.parse(wire));
    return digest;
  });
  return { byDigest, entries };
}

const exactCacheMaterialize = (store, i) => JSON.stringify(store.byDigest.get(store.entries[i]));
const plainMaterialize = (store, i) => JSON.stringify(store[i]);

const aiContext = {
  wires: ({ sessions, seed, turns }) =>
    buildAiContextWorkload(seed, sessions, turns).conventional.map((session) => JSON.stringify(session)),
  build: {
    duplicated: parseAll,
    aliased(wires) {
      const parsed = parseAll(wires);
      const shared = parsed[0].messages[0];
      for (const session of parsed) session.messages[0] = shared;
      return parsed;
    },
    tiny(wires) {
      const parsed = parseAll(wires);
      const catalog = createTemplateCatalog();
      catalog.register({ id: 'tpl_sys', pattern: parsed[0].messages[0] });
      const sessions = parsed.map((p) => ({ session: p.session, systemRef: 'tpl_sys', turns: p.messages.slice(1) }));
      return { catalog, sessions };
    },
    exact_cache: exactCache,
  },
  materialize: {
    duplicated: plainMaterialize,
    aliased: plainMaterialize,
    tiny(store, i) {
      // Serialize-only path: skip structuredClone (Daniel: clone dominated rebuild latency).
      const entry = store.sessions[i];
      const system = reconstructExpression(
        store.catalog,
        { templateId: entry.systemRef, delta: {} },
        { clone: false },
      );
      return JSON.stringify({ session: entry.session, messages: [system, ...entry.turns] });
    },
    tiny_noclone(store, i) {
      const entry = store.sessions[i];
      const system = store.catalog.get(entry.systemRef).pattern;
      return JSON.stringify({ session: entry.session, messages: [system, ...entry.turns] });
    },
    exact_cache: exactCacheMaterialize,
  },
  serializable: {
    duplicated: (store) => store,
    aliased: (store) => store,
    tiny: (store) => ({ template: store.catalog.get('tpl_sys'), sessions: store.sessions }),
    exact_cache: (store) => ({ records: [...store.byDigest.values()], entries: store.entries }),
  },
};

function rhymeWorkload(makeSessions) {
  const buildCatalog = () => {
    const catalog = createTemplateCatalog();
    catalog.register({ id: 'tpl_rhyme_v1', pattern: JSON.parse(JSON.stringify(RHYME_PATTERN)), reconstruction: 'merge_delta' });
    return catalog;
  };
  return {
    wires: ({ sessions }) => makeSessions(sessions).map((session) => JSON.stringify(session)),
    build: {
      duplicated: parseAll,
      aliased(wires) {
        const parsed = parseAll(wires);
        const first = parsed[0];
        // Fields that hold the same value in every session point at the first session's copy.
        for (const key of Object.keys(first)) {
          const text = JSON.stringify(first[key]);
          if (parsed.every((session) => JSON.stringify(session[key]) === text)) {
            for (const session of parsed) session[key] = first[key];
          }
        }
        return parsed;
      },
      tiny(wires) {
        const parsed = parseAll(wires);
        const catalog = buildCatalog();
        const template = catalog.get('tpl_rhyme_v1');
        const expressions = parsed.map((item) => encodeExpression(template.id, template.pattern, item));
        return { catalog, expressions };
      },
      tiny_compact(wires) {
        const parsed = parseAll(wires);
        const catalog = buildCatalog();
        const template = catalog.get('tpl_rhyme_v1');
        const deltas = parsed.map((item) => encodeExpression(template.id, template.pattern, item).delta);
        return { catalog, deltas };
      },
      exact_cache: exactCache,
    },
    materialize: {
      duplicated: plainMaterialize,
      aliased: plainMaterialize,
      tiny: (store, i) =>
        JSON.stringify(reconstructExpression(store.catalog, store.expressions[i], { clone: false })),
      tiny_noclone(store, i) {
        const encoded = store.expressions[i];
        return JSON.stringify(mergeWithoutClone(store.catalog.get(encoded.templateId).pattern, encoded.delta));
      },
      exact_cache: exactCacheMaterialize,
    },
    serializable: {
      duplicated: (store) => store,
      aliased: (store) => store,
      tiny: (store) => ({ template: store.catalog.get('tpl_rhyme_v1'), expressions: store.expressions }),
      tiny_compact: (store) => ({ template: store.catalog.get('tpl_rhyme_v1'), deltas: store.deltas }),
      exact_cache: (store) => ({ records: [...store.byDigest.values()], entries: store.entries }),
    },
  };
}

/** The store each materialization condition reads; `tiny_noclone` reuses the shipped store. */
export function buildConditionFor(condition) {
  return condition === 'tiny_noclone' ? 'tiny' : condition;
}

export const WORKLOADS = Object.freeze({
  ai_context: aiContext,
  rhyme_differing: rhymeWorkload(differingWordSessions),
  rhyme_identical: rhymeWorkload(identicalTextSessions),
});

/** @param {string} name */
export function getWorkload(name) {
  const workload = WORKLOADS[name];
  if (!workload) throw new Error(`unknown workload: ${name}`);
  return workload;
}
