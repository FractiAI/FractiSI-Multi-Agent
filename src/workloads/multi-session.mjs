/**
 * Reference multi-session workload: duplicated sessions, one shared system prompt, and a rhyme cohort.
 * The shared prompt is prefix reuse, not a rhyme. The cohort shares organization and differs in words.
 * Counts JSON bytes; `tiny benchmark` measures the real heap.
 */
import { performance } from 'node:perf_hooks';
import { auditRhyme, brickWallCandidate, measureBytes, reconstruct, registerTemplate, sessionDelta } from '../sdk/index.mjs';

const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
const DEFAULT_SESSIONS = 12;
const RHYME_TEMPLATE = 'demo_rhyme_v1';
const RHYME_EVIDENCE = { nestDepth: 2, driftBefore: 0.15 };
const MIN_RHYME_SESSIONS = 2;

/** @param {string | undefined} value */
export function parseSessionCount(value) {
  const requested = Number.parseInt(value || String(DEFAULT_SESSIONS), 10);
  return Number.isInteger(requested) && requested > 0 ? requested : DEFAULT_SESSIONS;
}

export function conventionalStore(sessions) {
  const store = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    store.push({ system: SYSTEM, history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = store.reduce((n, x) => n + measureBytes(x), 0);
  return { mode: 'conventional', ms, bytes, sessions };
}

export function prefixReuseStore(sessions) {
  const shared = { system: SYSTEM };
  const deltas = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    deltas.push({ history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = measureBytes(shared) + deltas.reduce((n, x) => n + measureBytes(x), 0);
  return { mode: 'prefix_reuse', ms, bytes, sessions, note: 'identical system string shared once — not a rhyme proof' };
}

/** Sessions with the same nested organization and different words, against the brick-wall contrast. */
export function rhymeCohort(sessions) {
  if (sessions < MIN_RHYME_SESSIONS) {
    return { mode: 'holographic_rhyme', status: 'not_run', reason: 'a rhyme needs at least two sessions', sessions };
  }
  const pattern = {
    kind: 'session',
    schema: RHYME_TEMPLATE,
    motion: 'repeat-mirror-recurse-correct',
    organization: { kind: 'session', role: 'user', octave: 1 },
    utterance: '',
  };
  const expressions = Array.from({ length: sessions }, (_, i) => ({
    kind: 'session',
    schema: RHYME_TEMPLATE,
    motion: 'repeat-mirror-recurse-correct',
    organization: { kind: 'session', role: i % 3 === 0 ? 'lead' : 'user', octave: (i % 5) + 1 },
    utterance: `demo question ${i} about a different matter`,
  }));
  const audit = auditRhyme({ pattern, expressions, ...RHYME_EVIDENCE });
  registerTemplate(RHYME_TEMPLATE, pattern, { expressions, ...RHYME_EVIDENCE, driftAfter: audit.pillars.self_correcting?.driftAfter });
  const t0 = performance.now();
  const encoded = expressions.map((e) => sessionDelta(RHYME_TEMPLATE, e));
  const rebuilt = encoded.map((e) => reconstruct(RHYME_TEMPLATE, e.delta).value);
  const ms = performance.now() - t0;
  const naiveBytes = expressions.reduce((n, x) => n + measureBytes(x), 0);
  const rhymeBytes = measureBytes({
    template: { id: RHYME_TEMPLATE, pattern },
    expressions: encoded.map((e) => ({ templateId: e.templateId, delta: e.delta })),
  });
  return {
    mode: 'holographic_rhyme',
    status: 'ran',
    ms,
    naiveBytes,
    rhymeBytes,
    byteReduction: 1 - rhymeBytes / naiveBytes,
    exact: rebuilt.every((v, i) => JSON.stringify(v) === JSON.stringify(expressions[i])),
    rhymeAuditPass: audit.pass,
    brickWallPass: auditRhyme(brickWallCandidate(sessions)).pass,
    sessions,
  };
}

export function runMultiSessionDemo(sessions = parseSessionCount(process.env.TINY_FOOTPRINT_SESSIONS)) {
  const conventional = conventionalStore(sessions);
  const prefixReuse = prefixReuseStore(sessions);
  return {
    product: 'Tiny Footprint',
    demo: 'multi-session',
    conventional,
    prefixReuse,
    holographicRhyme: rhymeCohort(sessions),
    prefixByteReduction: 1 - prefixReuse.bytes / conventional.bytes,
  };
}

/** A cohort too small to audit is not a failure. One that ran must pass its audit, refuse the brick wall and rebuild exactly. */
export function demoPassed(result) {
  const rhyme = result.holographicRhyme;
  return rhyme.status === 'not_run' || (rhyme.rhymeAuditPass === true && rhyme.brickWallPass === false && rhyme.exact === true);
}

export function demoSummaryLines(result) {
  const { conventional, prefixReuse, holographicRhyme: rhyme } = result;
  return [
    `[demo] prefix-reuse ${(result.prefixByteReduction * 100).toFixed(1)}% · conventional ${conventional.bytes} B → prefix ${prefixReuse.bytes} B`,
    rhyme.status === 'not_run'
      ? `[demo] rhyme cohort not run: ${rhyme.reason}`
      : `[demo] rhyme audit ${rhyme.rhymeAuditPass} · brick wall ${rhyme.brickWallPass} · rhyme bytes ${rhyme.rhymeBytes} vs naive ${rhyme.naiveBytes} · exact ${rhyme.exact}`,
  ];
}
