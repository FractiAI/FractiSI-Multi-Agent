import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCT, VERSION, measureBytes, reconstruct, registerTemplate, sessionDelta } from '../../src/sdk/index.mjs';
import * as publicPath from '../../tiny-footprint/sdk/index.mjs';

test('registering, delta and reconstruction carry the template id', () => {
  const template = registerTemplate('sys-v1', { policy: 'shared' });
  const delta = sessionDelta('sys-v1', { turn: 1 });
  const working = reconstruct('sys-v1', delta.delta);
  assert.equal(template.templateId, 'sys-v1');
  assert.ok(!Number.isNaN(Date.parse(template.registeredAt)));
  assert.equal(delta.kind, 'session_delta');
  assert.equal(working.workingSet.selective, true);
  assert.equal(reconstruct('t', {}, { limit: 1 }).workingSet.limit, 1);
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
