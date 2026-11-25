/**
 * Mirrors `src/expeditions/riemann-zeta23.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ZETA23_FIND_NO_KIT_SCHEMA,
  ZETA23_FIND_SCHEMA,
  ZETA23_PARTITIONS,
  ZETA23_SCHEMA,
  auditPrintAxiomsStdout,
  loadLatestZeta23FindNoKitReceipt,
  loadLatestZeta23FindReceipt,
  zeta23RootFromHere,
} from '../../src/expeditions/riemann-zeta23.mjs';

describe('riemann zeta23 helpers', () => {
  it('defines four real Mathlib partitions', () => {
    assert.equal(ZETA23_PARTITIONS.length, 4);
    assert.ok(ZETA23_PARTITIONS.some((p) => p.name === 'zeta23-library'));
  });

  it('audits print-axioms stdout for the Lean axiom trio only', () => {
    const sample = `'two_thirds_on_critical_line' depends on axioms: [propext, Classical.choice, Quot.sound]
'montgomery_taylor_on_critical_line' depends on axioms: [propext, Classical.choice, Quot.sound]
`;
    // fewer than 17 → not ok
    assert.equal(auditPrintAxiomsStdout(sample).ok, false);

    const lines = [];
    for (let i = 0; i < 17; i++) {
      lines.push(`'thm_${i}' depends on axioms: [propext, Classical.choice, Quot.sound]`);
    }
    assert.equal(auditPrintAxiomsStdout(lines.join('\n')).ok, true);
    lines[0] = `'thm_0' depends on axioms: [propext, Classical.choice, Quot.sound, evil]`;
    assert.equal(auditPrintAxiomsStdout(lines.join('\n')).ok, false);
  });

  it('vendored zeta23 Challenge mentions riemannZeta', () => {
    const root = zeta23RootFromHere();
    assert.ok(existsSync(join(root, 'Challenge.lean')), 'vendor Challenge.lean');
    const text = readFileSync(join(root, 'Challenge.lean'), 'utf8');
    assert.match(text, /riemannZeta/);
    assert.match(text, /montgomery_taylor_on_critical_line/);
  });
});

describe('zeta23 receipt', () => {
  it('has a green fractisi.riemann-expedition.zeta23.v1 receipt', () => {
    const receipts = join(zeta23RootFromHere(), '../lean/receipts');
    const preferred = join(receipts, 'riemann-fractisi-zeta23-latest.json');
    assert.ok(existsSync(preferred), 'run timing/run-zeta23.mjs before commit');
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    assert.equal(receipt.schema, ZETA23_SCHEMA);
    assert.equal(receipt.ok, true);
    assert.equal(receipt.fractisi.tasks, 4);
    assert.equal(receipt.fractisi.contributions, 4);
    assert.equal(receipt.fractisi.compositions, 1);
    assert.equal(receipt.leanGate.ok, true);
    assert.equal(receipt.leanGate.axiomsOk, true);
    assert.ok(receipt.durationSeconds > 0);
  });
});

describe('zeta23 find receipt', () => {
  it('has a green Challenge-only find receipt', () => {
    const receipts = join(zeta23RootFromHere(), '../lean/receipts');
    const loaded = loadLatestZeta23FindReceipt(receipts);
    assert.equal(loaded.ok, true, 'run timing/run-zeta23-find.mjs before commit');
    const receipt = loaded.receipt;
    assert.equal(receipt.schema, ZETA23_FIND_SCHEMA);
    assert.equal(receipt.mode, 'find');
    assert.equal(receipt.ok, true);
    assert.equal(receipt.challengeOnlyAtStart.Zeta23Dir, true);
    assert.equal(receipt.challengeOnlyAtStart.SolutionLean, true);
    assert.equal(receipt.discoveredFileCount, 319);
    assert.equal(receipt.fractisi.tasks, 4);
    assert.equal(receipt.fractisi.contributions, 4);
    assert.equal(receipt.fractisi.compositions, 1);
    assert.equal(receipt.leanGate.ok, true);
    assert.equal(receipt.leanGate.axiomsOk, true);
    assert.ok(receipt.durationSeconds > 0);
  });
});

describe('zeta23 find no-kit receipt', () => {
  it('records a capped Challenge-only no-FractiSI find', () => {
    const receipts = join(zeta23RootFromHere(), '../lean/receipts');
    const loaded = loadLatestZeta23FindNoKitReceipt(receipts);
    assert.equal(loaded.ok, true, 'run timing/run-zeta23-find-no-kit.mjs before commit');
    const receipt = loaded.receipt;
    assert.equal(receipt.schema, ZETA23_FIND_NO_KIT_SCHEMA);
    assert.equal(receipt.mode, 'find_no_kit');
    assert.equal(receipt.fractisiUsed, false);
    assert.equal(receipt.sealedCorpusAvailableToAgents, false);
    assert.equal(receipt.cutoffHit, true);
    assert.ok(receipt.cutoffSeconds >= 180);
    assert.ok(receipt.sorryAtEnd.sorryCount >= 1);
    assert.equal(receipt.challengeOnlyAtEnd.SolutionLean, true);
    assert.equal(receipt.ok, false);
  });
});
