import assert from 'node:assert/strict';
import os from 'node:os';
import test from 'node:test';
import { describeHost, loadSample } from '../../src/benchmarks/host.mjs';

test('the host description identifies hardware and runtime but not the machine or user', () => {
  const host = describeHost();
  assert.equal(host.cpuModel, os.cpus()[0].model);
  assert.equal(host.node, process.version);
  const text = JSON.stringify(host);
  assert.equal(text.includes(os.hostname()), false);
  assert.equal(text.includes(os.userInfo().username), false);
  assert.equal(text.includes(os.homedir()), false);
});

test('a load sample records a time and three load averages', () => {
  const sample = loadSample();
  assert.ok(!Number.isNaN(Date.parse(sample.at)));
  assert.deepEqual(Object.keys(sample.loadAverage), ['one', 'five', 'fifteen']);
});
