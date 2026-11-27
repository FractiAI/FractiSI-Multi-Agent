import assert from 'node:assert/strict';
import test from 'node:test';
import { runParaparticlePeffSuite } from '../../research/paraparticle-peff-wiring-wet-lab/src/experiments.mjs';

test('Paraparticle–PEFF Soft Story suite E1–E8 all pass', () => {
  const report = runParaparticlePeffSuite();
  assert.equal(report.engineShelfPinned, false);
  assert.equal(report.total, 8);
  assert.equal(report.passCount, 8);
  assert.equal(report.pass, true);
  assert.equal(report.documentId, 'EXP-FRACTISI-PEFF-PARAPARTICLE-WIRING-WETLAB-2026-11-27');
});
