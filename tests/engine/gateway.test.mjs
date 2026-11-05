import assert from 'node:assert/strict';
import test from 'node:test';
import { createGateway } from '../../src/engine/gateway.mjs';

test('an expression ingested through the gateway reconstructs exactly', () => {
  const gateway = createGateway();
  const pattern = { kind: 'packet', qos: 'default', payload: { y: 0 } };
  gateway.registerTemplate({ id: 'p', pattern });
  const expression = { ...pattern, payload: { y: 1 } };
  const result = gateway.execute({ operation: 'reconstruct', encoded: gateway.ingestExpression('p', expression) });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, expression);
});

test('rhyme evidence, routing and context buffers work through the gateway', () => {
  const gateway = createGateway({ requireRhyme: true });
  const pattern = {
    kind: 's',
    schema: 'v',
    netZero: { kind: 's', octave: 0, role: 'origin', equilibrium: true },
    organization: { kind: 's', role: '', octave: 1, organization: { kind: 's', role: 'lead', octave: 2 } },
    text: '',
  };
  const expressions = [{ ...pattern, text: 'a' }, { ...pattern, text: 'b' }];
  assert.throws(() => gateway.registerTemplate({ id: 'flat', pattern: { unit: 'brick', index: 0 } }), /holographic_rhyme_rejected/);
  gateway.registerTemplate({ id: 't', pattern, expressions, nestDepth: 2, driftBefore: 0.15, driftAfter: 0.05 });
  assert.equal(gateway.discoverTemplate(expressions[0]).id, 't');
  assert.equal(gateway.routeTemplate(expressions[0]).id, 't');
  const encoded = gateway.ingestRhyming(expressions[1]);
  assert.deepEqual(gateway.execute({ operation: 'reconstruct', encoded }).value, expressions[1]);
  assert.deepEqual(gateway.execute({ operation: 'reconstruct', encoded: gateway.ingestRhymingBest(expressions[0]) }).value, expressions[0]);
  assert.throws(() => gateway.ingestRhyming({ other: 1 }), /no_rhyming_template/);
  assert.equal(gateway.execute({ operation: 'discover', shape: expressions[0] }).ok, true);
  assert.equal(gateway.execute({ operation: 'route', shape: expressions[0] }).value.id, 't');
  assert.equal(gateway.execute({ operation: 'compressMeter' }).error, 'no_context_buffer');
  gateway.openContextBuffer(pattern, { maxLevels: 2 });
  assert.equal(gateway.execute({ operation: 'pushTurn', shape: expressions[0] }).ok, true);
  assert.equal(gateway.execute({ operation: 'compressMeter' }).ok, true);
  assert.equal(gateway.getContextBuffer().size(), 1);
  assert.equal(gateway.execute({ operation: 'nope' }).error, 'unknown_operation');
});

test('an unknown template is refused at ingest', () => {
  assert.throws(() => createGateway().ingestExpression('absent', {}), /unknown template/);
});

test('workingSet resolves through the vector store', () => {
  const gateway = createGateway();
  gateway.vectors.put({ id: 'root', cross: ['leaf'] });
  gateway.vectors.put({ id: 'leaf' });
  const result = gateway.execute({ operation: 'workingSet', vectorRoot: 'root' });
  assert.equal(result.n, 2);
});

test('validateEqual detects a mismatch when told what to expect', () => {
  const gateway = createGateway();
  gateway.registerTemplate({ id: 'p', pattern: { a: 1 } });
  const encoded = gateway.ingestExpression('p', { a: 2 });
  assert.equal(gateway.execute({ operation: 'validateEqual', encoded: { ...encoded, __expect: { a: 2 } } }).ok, true);
  assert.equal(gateway.execute({ operation: 'validateEqual', encoded: { ...encoded, __expect: { a: 3 } } }).ok, false);
});

test('known limit: validateEqual is trivially true with nothing to compare', () => {
  const gateway = createGateway();
  gateway.registerTemplate({ id: 'p', pattern: { a: 1 } });
  assert.equal(gateway.execute({ operation: 'validateEqual', encoded: gateway.ingestExpression('p', { a: 9 }) }).ok, true);
});

test('an unknown operation fails explicitly', () => {
  assert.deepEqual(createGateway().execute({ operation: 'nope' }), { ok: false, error: 'unknown_operation' });
});
