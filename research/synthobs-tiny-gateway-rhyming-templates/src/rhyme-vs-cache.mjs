/**
 * Rhyme versus exact-text cache.
 *
 * A holographic rhyme matches organization (four-pillar gate + structural signature).
 * An exact cache hits only when the stored text is identical.
 * Byte counts are UTF-8 JSON, in process. Not a GPU measurement.
 */
import {
  createTemplateCatalog,
  encodeExpression,
  reconstructExpression,
  deepEqual,
} from './rhyming-template.mjs';
import { auditRhyme, trueRhymeCandidate } from './holographic-rhyme-gate.mjs';
import { bytesOf, reduction } from './memory.mjs';
import { PHI_EGS } from './constants.mjs';

export const RHYME_SESSIONS = 40;

/** Nested self-similar organization — required for four-pillar rhyme. */
export const RHYME_PATTERN = {
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

function session(i, utterance) {
  return {
    kind: 'session',
    schema: 'rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: {
      kind: 'session',
      role: i % 9 === 0 ? 'lead' : 'user',
      octave: (i % 7) + 1,
    },
    utterance,
  };
}

export function differingWordSessions() {
  return Array.from({ length: RHYME_SESSIONS }, (_, i) =>
    session(i, `question ${i} about a different matter, number ${(i * 17) % 1000}`),
  );
}

export function identicalTextSessions() {
  return Array.from({ length: RHYME_SESSIONS }, () =>
    session(0, 'the same question repeated in every session'),
  );
}

function exactCache(items) {
  const unique = new Map();
  for (const item of items) unique.set(JSON.stringify(item), item);
  return [...unique.values()];
}

function rhymeStore(items) {
  const candidate = trueRhymeCandidate(items, 2, 0.15);
  const audit = auditRhyme(candidate);
  if (!audit.pass) {
    throw new Error(`rhyme cohort failed four-pillar audit: ${audit.failed.join(',')}`);
  }
  const catalog = createTemplateCatalog();
  catalog.register({
    id: 'tpl_rhyme_v1',
    pattern: RHYME_PATTERN,
    reconstruction: 'merge_delta',
    rhymePass: audit.pass,
    nestDepth: 2,
  });
  const expressions = items.map((item) => {
    const match = catalog.findMatch(item);
    if (!match) throw new Error('shape did not rhyme');
    return encodeExpression(match.id, match.pattern, item);
  });
  return { catalog, stored: { template: catalog.get('tpl_rhyme_v1'), expressions }, audit };
}

export function compareRhymeToCache(items) {
  const naiveBytes = bytesOf(items);
  const cacheBytes = bytesOf(exactCache(items));
  const rhyme = rhymeStore(items);
  const rhymeBytes = bytesOf(rhyme.stored);
  const equivalent = rhyme.stored.expressions.every((encoded, i) =>
    deepEqual(reconstructExpression(rhyme.catalog, encoded), items[i]),
  );
  const seen = new Set();
  let exactTextHits = 0;
  for (const item of items) {
    const text = JSON.stringify(item);
    if (seen.has(text)) exactTextHits += 1;
    seen.add(text);
  }
  return {
    sessions: items.length,
    shapeHits: items.length,
    exactTextHits,
    equivalent,
    rhymeAuditPass: rhyme.audit.pass,
    naiveBytes,
    cacheBytes,
    rhymeBytes,
    rhymeVersusNaive: reduction(naiveBytes, rhymeBytes).ratio,
    cacheVersusNaive: reduction(naiveBytes, cacheBytes).ratio,
    rhymeVersusCache: reduction(cacheBytes, rhymeBytes).ratio,
    phiEgs: PHI_EGS,
  };
}
