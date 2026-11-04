import assert from 'node:assert/strict';
import test from 'node:test';
import { bytes, fixed2, fixed3, int, interval, kib, mib, ms, pct, pct0, sci, text, times, times1, us, word, yesNo } from '../../src/core/format.mjs';

test('each format applies one fixed precision', () => {
  assert.equal(pct(0.8450413), '84.5%');
  assert.equal(pct0(0.8), '80%');
  assert.equal(times(1.8325), '1.83×');
  assert.equal(times1(3.67), '3.7×');
  assert.equal(int(1234567.8), '1,234,568');
  assert.equal(bytes(1024), '1,024 bytes');
  assert.equal(kib(2048), '2.0 KiB');
  assert.equal(mib(1048576), '1.0 MiB');
  assert.equal(ms(1.005), '1.00 ms');
  assert.equal(us(1500), '1.50 µs');
  assert.equal(fixed2(1.234), '1.23');
  assert.equal(fixed3(1.2345), '1.234');
  assert.equal(sci(0.000137), '1.4e-4');
  assert.equal(text(5), '5');
  assert.equal(yesNo(true), 'yes');
  assert.equal(yesNo(false), 'no');
});

test('word spells small counts and falls back to digits', () => {
  assert.equal(word(8), 'eight');
  assert.equal(word(40), '40');
});

test('interval formats both ends the same way', () => {
  assert.equal(interval(0.1, 0.25, pct), '10.0% to 25.0%');
});
