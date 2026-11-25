/**
 * FractiSI · real Anthropic zeta-23 trial helpers.
 * Science target: Mathlib riemannZeta Theorems A–E (~67.2% Montgomery–Taylor window).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ZETA23_SCHEMA = 'fractisi.riemann-expedition.zeta23.v1';
export const PERMITTED_AXIOMS = Object.freeze(['propext', 'Classical.choice', 'Quot.sound']);

export const ZETA23_PARTITIONS = Object.freeze([
  {
    name: 'challenge-deps',
    title: 'ChallengeDeps (Mathlib-only definitions)',
    paths: ['ChallengeDeps.lean', 'ChallengeDeps'],
  },
  {
    name: 'challenge-statements',
    title: 'Challenge.lean trusted statements (sorry surface)',
    paths: ['Challenge.lean', 'Challenge'],
  },
  {
    name: 'zeta23-library',
    title: 'Zeta23 proof development (real analytic formalization)',
    paths: ['Zeta23.lean', 'Zeta23'],
  },
  {
    name: 'solution-bridge',
    title: 'Solution.lean comparator bridge',
    paths: ['Solution.lean', 'Solution'],
  },
]);

export function zeta23RootFromHere(fromUrl = import.meta.url) {
  const here = dirname(fileURLToPath(fromUrl));
  return join(here, '../../expeditions/riemann-fractisi/zeta23');
}

/** Parse `#print axioms` lines; fail if any theorem uses axioms outside the Lean trio. */
export function auditPrintAxiomsStdout(stdout) {
  const rows = [];
  for (const line of String(stdout || '').split('\n')) {
    const m = line.match(/^'([^']+)' depends on axioms: \[(.*)\]/);
    if (!m) continue;
    const axioms = m[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const extra = axioms.filter((a) => !PERMITTED_AXIOMS.includes(a));
    rows.push({ theorem: m[1], axioms, extra });
  }
  return {
    ok: rows.length >= 17 && rows.every((r) => r.extra.length === 0),
    theoremsChecked: rows.length,
    rows,
  };
}

export function loadLatestZeta23Receipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  // Prefer explicitly named latest by mtime via caller; here load summary if present.
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    return { ok: receipt.schema === ZETA23_SCHEMA && receipt.ok === true, receipt };
  }
  return { ok: false, error: 'missing_latest_receipt' };
}
