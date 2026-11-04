import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateReduction, bytesOf, reduction } from '../../src/core/bytes.mjs';

test('bytesOf counts UTF-8 bytes of the JSON text, not characters', () => {
  assert.equal(bytesOf({ text: 'é' }), Buffer.byteLength('{"text":"é"}', 'utf8'));
  assert.equal(bytesOf('é'), 4);
});

test('reduction reports the ratio and both sizes', () => {
  assert.deepEqual(reduction(1000, 250), { ratio: 0.75, saved: 750, baselineBytes: 1000, tinyBytes: 250 });
});

test('reduction is negative when the alternative is larger', () => {
  assert.equal(reduction(100, 150).ratio, -0.5);
});

test('reduction of an empty baseline is zero rather than a division by zero', () => {
  assert.deepEqual(reduction(0, 10), { ratio: 0, saved: 0 });
});

test('the aggregate sums bytes, so a larger workload dominates', () => {
  const parts = [
    { baselineBytes: 1000, tinyBytes: 500 },
    { baselineBytes: 9000, tinyBytes: 900 },
  ];
  const aggregate = aggregateReduction(parts);
  assert.equal(aggregate.ratio, 1 - 1400 / 10000);
  assert.notEqual(aggregate.ratio, (0.5 + 0.9) / 2);
});
