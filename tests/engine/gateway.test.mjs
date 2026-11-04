import assert from 'node:assert/strict';
import test from 'node:test';
import { createGateway } from '../../src/engine/gateway.mjs';

test('an expression ingested through the gateway reconstructs exactly', () => {
  const gateway = createGateway();
  const pattern = { kind: 'packet', qos: 'default', payload: null };
  gateway.registerTemplate({ id: 'p', pattern });
  const expression = { ...pattern, payload: { y: 1 } };
  const result = gateway.execute({ operation: 'reconstruct', encoded: gateway.ingestExpression('p', expression) });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, expression);
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
