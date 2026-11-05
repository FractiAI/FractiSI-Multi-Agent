import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadPlan, validatePlan } from '../../src/benchmarks/plan.mjs';

test('the committed plan is valid and hashed', () => {
  const { plan, sha256 } = loadPlan();
  assert.equal(plan.schema, 'tiny-footprint-benchmark-plan/v1');
  assert.match(sha256, /^[0-9a-f]{64}$/);
});

test('a malformed plan lists every problem and never falls back to defaults', () => {
  assert.throws(() => validatePlan({}), (error) => {
    assert.match(error.message, /schema must be/);
    assert.match(error.message, /seeds\.primary/);
    assert.match(error.message, /measured\.heap\.trials/);
    return true;
  });
});

test('out-of-range grids and too few trials are refused', () => {
  const { plan } = loadPlan();
  const broken = structuredClone(plan);
  broken.deterministic.crossover.duplicateFractions = [1.5];
  assert.throws(() => validatePlan(broken), /duplicateFractions/);
  const fewTrials = structuredClone(plan);
  fewTrials.measured.heap.trials = 1;
  assert.throws(() => validatePlan(fewTrials), /at least 3/);
});

test('a plan file is read from the path given', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-plan-'));
  const file = path.join(dir, 'plan.json');
  fs.writeFileSync(file, '{}');
  assert.throws(() => loadPlan(file), /invalid benchmark plan/);
});
