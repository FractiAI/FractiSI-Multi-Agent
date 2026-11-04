import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { HISTORICAL_FILES, reconcileHistorical } from '../../src/analysis/historical.mjs';
import { runDeterministicBenchmarks } from '../../src/benchmarks/deterministic/index.mjs';
import { loadPlan } from '../../src/benchmarks/plan.mjs';
import { PATHS } from '../../src/core/paths.mjs';

const deterministic = runDeterministicBenchmarks(loadPlan().plan);

test('stored byte results and the allocation figure reproduce from today\'s code', () => {
  const result = reconcileHistorical(PATHS.historicalReceipts, deterministic);
  assert.equal(result.allWorkloadsReproduced, true);
  assert.equal(result.aggregate.reproduced, true);
  assert.equal(result.gpuAllocation.reproducedByArithmetic, true);
  assert.match(result.device, /GTX 860M/);
  assert.match(result.receipts.suite.sha256, /^[0-9a-f]{64}$/);
});

test('negative control: a tampered receipt fails reconciliation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-hist-'));
  for (const name of Object.values(HISTORICAL_FILES)) fs.copyFileSync(path.join(PATHS.historicalReceipts, name), path.join(dir, name));
  const file = path.join(dir, HISTORICAL_FILES.suite);
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
  receipt.results.B.ratio += 0.01;
  fs.writeFileSync(file, JSON.stringify(receipt));
  assert.equal(reconcileHistorical(dir, deterministic).allWorkloadsReproduced, false);
});

test('a missing receipt throws rather than reading as an empty record', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-hist-'));
  assert.throws(() => reconcileHistorical(dir, deterministic), /ENOENT/);
});
