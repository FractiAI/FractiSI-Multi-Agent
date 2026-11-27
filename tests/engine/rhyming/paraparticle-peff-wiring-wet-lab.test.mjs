import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PEFF_WIRING_CHAIN,
  PEFF_DOCUMENT_ID,
  PEFF_ENGINE_SHELF_PINNED,
  MIT_PARAPARTICLE_BENCHMARK,
  polarityPhaseBridge,
  wiringChainAdmits,
  peffExpeditionRecord,
  PEFF_DOES_NOT_PROVE,
} from '../../../src/engine/rhyming/paraparticle-peff-wiring-wet-lab.mjs';

test('PEFF wiring chain PW-01…PW-05 admits', () => {
  assert.equal(PEFF_WIRING_CHAIN.length, 5);
  assert.equal(wiringChainAdmits(), true);
  assert.equal(PEFF_ENGINE_SHELF_PINNED, false);
});

test('MIT paraparticle literature pin', () => {
  assert.equal(MIT_PARAPARTICLE_BENCHMARK.qubits, 16);
  assert.equal(MIT_PARAPARTICLE_BENCHMARK.exchangePhaseDeg, 180);
  assert.equal(MIT_PARAPARTICLE_BENCHMARK.arxiv, '2611.03908');
});

test('polarity matches 180° phase inversion', () => {
  const bridge = polarityPhaseBridge(1.1);
  assert.equal(bridge.equal, true);
});

test('expedition record keeps honesty rails', () => {
  const rec = peffExpeditionRecord();
  assert.equal(rec.documentId, PEFF_DOCUMENT_ID);
  assert.ok(PEFF_DOES_NOT_PROVE.length >= 5);
  assert.match(rec.answerBounded, /not as a new force/i);
});
