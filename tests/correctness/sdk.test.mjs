import assert from 'node:assert/strict';
import {
  registerTemplate,
  sessionDelta,
  reconstruct,
  measureBytes,
  auditRhyme,
  brickWallCandidate,
  trueRhymeCandidate,
  FOUR_PILLARS,
  shapesRhyme,
  structuralSignature,
} from '../../tiny-footprint/sdk/index.mjs';

const pattern = {
  kind: 'session',
  schema: 'sdk_v1',
  organization: { kind: 'session', role: 'user', octave: 1 },
  utterance: '',
};
const expr = {
  kind: 'session',
  schema: 'sdk_v1',
  organization: { kind: 'session', role: 'lead', octave: 2 },
  utterance: 'hello from sdk',
};

const t = registerTemplate('sys-v1', pattern, {
  expressions: [expr, { ...expr, utterance: 'second' }],
  nestDepth: 2,
  driftBefore: 0.15,
});
assert.equal(t.templateId, 'sys-v1');
assert.equal(t.rhymePass, true);

const d = sessionDelta('sys-v1', expr);
assert.equal(d.kind, 'session_delta');
assert.equal(d.delta.utterance, 'hello from sdk');
assert.equal(d.delta.organization.role, 'lead');
assert.equal(d.delta.organization.octave, 2);

const w = reconstruct('sys-v1', d.delta);
assert.deepEqual(w.value, expr);
assert.ok(w.workingSet);
assert.ok(measureBytes(w.value) > 0);

// Four-pillar gate: brick wall fails; true rhyme passes
const brick = auditRhyme(brickWallCandidate(8));
assert.equal(brick.pass, false);
assert.ok(brick.failed.includes('self_similar'));

const rhymeExprs = [
  {
    kind: 'session',
    schema: 'rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: { kind: 'session', role: 'user', octave: 1 },
    utterance: 'other words same organization',
  },
  {
    kind: 'session',
    schema: 'rhyme_v1',
    motion: 'repeat-mirror-recurse-correct',
    organization: { kind: 'session', role: 'lead', octave: 2 },
    utterance: 'a different question entirely',
  },
];
const rhyme = auditRhyme(trueRhymeCandidate(rhymeExprs, 2, 0.15));
assert.equal(rhyme.pass, true);
assert.ok(FOUR_PILLARS.every((p) => rhyme.pillars[p].pass));

assert.equal(shapesRhyme(pattern, expr), true);
assert.notEqual(structuralSignature({ tags: ['a'] }), structuralSignature({ tags: { a: true } }));

console.log('sdk ok', measureBytes(w.value));
