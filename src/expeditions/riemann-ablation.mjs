/**
 * Riemann FractiSI matched ablation — hard Lean gate + receipt helpers.
 *
 * Logic lives here so `tests/expeditions/riemann-ablation.test.mjs` mirrors src.
 * Expedition CLI entry: `expeditions/riemann-fractisi/lean/timing/run-ablation.mjs`.
 *
 * Honesty: measures FractiSI vs no-kit coordination on frozen Lean payloads.
 * Does not claim RH, LLM proof search, or a 30h FLT speedup.
 */

import { spawnSync } from 'node:child_process';
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ABLATION_SCHEMA = 'fractisi.riemann-expedition.ablation.v1';
export const ABLATION_SUMMARY_SCHEMA = 'fractisi.riemann-expedition.ablation-summary.v1';

export const AGENT_PAYLOAD_PATHS = Object.freeze([
  'RiemannExpedition/AgentCritical.lean',
  'RiemannExpedition/AgentProportion.lean',
  'RiemannExpedition/Phase0.lean',
  'RiemannExpedition/PhaseN.lean',
]);

const FORBIDDEN = [
  { id: 'sorry', re: /\bsorry\b/ },
  { id: 'axiom', re: /^\s*axiom\s+/m },
  { id: 'native_decide', re: /\bnative_decide\b/ },
];

const SKIP_DIRS = new Set(['.lake', 'lake-packages', '.fractisi', '.ablation-axioms', '.git']);

function stripLeanNoise(text) {
  let s = text.replace(/\/-[\s\S]*?-\//g, ' ');
  s = s.replace(/--[^\n]*/g, ' ');
  s = s.replace(/"(?:\\.|[^"\\])*"/g, '""');
  return s;
}

function listLeanFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) listLeanFiles(p, out);
    else if (name.endsWith('.lean')) out.push(p);
  }
  return out;
}

/** Absolute path to the expedition Lean root (canonical tree). */
export function leanRootFromHere(fromUrl = import.meta.url) {
  // src/expeditions → repo root → expeditions/riemann-fractisi/lean
  const here = dirname(fileURLToPath(fromUrl));
  return join(here, '../../expeditions/riemann-fractisi/lean');
}

export function scanForbidden(leanRoot) {
  const files = listLeanFiles(leanRoot);
  const hits = [];
  for (const file of files) {
    const text = stripLeanNoise(readFileSync(file, 'utf8'));
    for (const rule of FORBIDDEN) {
      if (rule.re.test(text)) {
        hits.push({ rule: rule.id, file: relative(leanRoot, file) });
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

  return {
    ok: scan.ok && build.ok === true,
    scan,
    build,
    axioms,
    meaning:
      'Pass = lake build green AND no sorry / user axiom / native_decide in scanned .lean code (comments/strings stripped; worktrees skipped)',
  };
}

/** Load and validate the committed five-run ablation summary receipt. */
export function loadAblationSummary(leanRoot = leanRootFromHere()) {
  const path = join(leanRoot, 'receipts/riemann-fractisi-ablation-summary-5runs.json');
  if (!existsSync(path)) return { ok: false, path, error: 'missing_summary' };
  const summary = JSON.parse(readFileSync(path, 'utf8'));
  const problems = [];
  if (summary.schema !== ABLATION_SUMMARY_SCHEMA) problems.push(`schema:${summary.schema}`);
  if (summary.runs !== 5) problems.push(`runs:${summary.runs}`);
  if (summary.allOk !== true) problems.push('allOk_false');
  for (const row of summary.coordinationEvidencePerRun || []) {
    if (row.tasks !== 4 || row.contributions !== 4 || row.compositions !== 1) {
      problems.push(`coordination_run_${row.run}`);
    }
  }
  return { ok: problems.length === 0, path, summary, problems };
}
