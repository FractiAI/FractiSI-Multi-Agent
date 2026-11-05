import assert from 'node:assert/strict';
import test from 'node:test';
import { FOUR_PILLARS, PHI_EGS, auditRhyme, brickWallCandidate, isRhyme, localBlueprint, trueRhymeCandidate } from '../../../src/engine/rhyming/gate.mjs';

const session = (role, utterance) => ({
  kind: 'session',
  schema: 'rhyme_v1',
  motion: 'repeat-mirror-recurse-correct',
  organization: { kind: 'session', role, octave: 1 },
  utterance,
});

test('a cohort with nested self-similar organization passes all four pillars', () => {
  const audit = auditRhyme(trueRhymeCandidate([session('user', 'a'), session('lead', 'b')], 2, 0.15));
  assert.equal(audit.pass, true);
  assert.deepEqual(audit.failed, []);
  for (const pillar of FOUR_PILLARS) assert.equal(audit.pillars[pillar].pass, true, pillar);
});

test('a brick wall repeats, and repeating alone is not enough', () => {
  const audit = auditRhyme(brickWallCandidate(40));
  assert.equal(audit.pass, false);
  assert.equal(audit.pillars.repeating.pass, true);
  assert.deepEqual([...audit.failed].sort(), ['recursive', 'self_correcting', 'self_similar']);
  assert.equal(isRhyme(brickWallCandidate(40)), false);
});

test('each pillar can fail by itself', () => {
  const good = trueRhymeCandidate([session('user', 'a'), session('lead', 'b')], 2, 0.15);
  assert.deepEqual(auditRhyme({ ...good, expressions: [session('user', 'a')] }).failed, ['repeating']);
  assert.deepEqual(auditRhyme({ ...good, nestDepth: 0 }).failed, ['recursive']);
  assert.deepEqual(auditRhyme({ ...good, deadLoop: true }).failed, ['recursive']);
  assert.deepEqual(auditRhyme({ ...good, driftAfter: 0.2 }).failed, ['self_correcting']);
  assert.deepEqual(auditRhyme({ ...good, driftBefore: undefined, driftAfter: undefined }).failed, ['self_correcting']);
  const flat = { kind: 'session', utterance: '' };
  assert.ok(auditRhyme({ ...good, pattern: flat, expressions: [flat, flat] }).failed.includes('self_similar'));
});

test('drift given with no correction gets the default dampener', () => {
  const good = trueRhymeCandidate([session('user', 'a'), session('lead', 'b')], 2, 0.15);
  const pillar = auditRhyme({ ...good, driftAfter: undefined }).pillars.self_correcting;
  assert.equal(pillar.pass, true);
  assert.equal(pillar.appliedDefaultDampener, true);
  assert.equal(pillar.driftAfter, 0.15 / PHI_EGS ** 2);
});

test('a candidate with no pattern fails every pillar', () => {
  assert.deepEqual(auditRhyme({}).failed, [...FOUR_PILLARS]);
});

test('the local blueprint is the first nested plain object', () => {
  assert.deepEqual(localBlueprint({ a: 1, b: { c: 2 } }), { c: 2 });
  assert.equal(localBlueprint({ a: 1, b: [1] }), null);
  assert.equal(localBlueprint(null), null);
});
