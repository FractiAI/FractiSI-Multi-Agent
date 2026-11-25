/**
 * Riemann FractiSI matched ablation — hard gate + structure smoke.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { scanForbidden } from '../../expeditions/riemann-fractisi/lean/timing/hard-gate.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LEAN = join(ROOT, 'expeditions/riemann-fractisi/lean');

describe('riemann ablation hard gate', () => {
  it('canonical Lean tree has no forbidden code tokens', () => {
    const scan = scanForbidden(LEAN);
    assert.equal(scan.ok, true, JSON.stringify(scan.hits));
    assert.ok(scan.filesScanned >= 6);
  });

  it('detects sorry in code and ignores it in comments', () => {
    const dir = mkdtempSync(join(tmpdir(), 'riemann-gate-'));
    mkdirSync(join(dir, 'RiemannExpedition'), { recursive: true });
    writeFileSync(
      join(dir, 'RiemannExpedition/Bad.lean'),
      '/- sorry in comment -/\ntheorem t : True := sorry\n',
      'utf8',
    );
    const bad = scanForbidden(dir);
    assert.equal(bad.ok, false);
    assert.ok(bad.hits.some((h) => h.rule === 'sorry'));

    writeFileSync(
      join(dir, 'RiemannExpedition/Bad.lean'),
      '/- mentioning the incomplete-proof keyword is fine -/\ntheorem t : True := trivial\n',
      'utf8',
    );
    const good = scanForbidden(dir);
    assert.equal(good.ok, true);
  });
});

describe('riemann ablation harness smoke', () => {
  it('run-ablation --skip-lake exits structure-clean (not science)', () => {
    const sandbox = mkdtempSync(join(tmpdir(), 'riemann-ablation-smoke-'));
    const r = spawnSync(
      process.execPath,
      ['timing/run-ablation.mjs', '--skip-lake', '--sandbox', sandbox],
      { cwd: LEAN, encoding: 'utf8', env: process.env },
    );
    // skip-lake cannot pass hard gate (build.ok !== true) → exit 1 by design
    assert.ok(r.status === 0 || r.status === 1, `unexpected status ${r.status}: ${r.stderr}`);
    const out = (r.stdout || '').trim();
    assert.ok(out.includes('receiptPath') || out.includes('fractisiTasks'), out.slice(0, 400));
  });
});

describe('ablation summary receipt', () => {
  it('five-run summary exists with coordination evidence', () => {
    const p = join(LEAN, 'receipts/riemann-fractisi-ablation-summary-5runs.json');
    assert.ok(existsSync(p), 'run ablation summary before commit');
    const s = JSON.parse(readFileSync(p, 'utf8'));
    assert.equal(s.schema, 'fractisi.riemann-expedition.ablation-summary.v1');
    assert.equal(s.runs, 5);
    assert.equal(s.allOk, true);
    assert.ok(s.noKitSeconds.mean > 0);
    assert.ok(s.fractisiSeconds.mean > 0);
    for (const row of s.coordinationEvidencePerRun) {
      assert.equal(row.tasks, 4);
      assert.equal(row.contributions, 4);
      assert.equal(row.compositions, 1);
    }
  });
});
