/**
 * Rhyme versus exact-text cache.
 *
 * A rhyme matches organization: the same fields and the same kinds of values.
 * An exact cache hits only when the stored text is identical.
 * Byte counts are UTF-8 JSON, in process. Not a GPU measurement.
 */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { createTemplateCatalog, deepEqual, encodeExpression, reconstructExpression } from '../engine/rhyming/index.mjs';

export const RHYME_SESSIONS = 40;

export const RHYME_PATTERN = {
  kind: 'session',
  schema: 'rhyme_v1',
  motion: 'repeat-mirror-recurse-correct',
  role: 'user',
  octave: 1,
  utterance: '',
};

function session(i, utterance) {
  return {
    kind: 'session',
    schema: 'rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    role: i % 9 === 0 ? 'lead' : 'user',
    octave: (i % 7) + 1,
    utterance,
  };
}

export function differingWordSessions(sessions = RHYME_SESSIONS) {
  return Array.from({ length: sessions }, (_, i) =>
    session(i, `question ${i} about a different matter, number ${(i * 17) % 1000}`),
  );
}

export function identicalTextSessions(sessions = RHYME_SESSIONS) {
  return Array.from({ length: sessions }, () =>
    session(0, 'the same question repeated in every session'),
  );
}

/**
 * Sessions of which `duplicateFraction` repeat one identical record and the rest
 * differ, in a deterministic position pattern.
 *
 * @param {number} duplicateFraction in [0, 1]
 * @param {number} [sessions]
 */
export function mixedSessions(duplicateFraction, sessions = RHYME_SESSIONS) {
  if (!(duplicateFraction >= 0 && duplicateFraction <= 1)) {
    throw new RangeError(`duplicateFraction out of range: ${duplicateFraction}`);
  }
  const duplicates = Math.round(duplicateFraction * sessions);
  const differing = differingWordSessions(sessions);
  const repeated = session(0, 'the same question repeated in every session');
  return differing.map((item, i) => (i < duplicates ? repeated : item));
}

function exactCache(items) {
  const unique = new Map();
  for (const item of items) unique.set(JSON.stringify(item), item);
  return [...unique.values()];
}

function rhymeStore(items) {
  const catalog = createTemplateCatalog();
  catalog.register({ id: 'tpl_rhyme_v1', pattern: RHYME_PATTERN, reconstruction: 'merge_delta' });
  const expressions = items.map((item) => {
    const match = catalog.findMatch(item);
    if (!match) throw new Error('shape did not rhyme');
    return encodeExpression(match.id, match.pattern, item);
  });
  return { catalog, stored: { template: catalog.get('tpl_rhyme_v1'), expressions } };
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
    naiveBytes,
    cacheBytes,
    rhymeBytes,
    rhymeVersusNaive: reduction(naiveBytes, rhymeBytes).ratio,
    cacheVersusNaive: reduction(naiveBytes, cacheBytes).ratio,
    rhymeVersusCache: reduction(cacheBytes, rhymeBytes).ratio,
  };
}
