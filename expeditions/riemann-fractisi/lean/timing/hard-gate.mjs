/**
 * Hard Lean gate for the Riemann FractiSI ablation.
 *
 * Fails on code-level:
 *   - `sorry`
 *   - user `axiom ` declarations
 *   - `native_decide`
 * Passes only when lake build is green and the scan is clean.
 *
 * Scans strip Lean comments and string literals so documentation that
 * *mentions* those tokens does not false-positive. Skips `.lake`,
 * `.fractisi`, and `.ablation-axioms` trees.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const FORBIDDEN = [
  { id: 'sorry', re: /\bsorry\b/ },
  { id: 'axiom', re: /^\s*axiom\s+/m },
  { id: 'native_decide', re: /\bnative_decide\b/ },
];

const SKIP_DIRS = new Set(['.lake', 'lake-packages', '.fractisi', '.ablation-axioms', '.git']);

function stripLeanNoise(text) {
  // Block comments /- ... -/ (non-greedy, including doc comments)
  let s = text.replace(/\/-[\s\S]*?-\//g, ' ');
  // Line comments
  s = s.replace(/--[^\n]*/g, ' ');
  // String literals
  s = s.replace(/"(?:\\.|[^"\\])*"/g, '""');
  return s;
}

function listLeanFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      listLeanFiles(p, out);
    } else if (name.endsWith('.lean')) {
      out.push(p);
    }
  }
  return out;
}

export function scanForbidden(leanRoot) {
  const files = listLeanFiles(leanRoot);
  const hits = [];
  for (const file of files) {
    const text = stripLeanNoise(readFileSync(file, 'utf8'));
    for (const rule of FORBIDDEN) {
      if (rule.re.test(text)) {
        hits.push({
          rule: rule.id,
          file: relative(leanRoot, file),
        });
      }
    }
  }
  return { ok: hits.length === 0, hits, filesScanned: files.length };
}

export function runLakeBuild(leanRoot, lakeBin = 'lake') {
  const r = spawnSync(lakeBin, ['build'], {
    cwd: leanRoot,
    encoding: 'utf8',
    env: process.env,
  });
  return {
    status: r.status,
    ok: r.status === 0,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
  };
}

/**
 * Best-effort axiom printer: writes a tiny Lean file that `#print axioms` on
 * a named constant. Returns recorded output or an honest skip reason.
 */
export function printAxioms(leanRoot, constantName, lakeBin = 'lake') {
  const tmpDir = join(leanRoot, '.ablation-axioms');
  mkdirSync(tmpDir, { recursive: true });
  const printer = join(tmpDir, 'PrintAxioms.lean');
  writeFileSync(
    printer,
    `import RiemannExpedition\n#print axioms ${constantName}\n`,
    'utf8',
  );
  const r = spawnSync(lakeBin, ['env', 'lean', printer], {
    cwd: leanRoot,
    encoding: 'utf8',
    env: process.env,
  });
  return {
    constant: constantName,
    status: r.status,
    ok: r.status === 0,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
    note:
      r.status === 0
        ? 'Recorded #print axioms output'
        : 'Axiom printer did not succeed; hard gate still requires scanForbidden + lake build',
  };
}

export function runHardGate(leanRoot, opts = {}) {
  const lakeBin = opts.lakeBin || 'lake';
  const scan = scanForbidden(leanRoot);
  const build = opts.skipLake
    ? { ok: null, skipped: true, reason: 'skipLake' }
    : runLakeBuild(leanRoot, lakeBin);
  const axioms =
    opts.printAxiomsConstant && build.ok
      ? printAxioms(leanRoot, opts.printAxiomsConstant, lakeBin)
      : { skipped: true, reason: 'not_requested_or_build_failed' };

  const ok = scan.ok && build.ok === true;
  return {
    ok,
    scan,
    build,
    axioms,
    meaning:
      'Pass = lake build green AND no sorry / user axiom / native_decide in scanned .lean code (comments/strings stripped; worktrees skipped)',
  };
}
