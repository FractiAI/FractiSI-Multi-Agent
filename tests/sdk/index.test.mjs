import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCT, VERSION, discover, measureBytes, reconstruct, registerCompressionHook, registerTemplate, routeTemplate, createCompressionHookRegistry, createContextBuffer, sessionDelta, trueRhymeCandidate, withEnergyBudget } from '../../src/sdk/index.mjs';
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
