import assert from 'node:assert/strict';
import test from 'node:test';
import { FOUR_PILLARS, PRODUCT, VERSION, auditRhyme, brickWallCandidate, discover, measureBytes, reconstruct, registerCompressionHook, registerTemplate, routeTemplate, createCompressionHookRegistry, createContextBuffer, sessionDelta, shapesRhyme, structuralSignature, trueRhymeCandidate, withEnergyBudget } from '../../src/sdk/index.mjs';
import * as publicPath from '../../tiny-footprint/sdk/index.mjs';

const rhymed = (role, utterance) => ({ kind: 'sdk', schema: 's', organization: { kind: 'sdk', role }, utterance });

test('a template registers, a session keeps its delta, and reconstruction returns the session', () => {
  const pattern = rhymed('user', '');
  const template = registerTemplate('sdk-sys-v1', pattern);
  const session = rhymed('lead', 'hello');
  const delta = sessionDelta('sdk-sys-v1', session);
  const working = reconstruct('sdk-sys-v1', delta.delta);
  assert.equal(template.templateId, 'sdk-sys-v1');
  assert.ok(!Number.isNaN(Date.parse(template.registeredAt)));
  assert.equal(delta.kind, 'session_delta');
  assert.deepEqual(working.value, session);
  assert.equal(working.workingSet.selective, true);
  assert.equal(reconstruct('sdk-sys-v1', {}, { limit: 1 }).workingSet.limit, 1);
  assert.deepEqual(reconstruct('sdk-sys-v1', delta.delta, { withState: true }).value, session);
  assert.equal(discover(session).id, 'sdk-sys-v1');
  assert.equal(routeTemplate(session).id, 'sdk-sys-v1');
});

test('an unknown template, and a session that does not rhyme, are refused', () => {
  assert.throws(() => sessionDelta('sdk-absent', {}), /unknown template/);
  registerTemplate('sdk-flat', { only: '' });
  assert.throws(() => sessionDelta('sdk-flat', { other: 1 }), /does not rhyme/);
});

test('rhyme evidence is audited when given', () => {
  const pattern = { kind: 'sdk2', schema: 's', organization: { kind: 'sdk2', role: '' }, utterance: '', extra: '' };
  const evidence = { expressions: [pattern, pattern], nestDepth: 2, driftBefore: 0.15, driftAfter: 0.05 };
  assert.equal(registerTemplate('sdk-audited', pattern, evidence).rhymePass, true);
  assert.throws(() => registerTemplate('sdk-refused', { unit: 'brick', index: 0 }, { expressions: [], nestDepth: 0 }), /holographic_rhyme_rejected/);
  assert.equal(typeof trueRhymeCandidate, 'function');
});

test('a template with rhyme evidence keeps nested differences and rebuilds the session', () => {
  const pattern = { kind: 'session', schema: 'sdk_v1', organization: { kind: 'session', role: 'user', octave: 1 }, utterance: '' };
  const session = { kind: 'session', schema: 'sdk_v1', organization: { kind: 'session', role: 'lead', octave: 2 }, utterance: 'hello from sdk' };
  const template = registerTemplate('sys-v1', pattern, { expressions: [session, { ...session, utterance: 'second' }], nestDepth: 2, driftBefore: 0.15 });
  assert.equal(template.rhymePass, true);
  const { delta } = sessionDelta('sys-v1', session);
  assert.equal(delta.utterance, 'hello from sdk');
  assert.equal(delta.organization.role, 'lead');
  assert.equal(delta.organization.octave, 2);
  assert.deepEqual(reconstruct('sys-v1', delta).value, session);
  assert.equal(shapesRhyme(pattern, session), true);
});

test('a brick wall fails the four pillars and a true rhyme passes all of them', () => {
  const brick = auditRhyme(brickWallCandidate(8));
  assert.equal(brick.pass, false);
  assert.ok(brick.failed.includes('self_similar'));
  const expression = (role, octave, utterance) => ({ kind: 'session', schema: 'rhyme_v1', motion: 'repeat-mirror-recurse-correct', organization: { kind: 'session', role, octave }, utterance });
  const rhyme = auditRhyme(trueRhymeCandidate([expression('user', 1, 'other words same organization'), expression('lead', 2, 'a different question entirely')], 2, 0.15));
  assert.equal(rhyme.pass, true);
  assert.ok(FOUR_PILLARS.every((pillar) => rhyme.pillars[pillar].pass));
  assert.notEqual(structuralSignature({ tags: ['a'] }), structuralSignature({ tags: { a: true } }));
});

test('the lab meters are reachable through the SDK', () => {
  const registry = createCompressionHookRegistry();
  assert.equal(registerCompressionHook(registry, 'h', {}), 'h');
  assert.equal(createContextBuffer({ maxLevels: 2 }).size(), 0);
  assert.equal(withEnergyBudget({ bytesTouched: 1 }, 1).PROXY, true);
});

test('measureBytes counts UTF-8 and refuses what JSON cannot represent', () => {
  assert.equal(measureBytes({ text: 'é' }), Buffer.byteLength(JSON.stringify({ text: 'é' }), 'utf8'));
  assert.throws(() => measureBytes(undefined), TypeError);
});

test('the stable public path exposes the same SDK', () => {
  assert.equal(publicPath.measureBytes, measureBytes);
  assert.equal(publicPath.PRODUCT, PRODUCT);
  assert.equal(publicPath.VERSION, VERSION);
});
