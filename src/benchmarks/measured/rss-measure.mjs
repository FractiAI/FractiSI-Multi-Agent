/**
 * Resident set size, in the process running it: what the operating system sees.
 *
 * Reading RSS after building sessions on the JS heap is confounded, because V8 keeps
 * committed pages after collecting garbage, so the "before" reading already contains
 * them. Here all wire text sits in one off-heap Buffer, sessions are ingested one at
 * a time as a server would receive them, and the store is the first thing to grow.
 * Requires `node --expose-gc`.
 */
import fs from 'node:fs';
import { createTemplateCatalog } from '../../engine/rhyming/index.mjs';
import { baselineMemory, settledMemory } from './heap-measure.mjs';

const NEWLINE = 10;

function forEachWire(buffer, visit) {
  let start = 0;
  while (start < buffer.length) {
    const found = buffer.indexOf(NEWLINE, start);
    const end = found === -1 ? buffer.length : found;
    visit(JSON.parse(buffer.toString('utf8', start, end)));
    start = end + 1;
  }
}

/** Count without parsing, so the count itself cannot raise the peak it sits beside. */
function countWires(buffer) {
  let count = 0;
  for (let start = 0; start < buffer.length; count += 1) {
    const found = buffer.indexOf(NEWLINE, start);
    start = found === -1 ? buffer.length : found + 1;
  }
  return count;
}

export const RSS_INGEST = Object.freeze({
  duplicated(buffer) {
    const store = [];
    forEachWire(buffer, (session) => store.push(session));
    return store;
  },
  aliased(buffer) {
    const store = [];
    let shared = null;
    forEachWire(buffer, (session) => {
      shared ??= session.messages[0];
      session.messages[0] = shared;
      store.push(session);
    });
    return store;
  },
  tiny(buffer) {
    const catalog = createTemplateCatalog();
    const sessions = [];
    forEachWire(buffer, (session) => {
      if (!catalog.has('tpl_sys')) catalog.register({ id: 'tpl_sys', pattern: session.messages[0] });
      sessions.push({ session: session.session, systemRef: 'tpl_sys', turns: session.messages.slice(1) });
    });
    return { catalog, sessions };
  },
});

/**
 * @param {object} spec
 * @param {string} spec.condition
 * @param {string} spec.wiresPath newline-delimited wire text, written by the parent
 */
export function measureRss(spec) {
  if (typeof globalThis.gc !== 'function') throw new Error('RSS measurement requires node --expose-gc');
  const ingest = RSS_INGEST[spec.condition];
  if (!ingest) throw new Error(`unknown condition: ${spec.condition}`);
  const buffer = fs.readFileSync(spec.wiresPath);
  const before = baselineMemory();
  const store = ingest(buffer);
  const after = settledMemory();
  // Read after the reading, so the store cannot be collected before it, and checked so
  // that a store which lost sessions cannot report a small footprint.
  const heldSessions = (store.sessions ?? store).length;
  const wireCount = countWires(buffer);
  if (heldSessions !== wireCount) throw new Error(`store holds ${heldSessions} of ${wireCount} sessions`);
  const { wiresPath, ...identity } = spec;
  return {
    ...identity,
    heldSessions,
    rssDelta: after.rss - before.rss,
    heapUsedDelta: after.heapUsed - before.heapUsed,
    peakRssBytes: process.resourceUsage().maxRSS * 1024,
    baselineRssBytes: before.rss,
  };
}
