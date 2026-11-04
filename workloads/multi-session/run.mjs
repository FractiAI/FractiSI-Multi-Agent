#!/usr/bin/env node
/**
 * Reference multi-session workload:
 * 1) conventional vs shared identical system prompt (prefix-reuse contrast)
 * 2) holographic rhyme cohort (nested organization, different words)
 */
import { performance } from 'node:perf_hooks';
import {
  measureBytes,
  registerTemplate,
  sessionDelta,
  reconstruct,
  auditRhyme,
  brickWallCandidate,
} from '../../tiny-footprint/sdk/index.mjs';

const SYSTEM = 'Tiny Footprint shared organizational pattern. Policy v1. '.repeat(8);
const requested = Number.parseInt(process.env.TINY_FOOTPRINT_SESSIONS || '12', 10);
const sessions = Number.isInteger(requested) && requested > 0 ? requested : 12;

function conventional() {
  const store = [];
  const t0 = performance.now();
  for (let s = 0; s < sessions; s++) {
    store.push({ system: SYSTEM, history: [`user-${s}`, `asst-${s}`] });
  }
  const ms = performance.now() - t0;
  const bytes = store.reduce((n, x) => n + measureBytes(x), 0);
  return { mode: 'conventional', ms, bytes, sessions };
}

function prefixReuse() {
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

function rhymeCohort() {
  const pattern = {
    kind: 'session',
    schema: 'demo_rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: { kind: 'session', role: 'user', octave: 1 },
    utterance: '',
  };
  const expressions = Array.from({ length: sessions }, (_, i) => ({
    kind: 'session',
    schema: 'demo_rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: {
      kind: 'session',
      role: i % 3 === 0 ? 'lead' : 'user',
      octave: (i % 5) + 1,
    },
    utterance: `demo question ${i} about a different matter`,
  }));
  const audit = auditRhyme({
    pattern,
    expressions,
    nestDepth: 2,
    driftBefore: 0.15,
  });
  registerTemplate('demo_rhyme_v1', pattern, {
    expressions,
    nestDepth: 2,
    driftBefore: 0.15,
    driftAfter: audit.pillars.self_correcting?.driftAfter,
  });
  const t0 = performance.now();
  const encoded = expressions.map((e) => sessionDelta('demo_rhyme_v1', e));
  const rebuilt = encoded.map((e) => reconstruct('demo_rhyme_v1', e.delta).value);
  const ms = performance.now() - t0;
  const naiveBytes = expressions.reduce((n, x) => n + measureBytes(x), 0);
  const stored = {
    template: { id: 'demo_rhyme_v1', pattern },
    expressions: encoded.map((e) => ({ templateId: e.templateId, delta: e.delta })),
  };
  const rhymeBytes = measureBytes(stored);
  const exact = rebuilt.every((v, i) => JSON.stringify(v) === JSON.stringify(expressions[i]));
  const brick = auditRhyme(brickWallCandidate(sessions));
  return {
    mode: 'holographic_rhyme',
    ms,
    naiveBytes,
    rhymeBytes,
    byteReduction: 1 - rhymeBytes / naiveBytes,
    exact,
    rhymeAuditPass: audit.pass,
    brickWallPass: brick.pass,
    sessions,
  };
}

const a = conventional();
const b = prefixReuse();
const c = rhymeCohort();
const prefixReduction = 1 - b.bytes / a.bytes;
console.log(
  JSON.stringify(
    {
      product: 'Tiny Footprint',
      demo: 'multi-session',
      conventional: a,
      prefixReuse: b,
      holographicRhyme: c,
      prefixByteReduction: prefixReduction,
    },
    null,
    2,
  ),
);
console.log(
  `[demo] prefix-reuse ${(prefixReduction * 100).toFixed(1)}% · conventional ${a.bytes} B → prefix ${b.bytes} B`,
);
console.log(
  `[demo] rhyme audit ${c.rhymeAuditPass} · brick wall ${c.brickWallPass} · rhyme bytes ${c.rhymeBytes} vs naive ${c.naiveBytes} · exact ${c.exact}`,
);
if (!c.rhymeAuditPass || c.brickWallPass || !c.exact) process.exitCode = 1;
