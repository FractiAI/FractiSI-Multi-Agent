/**
 * Mirrors `src/expeditions/riemann-ablation.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  scanForbidden,
  leanRootFromHere,
  loadAblationSummary,
  ABLATION_SUMMARY_SCHEMA,
  AGENT_PAYLOAD_PATHS,
} from '../../src/expeditions/riemann-ablation.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LEAN = leanRootFromHere();

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

  it('exposes frozen agent payload paths', () => {
    assert.equal(AGENT_PAYLOAD_PATHS.length, 4);
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
    assert.ok(r.status === 0 || r.status === 1, `unexpected status ${r.status}: ${r.stderr}`);
    const out = (r.stdout || '').trim();
    assert.ok(out.includes('receiptPath') || out.includes('fractisiTasks'), out.slice(0, 400));
  });
});

describe('ablation summary receipt', () => {
  it('five-run summary exists with coordination evidence', () => {
    const loaded = loadAblationSummary(LEAN);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.problems));
    assert.equal(loaded.summary.schema, ABLATION_SUMMARY_SCHEMA);
    assert.ok(loaded.summary.noKitSeconds.mean > 0);
    assert.ok(loaded.summary.fractisiSeconds.mean > 0);
    assert.ok(ROOT.length > 0);
  });
});
