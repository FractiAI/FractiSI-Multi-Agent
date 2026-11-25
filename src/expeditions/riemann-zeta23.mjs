/**
 * FractiSI · real Anthropic zeta-23 trial helpers.
 * Science target: Mathlib riemannZeta Theorems A–E (~67.2% Montgomery–Taylor window).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ZETA23_SCHEMA = 'fractisi.riemann-expedition.zeta23.v1';
export const ZETA23_FIND_SCHEMA = 'fractisi.riemann-expedition.zeta23-find.v1';
export const ZETA23_FIND_NO_KIT_SCHEMA = 'fractisi.riemann-expedition.zeta23-find-no-kit.v1';
export const ZETA23_INVENT_SCHEMA = 'fractisi.riemann-expedition.zeta23-invent.v1';
export const ZETA23_INVENT_NO_KIT_SCHEMA = 'fractisi.riemann-expedition.zeta23-invent-no-kit.v1';
export const ZETA23_INVENT_MATH_SCHEMA = 'fractisi.riemann-expedition.zeta23-invent-math.v1';
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

export function loadLatestZeta23FindReceipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-find-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    return {
      ok:
        receipt.schema === ZETA23_FIND_SCHEMA &&
        receipt.ok === true &&
        receipt.mode === 'find',
      receipt,
    };
  }
  return { ok: false, error: 'missing_latest_find_receipt' };
}

/** Invent receipt: successful measurement may be plateau (ok:false) with sealedCorpusUsed:false. */
export function loadLatestZeta23InventReceipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-invent-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    const measured =
      receipt.schema === ZETA23_INVENT_SCHEMA &&
      receipt.mode === 'invent' &&
      receipt.honesty?.sealedCorpusUsed === false &&
      receipt.invent?.solutionImportsZeta23 === false;
    return { ok: measured, receipt };
  }
  return { ok: false, error: 'missing_latest_invent_receipt' };
}

export function loadLatestZeta23InventNoKitReceipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-invent-no-kit-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    const measured =
      receipt.schema === ZETA23_INVENT_NO_KIT_SCHEMA &&
      receipt.mode === 'invent_no_kit' &&
      receipt.fractisiUsed === false &&
      receipt.honesty?.sealedCorpusUsed === false &&
      receipt.cutoffSeconds === 180;
    return { ok: measured, receipt };
  }
  return { ok: false, error: 'missing_latest_invent_no_kit_receipt' };
}

/** Paper-math invent: green InventMath ladder, no sealed corpus. */
export function loadLatestZeta23InventMathReceipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-invent-math-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    const measured =
      receipt.schema === ZETA23_INVENT_MATH_SCHEMA &&
      receipt.mode === 'invent_math' &&
      receipt.ok === true &&
      receipt.honesty?.sealedCorpusUsed === false &&
      receipt.invent?.inventMathImportsZeta23 === false &&
      receipt.invent?.sorryAtEnd === 0 &&
      receipt.invent?.closedCount === receipt.invent?.theoremCount;
    return { ok: measured, receipt };
  }
  return { ok: false, error: 'missing_latest_invent_math_receipt' };
}

/** No-kit find is a successful *measurement* when cutoffHit and still no Solution. */
export function loadLatestZeta23FindNoKitReceipt(receiptsDir) {
  if (!existsSync(receiptsDir)) return { ok: false, error: 'missing_receipts_dir' };
  const preferred = join(receiptsDir, 'riemann-fractisi-zeta23-find-no-kit-latest.json');
  if (existsSync(preferred)) {
    const receipt = JSON.parse(readFileSync(preferred, 'utf8'));
    const measured =
      receipt.schema === ZETA23_FIND_NO_KIT_SCHEMA &&
      receipt.mode === 'find_no_kit' &&
      receipt.fractisiUsed === false &&
      receipt.cutoffHit === true &&
      receipt.ok === false;
    return { ok: measured, receipt };
  }
  return { ok: false, error: 'missing_latest_find_no_kit_receipt' };
}
