/**
 * Mirrors `src/expeditions/riemann-zeta23.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ZETA23_PARTITIONS,
  ZETA23_SCHEMA,
  auditPrintAxiomsStdout,
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
    const files = readdirSync(receipts).filter(
      (f) => f.startsWith('riemann-fractisi-zeta23-') && f.endsWith('.json'),
    );
    assert.ok(files.length > 0, 'run timing/run-zeta23.mjs before commit');
    const latest = files.sort().at(-1);
    const receipt = JSON.parse(readFileSync(join(receipts, latest), 'utf8'));
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
