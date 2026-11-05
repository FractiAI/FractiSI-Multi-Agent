import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadPlan } from '../../src/benchmarks/plan.mjs';
import { writeDeterministicReceipts } from '../../src/benchmarks/runners.mjs';
import { PATHS } from '../../src/core/paths.mjs';

const { plan, sha256 } = loadPlan();

test('deterministic receipts are byte-identical across runs', () => {
  const a = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-det-'));
  const b = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-det-'));
  writeDeterministicReceipts(plan, sha256, a);
  writeDeterministicReceipts(plan, sha256, b);
  for (const name of ['results.json', 'compression.json']) {
    assert.equal(fs.readFileSync(path.join(a, 'deterministic', name), 'utf8'), fs.readFileSync(path.join(b, 'deterministic', name), 'utf8'));
  }
});

test('the committed deterministic receipt equals a fresh run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-det-'));
  writeDeterministicReceipts(plan, sha256, dir);
  assert.equal(
    fs.readFileSync(path.join(dir, 'deterministic', 'results.json'), 'utf8'),
    fs.readFileSync(path.join(PATHS.outputData, 'deterministic', 'results.json'), 'utf8'),
  );
});

test('deterministic receipts describe neither a clock nor a host', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-det-'));
  writeDeterministicReceipts(plan, sha256, dir);
  const text = fs.readFileSync(path.join(dir, 'deterministic', 'results.json'), 'utf8');
  assert.doesNotMatch(text, /generatedAt|hostname|cpuModel|"at":/);
});
