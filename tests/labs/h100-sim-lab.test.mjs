import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runH100RhymeSim } from '../../src/labs/h100-sim-lab.mjs';

const python = process.env.TINY_FOOTPRINT_PYTHON ?? 'python3';

test('the simulation runs now and reports both workloads', () => {
  const report = runH100RhymeSim({ python });
  assert.equal(report.status, 'pass');
  assert.equal(report.liveRun, true);
  assert.ok(report.workloads.rhymingDifferentWording);
  assert.ok(report.workloads.identicalPrefix);
});

test('a host with no Python records not_run, and no stored receipt stands in for it', () => {
  const report = runH100RhymeSim({ python: path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tf-py-')), 'no-python') });
  assert.equal(report.status, 'not_run');
  assert.equal(report.reason, 'python_unavailable');
  assert.equal(report.workloads, undefined);
});
