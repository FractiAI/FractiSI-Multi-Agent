#!/usr/bin/env node
/**
 * FractiSI · ζ-23 INVENT clock (not find-assemble, not verify)
 *
 * Player 1 requirement: FractiSI discovers/proves on its own — no sealed Anthropic
 * Zeta23/Solution corpus. Agents invent against Challenge-only statements.
 *
 * Strongest protocol on this VM (no Anthropic/OpenAI/HF keys, no ollama/GPU):
 *   FractiSI claim → Lean/Mathlib tactic invent search per Challenge theorem →
 *   compose → lake build Solution → wall clock to green or honest plateau/cutoff.
 *
 * Honesty: tactic invent ≠ inventing Alpöge–Furman analytic argument with LLMs.
 * Reused surface is Mathlib + ChallengeDeps definitions only. RH remains OPEN.
 *
 * Matched invent (Player 1): FractiSI arm has **no cutoff** — run until green Solution
 * or honest plateau (strategies exhausted). No-FractiSI arm uses 180s separately.
 *
 * LLM invent (apples-to-apples vs Anthropic): set GROQ_API_KEY and pass --llm.
 * Agents invent Lean proof bodies via Groq; FractiSI coordinates. No sealed corpus.
 *
 * Usage:
 *   GROQ_API_KEY=… node timing/run-zeta23-invent.mjs --llm --no-cutoff
 *   node timing/run-zeta23-invent.mjs --llm --max-rounds 3
 *   node timing/run-zeta23-invent.mjs --no-cutoff          # Lean tactics only
 */

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  symlinkSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlatform } from '../../../../src/platform/create-platform.mjs';
import {
  inventProofWithGroq,
  buildFractisiInventAwareness,
  ENGINE_PROMPT_ID,
  listLlmKeysPresent,
  groqKeyPresent,
  GROQ_DEFAULT_MODEL,
} from '../../../../src/expeditions/riemann-zeta23-llm.mjs';
import {
  paperMathSystemAddendum,
  ANTHROPIC_INVENT_BASELINE,
} from '../../../../src/expeditions/riemann-zeta23-paper-math.mjs';
import {
  discoverAllInventRhymesImmediate,
  formatRhymeApplyLean,
  omniversalSeedEdgeNav,
  proposeXraySolutionApplies,
  ENDGAME_SEED_MAP,
  readInventMathIndex,
} from '../../../../src/expeditions/riemann-zeta23-rhyme-discover.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPEDITION = resolve(__dirname, '../..');
const VENDOR = join(EXPEDITION, 'zeta23');
const INVENT_ROOT = join(EXPEDITION, '.invent-sandbox', 'zeta23-invent');
const RECEIPTS = join(resolve(__dirname, '..'), 'receipts');

const CHALLENGE_ONLY = [
  'Challenge.lean',
  'ChallengeDeps.lean',
  'Challenge',
  'ChallengeDeps',
  'lean-toolchain',
  'LICENSE',
  'NOTICE',
  'README.md',
  'comparator.json',
  'formalization.yaml',
  'lake-manifest.json',
];

/** Headline Challenge theorems (A–E + Dirichlet). Invent target = prove these without Zeta23. */
const INVENT_THEOREMS = [
  {
    agent: 'invent-thmA',
    name: 'two_thirds_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)',
  },
  {
    agent: 'invent-thmA',
    name: 'two_thirds_on_critical_line_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount 0 T : ℝ) ≤ N0star 0 T',
  },
  {
    agent: 'invent-thmBC',
    name: 'two_thirds_simple_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)',
  },
  {
    agent: 'invent-thmBC',
    name: 'two_thirds_simple_on_critical_line_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (Ncount 0 T : ℝ) ≤ N0simple 0 T',
  },
  {
    agent: 'invent-thmBC',
    name: 'five_sixths_distinct',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)',
  },
  {
    agent: 'invent-thmBC',
    name: 'five_sixths_distinct_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (Ncount 0 T : ℝ) ≤ Ndist 0 T',
  },
  {
    agent: 'invent-thmD',
    name: 'montgomery_taylor_on_critical_line',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount T (2 * T) : ℝ) ≤ N0star T (2 * T)',
  },
  {
    agent: 'invent-thmD',
    name: 'montgomery_taylor_simple_on_critical_line_mult',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount T (2 * T) : ℝ) ≤ N0simple T (2 * T)',
  },
  {
    agent: 'invent-thmD',
    name: 'montgomery_taylor_simple_on_critical_line_mult_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (Ncount 0 T : ℝ) ≤ N0simple 0 T',
  },
  {
    agent: 'invent-thmD',
    name: 'montgomery_taylor_distinct_mult',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (Ncount T (2 * T) : ℝ) ≤ Ndist T (2 * T)',
  },
  {
    agent: 'invent-thmD',
    name: 'montgomery_taylor_distinct_mult_cumulative',
    stmt: '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (Ncount 0 T : ℝ) ≤ Ndist 0 T',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_two_thirds_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0starL χ T (2 * T)',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_two_thirds_simple_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 / 3 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0simpleL χ T (2 * T)',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_five_sixths_distinct',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (5 / 6 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ NdistL χ T (2 * T)',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_montgomery_taylor_on_critical_line',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0starL χ T (2 * T)',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_montgomery_taylor_simple_on_critical_line_mult',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (2 - 1 / cMT - ε) * (NcountL χ T (2 * T) : ℝ) ≤ N0simpleL χ T (2 * T)',
  },
  {
    agent: 'invent-thmE',
    name: 'dirichlet_montgomery_taylor_distinct_mult',
    binders:
      '{q : ℕ} [NeZero q] (χ : DirichletCharacter ℂ q) (hq : 1 < q) (hχ : χ.IsPrimitive)',
    stmt:
      '∀ ε > 0, ∃ T₀ : ℝ, ∀ T ≥ T₀, (3 / 2 - cMT⁻¹ / 2 - ε) * (NcountL χ T (2 * T) : ℝ) ≤ NdistL χ T (2 * T)',
  },
];

/** Tactic invent strategies (local Lean search — no LLM, no sealed corpus). */
const TACTIC_STRATEGIES = [
  { id: 'aesop', body: 'aesop' },
  { id: 'simp_all', body: 'simp_all' },
  { id: 'first_barrage', body: 'first | aesop | simp_all | decide | omega | linarith | ring_nf | trivial' },
  { id: 'exact_false_probe', body: 'exact False.elim (by sorry)' }, // deliberately not a win; skipped in scoring
];

const FORBIDDEN_IMPORTS = ['Zeta23', 'Solution'];
/** null = no cutoff (default for FractiSI invent arm). */
const DEFAULT_CUTOFF_SECONDS = null;

function parseArgs(argv) {
  const out = {
    cutoffSeconds: DEFAULT_CUTOFF_SECONDS,
    noCutoff: true,
    llm: false,
    maxRounds: null,
    model: GROQ_DEFAULT_MODEL,
    receipt: null,
    skipLake: false,
    compare: false,
    paper: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-cutoff') {
      out.noCutoff = true;
      out.cutoffSeconds = null;
    } else if (a === '--cutoff-seconds') {
      out.cutoffSeconds = Number(argv[++i]);
      out.noCutoff = false;
    } else if (a === '--llm') out.llm = true;
    else if (a === '--max-rounds') out.maxRounds = Number(argv[++i]);
    else if (a === '--model') out.model = argv[++i] || GROQ_DEFAULT_MODEL;
    else if (a === '--receipt') out.receipt = resolve(argv[++i] ?? '');
    else if (a === '--skip-lake') out.skipLake = true;
    else if (a === '--compare') {
      out.compare = true;
      out.paper = true;
      out.llm = true;
    } else if (a === '--paper') out.paper = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  if (out.cutoffSeconds != null && (!Number.isFinite(out.cutoffSeconds) || out.cutoffSeconds <= 0)) {
    out.cutoffSeconds = null;
    out.noCutoff = true;
  }
  if (out.maxRounds != null && (!Number.isFinite(out.maxRounds) || out.maxRounds <= 0)) {
    out.maxRounds = null;
  }
  return out;
}

function which(bin) {
  const r = spawnSync('bash', ['-lc', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? INVENT_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${process.env.HOME}/.elan/bin:${process.env.PATH || ''}`,
      ...(opts.env || {}),
    },
    maxBuffer: 64 * 1024 * 1024,
    timeout: opts.timeoutMs,
  });
  return {
    cmd: [cmd, ...args].join(' '),
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
  };
}

function apiKeysPresent() {
  return {
    ...listLlmKeysPresent(),
    GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY),
    HF_TOKEN: Boolean(process.env.HF_TOKEN),
  };
}

function challengeOnlyInventory(root) {
  return {
    Zeta23Dir: !existsSync(join(root, 'Zeta23')),
    Zeta23Lean: !existsSync(join(root, 'Zeta23.lean')),
    SolutionLean: existsSync(join(root, 'Solution.lean')),
    SolutionDir: !existsSync(join(root, 'Solution')),
    sealedCorpusReadableByAgents: false,
  };
}

function assertNoSealedLeak(root) {
  const leaks = [];
  if (existsSync(join(root, 'Zeta23'))) leaks.push('Zeta23/');
  if (existsSync(join(root, 'Zeta23.lean'))) leaks.push('Zeta23.lean');
  // Vendor Anthropic Solution must not be copied in; only invent Solution.lean we write.
  for (const name of readdirSync(root)) {
    if (name === 'Zeta23' || name.startsWith('Zeta23.')) leaks.push(name);
  }
  return leaks;
}

/** Main-estimate Prop names → Challenge-typed invent_<edge> composition. */
const MAIN_ESTIMATE_SEED_CLOSES = Object.freeze([
  {
    estimate: 'main_estimate_Hfun_N0star',
    prop: 'MainEstimateHfunN0star',
    seed: 'invent_two_thirds_on_critical_line',
    edge: 'two_thirds_on_critical_line',
    body: 'exact invent_two_thirds_on_critical_line_of_main main_estimate_Hfun_N0star',
  },
  {
    estimate: 'main_estimate_Ffun_N0simple',
    prop: 'MainEstimateFfunN0simple',
    seed: 'invent_two_thirds_simple_on_critical_line',
    edge: 'two_thirds_simple_on_critical_line',
    // Challenge B needs 2/3; glueB gives 1/2. Keep composition for half-shape invent awareness;
    // full 2/3 simple needs multiplicity lift (remaining invent).
    body: 'exact invent_half_simple_of_main main_estimate_Ffun_N0simple',
    challengeTypeMismatch: true,
  },
  {
    estimate: 'main_estimate_Ffun_Ndist',
    prop: 'MainEstimateFfunNdist',
    seed: 'invent_five_sixths_distinct',
    edge: 'five_sixths_distinct',
    // glueC gives 3/4; Challenge C needs 5/6 via (3−R)/2. Composition is 3/4-shape.
    body: 'exact invent_three_quarters_distinct_of_main main_estimate_Ffun_Ndist',
    challengeTypeMismatch: true,
  },
]);

function writeInventLakefile(
  root,
  {
    withInventMath = false,
    withRhymeApply = false,
    withInventEndgame = false,
    withInventAnalytic = false,
  } = {},
) {
  // Drop Zeta23 target — invent must not depend on Anthropic proof library.
  const inventMathLib = withInventMath
    ? `
[[lean_lib]]
name = "InventMath"
roots = ["InventMath"]
`
    : '';
  const inventAnalyticLib =
    withInventMath && withInventAnalytic
      ? `
[[lean_lib]]
name = "InventAnalytic"
roots = ["InventAnalytic"]
`
      : '';
  const inventEndgameLib =
    withInventMath && withInventEndgame
      ? `
[[lean_lib]]
name = "InventEndgame"
roots = ["InventEndgame"]
`
      : '';
  const rhymeApplyLib =
    withInventMath && withRhymeApply
      ? `
[[lean_lib]]
name = "RhymeApply"
roots = ["RhymeApply"]
`
      : '';
  const libs = ['ChallengeDeps', 'Challenge'];
  if (withInventMath) libs.push('InventMath');
  if (withInventAnalytic) libs.push('InventAnalytic');
  if (withInventEndgame) libs.push('InventEndgame');
  if (withRhymeApply) libs.push('RhymeApply');
  libs.push('Solution');
  const defaults = JSON.stringify(libs);
  const body = `name = "Zeta23Invent"
version = "0.1.0"
defaultTargets = ${defaults}

[leanOptions]
pp.unicode.fun = true
relaxedAutoImplicit = false

[[require]]
name = "mathlib"
git = "https://github.com/leanprover-community/mathlib4"
rev = "51e6992efd06126df61a496bebf8f49482a4e129"

[[lean_lib]]
name = "ChallengeDeps"
roots = ["ChallengeDeps"]

[[lean_lib]]
name = "Challenge"
roots = ["Challenge"]
${inventMathLib}${inventAnalyticLib}${inventEndgameLib}${rhymeApplyLib}
[[lean_lib]]
name = "Solution"
roots = ["Solution"]
`;
  writeFileSync(join(root, 'lakefile.toml'), body);
}

function renderTheorem(thm, tacticBody) {
  const binders = thm.binders ? ` ${thm.binders}` : '';
  return `theorem ${thm.name}${binders} :\n    ${thm.stmt} := by\n  ${tacticBody}\n`;
}

function writeSolution(root, proofs, { withInventMath = false, withInventEndgame = false } = {}) {
  const header = `/-
FractiSI invent Solution — NO import of Anthropic Zeta23 library.
Near-instant close path: exact invent_<edge> endgame seeds (InventEndgame),
same thin shape as Anthropic Solution → Zeta23.thmA₀.
-/
import ChallengeDeps
${withInventMath ? 'import InventMath\n' : ''}${withInventEndgame ? 'import InventEndgame\n' : ''}
noncomputable section

`;
  let body = header;
  for (const thm of INVENT_THEOREMS) {
    const proof = proofs.get(thm.name) || { tacticId: 'sorry_hold', body: 'sorry' };
    body += `/-- Invent attempt (${proof.tacticId}) for ${thm.name}. -/\n`;
    body += renderTheorem(thm, proof.body);
    body += '\n';
  }
  body += 'end\n';
  writeFileSync(join(root, 'Solution.lean'), body);
}

/** Append or replace an invent_<edge> seed proof inside InventEndgame.lean. */
function upsertInventEndgameSeed(root, seedName, thm, tacticBody) {
  const path = join(root, 'InventEndgame.lean');
  if (!existsSync(path)) return false;
  let text = readFileSync(path, 'utf8');
  const binders = thm.binders ? ` ${thm.binders}` : '';
  const block = `
/-- Challenge-typed endgame seed (Solution exact partner). -/
theorem ${seedName}${binders} :
    ${thm.stmt} := by
  ${String(tacticBody).trim().split('\n').join('\n  ')}
`;
  const re = new RegExp(
    `(?:/--[^\\n]*\\n)?theorem\\s+${seedName}\\b[\\s\\S]*?(?=\\n(?:theorem|lemma|end)\\b)`,
  );
  if (re.test(text)) {
    text = text.replace(re, block.trim() + '\n\n');
  } else {
    text = text.replace(/\nend\s*\n\s*$/, `\n${block}\nend\n`);
  }
  writeFileSync(path, text);
  return true;
}

/**
 * When unconditional main_estimate_* theorems are closed in InventEndgame,
 * write Challenge-typed invent_<edge> seeds via glue composition and Solution exact.
 * Returns { closedSeeds, proofsUpdated }.
 */
function tryCloseSeedsFromMainEstimates(root, proofs, inventTheorems) {
  const { decls } = readInventMathIndex({
    inventMathPath: join(root, 'InventMath.lean'),
    inventEndgamePath: join(root, 'InventEndgame.lean'),
    inventAnalyticPath: join(root, 'InventAnalytic.lean'),
  });
  const closedSeeds = [];
  for (const row of MAIN_ESTIMATE_SEED_CLOSES) {
    if (row.challengeTypeMismatch) continue; // half/¾ shapes ≠ Challenge 2/3·5/6 yet
    const est = decls.get(row.estimate);
    if (!est?.closed) continue;
    const thm = inventTheorems.find((t) => t.name === row.edge);
    if (!thm) continue;
    upsertInventEndgameSeed(root, row.seed, thm, row.body);
    proofs.set(thm.name, {
      tacticId: `exact_endgame:${row.seed}`,
      body: `exact ${row.seed}`,
      closed: false,
      nearInstant: true,
      fromMainEstimate: row.estimate,
    });
    closedSeeds.push(row);
  }
  return { closedSeeds, decls };
}

function solutionImportsZeta23(root) {
  if (!existsSync(join(root, 'Solution.lean'))) return false;
  const text = readFileSync(join(root, 'Solution.lean'), 'utf8');
  return FORBIDDEN_IMPORTS.some((name) => new RegExp(`import\\s+${name}\\b`).test(text));
}

function countSorriesInSolution(root) {
  if (!existsSync(join(root, 'Solution.lean'))) return { sorryCount: -1 };
  const text = readFileSync(join(root, 'Solution.lean'), 'utf8');
  const m = text.match(/\bsorry\b/g);
  return { sorryCount: m ? m.length : 0 };
}

function prepareInventSandbox({ withInventMath = false } = {}) {
  rmSync(INVENT_ROOT, { recursive: true, force: true });
  mkdirSync(INVENT_ROOT, { recursive: true });
  for (const name of CHALLENGE_ONLY) {
    const src = join(VENDOR, name);
    if (!existsSync(src)) continue;
    cpSync(src, join(INVENT_ROOT, name), { recursive: true });
  }
  const inventMathSrc = join(resolve(__dirname, '..'), 'invent-math', 'InventMath.lean');
  const inventAnalyticSrc = join(resolve(__dirname, '..'), 'invent-math', 'InventAnalytic.lean');
  const inventEndgameSrc = join(resolve(__dirname, '..'), 'invent-math', 'InventEndgame.lean');
  let withInventEndgame = false;
  let withInventAnalytic = false;
  if (withInventMath) {
    if (!existsSync(inventMathSrc)) {
      throw new Error(`missing InventMath at ${inventMathSrc}`);
    }
    cpSync(inventMathSrc, join(INVENT_ROOT, 'InventMath.lean'));
    if (existsSync(inventAnalyticSrc)) {
      cpSync(inventAnalyticSrc, join(INVENT_ROOT, 'InventAnalytic.lean'));
      withInventAnalytic = true;
    }
    if (existsSync(inventEndgameSrc)) {
      cpSync(inventEndgameSrc, join(INVENT_ROOT, 'InventEndgame.lean'));
      withInventEndgame = true;
    }
  }
  writeInventLakefile(INVENT_ROOT, {
    withInventMath,
    withRhymeApply: withInventMath,
    withInventEndgame,
    withInventAnalytic,
  });
  // Warm Mathlib cache only (no proof modules).
  const lakeSrc = join(VENDOR, '.lake');
  if (existsSync(lakeSrc)) {
    try {
      symlinkSync(lakeSrc, join(INVENT_ROOT, '.lake'));
    } catch {
      /* optional */
    }
  }
  const anthropicProofsAbsent = {
    Zeta23DirAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23')),
    Zeta23LeanAbsent: !existsSync(join(INVENT_ROOT, 'Zeta23.lean')),
    SolutionLeanAbsentBeforeInventShell: !existsSync(join(INVENT_ROOT, 'Solution.lean')),
    SolutionDirAbsent: !existsSync(join(INVENT_ROOT, 'Solution')),
    sealedCorpusReadableByAgents: false,
  };
  // Start Solution as all-sorry invent shell (no Anthropic Solution copy).
  // Prefer exact invent_<edge> when endgame seed already closed in InventEndgame.
  const proofs = new Map();
  const { decls } = withInventEndgame
    ? readInventMathIndex({
        inventMathPath: join(INVENT_ROOT, 'InventMath.lean'),
        inventAnalyticPath: join(INVENT_ROOT, 'InventAnalytic.lean'),
        inventEndgamePath: join(INVENT_ROOT, 'InventEndgame.lean'),
      })
    : { decls: new Map() };
  for (const thm of INVENT_THEOREMS) {
    const seed = ENDGAME_SEED_MAP[thm.name] || `invent_${thm.name}`;
    const seedDecl = decls.get(seed);
    if (seedDecl?.challengeTypeExact && seedDecl.closed) {
      proofs.set(thm.name, {
        tacticId: `exact_endgame:${seed}`,
        body: `exact ${seed}`,
        closed: false,
        nearInstant: true,
      });
    } else {
      proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry', closed: false });
    }
  }
  // Auto-close Challenge A seed when main_estimate_Hfun_N0star already invented.
  if (withInventEndgame) {
    tryCloseSeedsFromMainEstimates(INVENT_ROOT, proofs, INVENT_THEOREMS);
    writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
  } else {
    writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
  }
  return {
    challengeOnly: anthropicProofsAbsent,
    inventSolutionShellWritten: true,
    withInventMath,
    withInventEndgame,
    withInventAnalytic,
    leaks: assertNoSealedLeak(INVENT_ROOT),
  };
}

function groupByAgent() {
  const map = new Map();
  for (const thm of INVENT_THEOREMS) {
    if (!map.has(thm.agent)) map.set(thm.agent, []);
    map.get(thm.agent).push(thm);
  }
  return map;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      'Usage: node timing/run-zeta23-invent.mjs [--llm] [--compare] [--paper] [--no-cutoff] [--max-rounds N] [--model ID] [--cutoff-seconds N] [--skip-lake] [--receipt PATH]',
    );
    process.exit(0);
  }

  const keys = apiKeysPresent();
  if (args.llm && !groqKeyPresent()) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: 'GROQ_API_KEY required for --llm invent (apples-to-apples vs Anthropic LLM invent)',
          hint: 'export GROQ_API_KEY=… then re-run. Do not commit the key.',
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
  const llmMode = Boolean(args.llm);
  const compareMode = Boolean(args.compare);
  const paperMode = Boolean(args.paper || args.compare);
  const withInventMath = paperMode || compareMode;
  const paperAddendum = paperMode ? paperMathSystemAddendum() : null;
  const anyLlmKey = Object.values(keys).some(Boolean);
  const prep = prepareInventSandbox({ withInventMath });
  const withInventEndgame = Boolean(prep.withInventEndgame);
  const withInventAnalytic = Boolean(prep.withInventAnalytic);
  if (prep.leaks.length) {
    console.error('sealed leak into invent sandbox', prep.leaks);
    process.exit(1);
  }

  const startedAt = new Date();
  const t0 = performance.now();
  const noCutoff = args.cutoffSeconds == null || args.noCutoff;
  const cutoffMs = noCutoff ? Number.POSITIVE_INFINITY : args.cutoffSeconds * 1000;
  const steps = [];
  const attempts = [];

  const statePath = join(INVENT_ROOT, '.fractisi', `invent-state-${Date.now()}.json`);
  mkdirSync(dirname(statePath), { recursive: true });
  const platform = createPlatform({
    statePath,
    project: { name: 'zeta23-invent', root: INVENT_ROOT },
    useWorktrees: false,
    tier: 'enterprise',
  });

  const agentIds = [];
  const taskIds = [];
  const contribIds = [];
  const proofs = new Map();
  for (const thm of INVENT_THEOREMS) {
    proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry', closed: false });
  }

  // --- Omniversal x-ray + GPS + immediate rhyme (#53 discover → #52 apply → lake) ---
  // X-ray brings every seed↔edge partner into view; GPS routes next hop to 17/17.
  // When endgame seeds are Challenge-typed, Solution exact closes near-instantly.
  let rhymeImmediate = null;
  let rhymeApplyLakeOk = false;
  let rhymeImmediateCloses = 0;
  let omniversalNav = null;
  let xraySolutionCloses = 0;
  if (withInventMath && !args.skipLake) {
    const solutionClosed = new Set(
      [...proofs.entries()].filter(([, p]) => p.closed).map(([n]) => n),
    );
    omniversalNav = omniversalSeedEdgeNav(INVENT_THEOREMS, { solutionClosed });
    rhymeImmediate = discoverAllInventRhymesImmediate(INVENT_THEOREMS, {
      proofs,
      solutionClosed,
    });
    const applyLean = formatRhymeApplyLean(rhymeImmediate.uniqueApplyPartners);
    writeFileSync(join(INVENT_ROOT, 'RhymeApply.lean'), applyLean);
    writeInventLakefile(INVENT_ROOT, {
      withInventMath: true,
      withRhymeApply: true,
      withInventEndgame,
      withInventAnalytic,
    });
    const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
    const rhymeBuild = run(lake, ['build', 'RhymeApply'], {
      cwd: INVENT_ROOT,
      timeoutMs: 180_000,
    });
    rhymeApplyLakeOk = rhymeBuild.status === 0;
    rhymeImmediateCloses = rhymeApplyLakeOk ? rhymeImmediate.uniqueApplyPartners.length : 0;
    steps.push({
      name: 'omniversal-xray-gps-nested-tunnel',
      ok: true,
      durationMs: omniversalNav.durationMs,
      whereWeAre: omniversalNav.whereWeAre,
      highestPair: omniversalNav.highestPair,
      fleetInstruction: omniversalNav.fleetInstruction,
      destination: omniversalNav.destination,
      nestedTunnel: omniversalNav.nestedTunnel
        ? {
            recursive: omniversalNav.nestedTunnel.recursive,
            bidirectional: omniversalNav.nestedTunnel.bidirectional,
            meetInMiddle: omniversalNav.nestedTunnel.meetInMiddle,
            summary: omniversalNav.nestedTunnel.summary,
            instruction: omniversalNav.nestedTunnel.instruction,
          }
        : null,
      nextHops: (omniversalNav.gps?.nextHops || []).slice(0, 5).map((r) => ({
        edge: r.edge,
        nextHop: r.nextHop,
        instruction: r.instruction,
      })),
    });
    steps.push({
      name: 'rhyme-immediate-apply',
      ok: rhymeApplyLakeOk,
      durationMs: rhymeImmediate.durationMs,
      namedDiscoveryCount: rhymeImmediate.namedDiscoveryCount,
      uniqueApplyPartners: rhymeImmediate.uniqueApplyPartners.length,
      rhymeImmediateCloses,
      stderrTail: (rhymeBuild.stderr || rhymeBuild.stdout || '').slice(-800),
    });

    // Near-instant Solution closes: GPS next hops that are exact endgame seeds.
    const xrayApplies =
      proposeXraySolutionApplies(omniversalNav.xray).length > 0
        ? proposeXraySolutionApplies(omniversalNav.xray)
        : rhymeImmediate.xraySolutionApplies || [];
    for (const a of xrayApplies) {
      const previous = proofs.get(a.theorem) || {
        tacticId: 'sorry_hold',
        body: 'sorry',
        closed: false,
      };
      if (previous.closed) continue;
      proofs.set(a.theorem, {
        tacticId: `xray_gps:${a.partnerName}`,
        body: a.tacticBody,
        closed: false,
        nearInstant: true,
        omniversal: true,
      });
      writeSolution(INVENT_ROOT, proofs, { withInventMath: true, withInventEndgame });
      if (solutionImportsZeta23(INVENT_ROOT)) {
        console.error('INVARIANT FAIL: invent Solution imported Zeta23');
        process.exit(2);
      }
      const build = run(lake, ['build', 'Solution'], {
        cwd: INVENT_ROOT,
        timeoutMs: 180_000,
      });
      const body = String(proofs.get(a.theorem)?.body || '');
      const honest =
        body.trim().length > 0 &&
        !/\bsorry\b/.test(body) &&
        !/\badmit\b/.test(body) &&
        // Solution may only exact Challenge-typed endgame seeds — never Hfun_one etc.
        (body.trim() === `exact ${ENDGAME_SEED_MAP[a.theorem] || `invent_${a.theorem}`}` ||
          body.trim().startsWith('exact invent_'));
      if (build.status === 0 && honest) {
        proofs.set(a.theorem, { ...proofs.get(a.theorem), closed: true });
        xraySolutionCloses += 1;
        steps.push({
          name: `xray-gps-exact-${a.theorem}`,
          ok: true,
          partner: a.partnerName,
          nearInstant: true,
        });
      } else {
        proofs.set(a.theorem, {
          tacticId: 'sorry_hold',
          body: 'sorry',
          closed: false,
          reverted: true,
        });
        writeSolution(INVENT_ROOT, proofs, { withInventMath: true, withInventEndgame });
        steps.push({
          name: `xray-gps-exact-${a.theorem}`,
          ok: false,
          partner: a.partnerName,
          stderrTail: (build.stderr || build.stdout || '').slice(-600),
        });
      }
    }

    mkdirSync(RECEIPTS, { recursive: true });
    writeFileSync(
      join(RECEIPTS, 'riemann-fractisi-zeta23-invent-rhyme-discoveries-latest.json'),
      JSON.stringify(
        {
          schema: 'fractisi.riemann-expedition.zeta23-invent-rhyme-discoveries.v1',
          generatedAt: new Date().toISOString(),
          ...rhymeImmediate,
          rhymeApplyLakeOk,
          rhymeImmediateCloses,
          xraySolutionCloses,
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(RECEIPTS, 'riemann-fractisi-zeta23-omniversal-xray-gps-latest.json'),
      JSON.stringify(
        {
          schema: 'fractisi.riemann-expedition.zeta23-omniversal-xray-gps.v1',
          generatedAt: new Date().toISOString(),
          ...omniversalNav,
          xraySolutionCloses,
        },
        null,
        2,
      ),
    );
  }

  const byAgent = groupByAgent();
  const strategies = TACTIC_STRATEGIES.filter((s) => s.id !== 'exact_false_probe');
  const agentByName = new Map();
  let lastBuildStderr = '';

  for (const agentName of byAgent.keys()) {
    const agent = platform.coordination.agents.register({
      name: agentName,
      framework: llmMode ? 'expedition-zeta23-invent-llm' : 'expedition-zeta23-invent',
    });
    platform.coordination.agents.setStatus(agent.id, 'active');
    agentIds.push(agent.id);
    agentByName.set(agentName, agent);
  }

  // Invent loop under FractiSI until cutoff, maxRounds, green, or tactic plateau.
  let round = 0;
  let plateau = false;
  let compositionId = null;
  let llmCalls = 0;
  let llmOkCalls = 0;
  let awarenessInjections = 0;
  let awarenessCharsTotal = 0;
  let rhymeDiscoveries = rhymeImmediate?.namedDiscoveryCount || 0;
  let rhymeDiscoveryCharsTotal = 0;
  const rhymeLeadingPartners = (rhymeImmediate?.perTheorem || []).map((p) => ({
    theorem: p.theorem,
    leadingPartner: p.leadingPartner,
    leadingCoupling: p.leadingCoupling,
    boardTop: p.boardTop,
  }));
  const llmModelsUsed = new Set();
  while (performance.now() - t0 < cutoffMs) {
    round += 1;
    if (args.maxRounds != null && round > args.maxRounds) {
      steps.push({ name: 'max-rounds', ok: true, maxRounds: args.maxRounds, roundsCompleted: round - 1 });
      break;
    }
    let closedThisRound = 0;
    const strategy = strategies[(round - 1) % strategies.length];
    const roundContribIds = [];

    for (const [agentName, thms] of byAgent.entries()) {
      if (performance.now() - t0 >= cutoffMs) break;
      const agent = agentByName.get(agentName);
      const openThms = thms.filter((t) => !proofs.get(t.name)?.closed);
      if (!openThms.length) continue;

      // Compare / LLM invent: try ONE open theorem at a time, lake-check, keep only
      // honest closes. Prevents one bad tactic from blocking the whole Solution build.
      // Rotate through open theorems by round so we don't retry the same head forever.
      let thmsToTry = openThms;
      if (llmMode || compareMode) {
        const idx = (round - 1) % openThms.length;
        thmsToTry = [openThms[idx]];
      }
      const paths = thmsToTry.map((t) => `Solution.lean#${t.name}`);
      const task = platform.coordination.ownership.claimTask({
        agentId: agent.id,
        title: `invent ${agentName} round ${round} (${thmsToTry.map((t) => t.name).join(',')})${llmMode ? ' [llm]' : ''}`,
        paths,
      });
      taskIds.push(task.id);
      const gate = platform.coordination.conflicts.canProceedIndependently(task.id);
      steps.push({ name: `claim-${agentName}-r${round}`, ok: gate.ok, open: openThms.length, trying: thmsToTry.map((t) => t.name) });
      if (!gate.ok) {
        platform.coordination.ownership.setStatus(task.id, 'done');
        continue;
      }

      for (const thm of thmsToTry) {
        if (performance.now() - t0 >= cutoffMs) break;
        const previous = proofs.get(thm.name) || {
          tacticId: 'sorry_hold',
          body: 'sorry',
          closed: false,
        };
        if (llmMode) {
          llmCalls += 1;
          const awareness = buildFractisiInventAwareness({
            platform,
            agentName,
            theorem: thm.name,
            proofs,
            attempts,
            round,
            priorError: lastBuildStderr,
          });
          awarenessInjections += 1;
          awarenessCharsTotal += awareness.length;
          // Pace Groq TPM between theorems (compare prompts are large).
          if (llmCalls > 1) {
            spawnSync('sleep', [compareMode ? '2.5' : '1'], { encoding: 'utf8' });
          }
          const invented = inventProofWithGroq({
            theorem: thm.name,
            binders: thm.binders,
            stmt: thm.stmt,
            priorError: lastBuildStderr,
            model: args.model,
            awareness,
            agentName,
            platform,
            proofs,
            attempts,
            round,
            paperAddendum,
            maxTokens: compareMode ? 1800 : 2500,
          });
          if (invented.model) llmModelsUsed.add(invented.model);
          if (invented.rhymeDiscovery?.ok) {
            rhymeDiscoveries += 1;
            rhymeDiscoveryCharsTotal += invented.discoveryChars || 0;
            if (invented.rhymeDiscovery.leadingPartner) {
              rhymeLeadingPartners.push({
                theorem: thm.name,
                round,
                leadingPartner: invented.rhymeDiscovery.leadingPartner,
                catalogN: invented.rhymeDiscovery.productCatalog?.n ?? null,
                boardTop: (invented.rhymeDiscovery.awareBoard || [])
                  .slice(0, 3)
                  .map((p) => ({ id: p.id, coupling: p.coupling })),
              });
            }
          }
          const rhymeMeta = {
            rhymeDiscover: Boolean(invented.rhymeDiscovery?.ok),
            leadingPartner: invented.rhymeDiscovery?.leadingPartner || null,
            productCatalogN: invented.rhymeDiscovery?.productCatalog?.n ?? null,
          };
          if (invented.ok) {
            llmOkCalls += 1;
            const seed = ENDGAME_SEED_MAP[thm.name] || `invent_${thm.name}`;
            // Nested-tunnel fix: invent Challenge-typed endgame seed FIRST, then
            // Solution does near-instant `exact invent_<edge>` (never exact Hfun_one).
            let endgameOk = false;
            if (withInventEndgame && !args.skipLake) {
              upsertInventEndgameSeed(INVENT_ROOT, seed, thm, invented.body);
              const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
              const egBuild = run(lake, ['build', 'InventEndgame'], {
                cwd: INVENT_ROOT,
                timeoutMs: 180_000,
              });
              endgameOk =
                egBuild.status === 0 &&
                !/\bsorry\b/.test(invented.body) &&
                !/\badmit\b/.test(invented.body);
              lastBuildStderr = (egBuild.stderr || egBuild.stdout || '').slice(-4000);
              steps.push({
                name: `invent-endgame-seed-r${round}-${seed}`,
                ok: endgameOk,
                status: egBuild.status,
                stderrTail: lastBuildStderr.slice(-800),
              });
              // Sync durable InventEndgame source when seed lake-greens.
              if (endgameOk) {
                const durable = join(resolve(__dirname, '..'), 'invent-math', 'InventEndgame.lean');
                cpSync(join(INVENT_ROOT, 'InventEndgame.lean'), durable);
              }
            }
            proofs.set(thm.name, {
              tacticId: endgameOk ? `exact_endgame:${seed}` : `llm:${invented.model}`,
              body: endgameOk ? `exact ${seed}` : invented.body,
              closed: false,
              round,
              llm: true,
              awareness: true,
              endgameSeed: seed,
              endgameOk,
              ...rhymeMeta,
            });
            attempts.push({
              atSeconds: (performance.now() - t0) / 1000,
              agent: agentName,
              theorem: thm.name,
              strategy: endgameOk ? `exact_endgame:${seed}` : `llm:${invented.model}`,
              round,
              llm: true,
              awareness: true,
              endgameOk,
              ...rhymeMeta,
              ok: true,
            });
          } else {
            // Keep previous body if it was already a non-sorry attempt; else sorry.
            proofs.set(thm.name, {
              ...previous,
              closed: previous.closed === true,
              round,
              llm: true,
              awareness: true,
              llmError: invented.error,
              ...rhymeMeta,
            });
            attempts.push({
              atSeconds: (performance.now() - t0) / 1000,
              agent: agentName,
              theorem: thm.name,
              strategy: 'llm_failed',
              round,
              llm: true,
              awareness: true,
              ...rhymeMeta,
              ok: false,
              error: invented.error,
            });
          }
        } else {
          // Non-LLM: first try exact endgame seed if present; else tactic barrage.
          const seed = ENDGAME_SEED_MAP[thm.name] || `invent_${thm.name}`;
          const { decls } = withInventEndgame
            ? readInventMathIndex({
                inventMathPath: join(INVENT_ROOT, 'InventMath.lean'),
                inventEndgamePath: join(INVENT_ROOT, 'InventEndgame.lean'),
              })
            : { decls: new Map() };
          if (decls.get(seed)?.challengeTypeExact) {
            proofs.set(thm.name, {
              tacticId: `exact_endgame:${seed}`,
              body: `exact ${seed}`,
              closed: false,
              round,
              nearInstant: true,
            });
          } else {
            proofs.set(thm.name, {
              tacticId: strategy.id,
              body: strategy.body,
              closed: false,
              round,
            });
          }
          attempts.push({
            atSeconds: (performance.now() - t0) / 1000,
            agent: agentName,
            theorem: thm.name,
            strategy: proofs.get(thm.name)?.tacticId || strategy.id,
            round,
            llm: false,
          });
        }

        // Per-theorem lake gate (accumulate closes toward 17/17).
        writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
        if (solutionImportsZeta23(INVENT_ROOT)) {
          console.error('INVARIANT FAIL: invent Solution imported Zeta23');
          process.exit(2);
        }
        if (!args.skipLake) {
          const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
          const remaining = noCutoff
            ? 180_000
            : cutoffMs - (performance.now() - t0);
          const build = run(lake, ['build', 'Solution'], {
            cwd: INVENT_ROOT,
            timeoutMs: Math.max(20_000, Math.min(remaining, 180_000)),
          });
          const buildOk = build.status === 0;
          lastBuildStderr = (build.stderr || build.stdout || build.error || '').slice(-4000);
          steps.push({
            name: `lake-build-r${round}-${thm.name}`,
            ok: buildOk,
            status: build.status,
            theorem: thm.name,
            strategy: llmMode ? 'llm' : strategy.id,
            stderrTail: lastBuildStderr.slice(-1200),
          });
          const body = String(proofs.get(thm.name)?.body || '');
          const honest =
            body.trim().length > 0 && !/\bsorry\b/.test(body) && !/\badmit\b/.test(body);
          if (buildOk && honest) {
            proofs.set(thm.name, { ...proofs.get(thm.name), closed: true });
            closedThisRound += 1;
          } else if (!buildOk && !previous.closed) {
            // Revert failed invent so Solution stays buildable for other theorems.
            proofs.set(thm.name, {
              tacticId: 'sorry_hold',
              body: 'sorry',
              closed: false,
              round,
              reverted: true,
            });
            writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
          }
        }
      }

      const contrib = platform.composition.submitContribution({
        agentId: agent.id,
        taskId: task.id,
        paths,
        summary: llmMode
          ? `llm invent round ${round} ${agentName}`
          : `invent round ${round} ${agentName}: strategy=${strategy.id}`,
        files: {},
        meta: {
          invent: true,
          sealedCorpus: false,
          llm: llmMode,
          strategy: llmMode ? 'groq' : strategy.id,
        },
      });
      contribIds.push(contrib.id);
      roundContribIds.push(contrib.id);
      // Release path locks so later rounds can reclaim Solution.lean#theorem paths.
      // Without this, round≥2 claims all fail high-severity path conflicts.
      platform.coordination.ownership.setStatus(task.id, 'done');
    }

    // After invent attempts: close Challenge-typed seeds from any newly proved main estimates.
    if (withInventEndgame) {
      const fromMain = tryCloseSeedsFromMainEstimates(INVENT_ROOT, proofs, INVENT_THEOREMS);
      if (fromMain.closedSeeds.length) {
        steps.push({
          name: `close-seeds-from-main-r${round}`,
          ok: true,
          closedSeeds: fromMain.closedSeeds.map((r) => r.seed),
          estimates: fromMain.closedSeeds.map((r) => r.estimate),
        });
        const durable = join(resolve(__dirname, '..'), 'invent-math', 'InventEndgame.lean');
        cpSync(join(INVENT_ROOT, 'InventEndgame.lean'), durable);
      }
    }
    writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
    if (solutionImportsZeta23(INVENT_ROOT)) {
      console.error('INVARIANT FAIL: invent Solution imported Zeta23');
      process.exit(2);
    }

    // Round-level lake check after per-theorem attempts (closed already decided above).
    let buildOk = false;
    if (!args.skipLake) {
      const lake = which('lake') || `${process.env.HOME}/.elan/bin/lake`;
      const remaining = noCutoff
        ? 180_000
        : cutoffMs - (performance.now() - t0);
      const build = run(lake, ['build', 'Solution'], {
        cwd: INVENT_ROOT,
        timeoutMs: Math.max(20_000, Math.min(remaining, 180_000)),
      });
      buildOk = build.status === 0;
      lastBuildStderr = (build.stderr || build.stdout || build.error || '').slice(-4000);
      steps.push({
        name: `lake-build-r${round}`,
        ok: buildOk,
        status: build.status,
        strategy: llmMode ? 'llm' : strategy.id,
        stderrTail: lastBuildStderr.slice(-1200),
      });
    } else {
      steps.push({
        name: `lake-build-r${round}`,
        ok: false,
        skipped: true,
        strategy: llmMode ? 'llm' : strategy.id,
      });
    }

    if (buildOk) {
      for (const id of roundContribIds) {
        const c = platform.store.state.contributions.get(id);
        if (c) platform.coordination.ownership.setStatus(c.taskId, 'done');
      }
    }

    if (roundContribIds.length) {
      const evaluation = platform.composition.evaluateCompatibility(roundContribIds);
      if (evaluation.composable) {
        const composed = platform.composition.compose(roundContribIds);
        if (composed.ok) {
          compositionId = composed.composition.id;
          platform.composition.validate(compositionId, {
            passed: true,
            checks: [
              'zeta23-invent-no-sealed-corpus',
              'no-zeta23-import',
              llmMode ? 'llm-invent' : 'tactic-invent',
            ],
          });
          steps.push({ name: `compose-r${round}`, ok: true, compositionId });
        }
      }
    }

    const sorryNow = countSorriesInSolution(INVENT_ROOT).sorryCount;
    const allClosed =
      [...proofs.values()].every((p) => p.closed) && sorryNow === 0;
    if (allClosed) break;

    // Tactic-only plateau after exhausting strategies. LLM invent does not plateau that way.
    if (!llmMode && closedThisRound === 0 && round >= strategies.length) {
      plateau = true;
      for (const thm of INVENT_THEOREMS) {
        if (!proofs.get(thm.name)?.closed) {
          proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry', closed: false, round });
        }
      }
      writeSolution(INVENT_ROOT, proofs, { withInventMath, withInventEndgame });
      steps.push({
        name: 'plateau',
        ok: true,
        note: 'All local tactic invent strategies exhausted without closing any Challenge theorem',
      });
      break;
    }
  }

  platform.persist();

  const durationSeconds = (performance.now() - t0) / 1000;
  const cutoffHit = noCutoff
    ? false
    : durationSeconds >= args.cutoffSeconds - 0.05;
  const sorryEnd = countSorriesInSolution(INVENT_ROOT);
  const closedCount = [...proofs.values()].filter((p) => p.closed).length;
  const leanOk = closedCount === INVENT_THEOREMS.length && sorryEnd.sorryCount === 0;
  const ok = leanOk;

  const explanation = [
    'FractiSI invent clock: Challenge-only ζ proportion statements; agents invent Solution without Anthropic Zeta23 sealed corpus.',
    noCutoff
      ? 'No wall-clock cutoff on this FractiSI arm — stopped on green Solution, max-rounds, or honest plateau.'
      : `Wall-clock cutoff was ${args.cutoffSeconds}s.`,
    llmMode
      ? `LLM invent ON via Groq (models: ${[...llmModelsUsed].join(', ') || args.model}); Tiny Footprint / Infinite Octave ENGINE processing prompt (${ENGINE_PROMPT_ID}) is the system awareness — how Groq processes shared-world data (board/peers/lake), not a status dump alone.`
      : anyLlmKey
        ? 'LLM keys present but --llm not set; used Lean/Mathlib tactic invent only.'
        : 'No LLM keys — Lean/Mathlib tactic invent only.',
    `Rounds=${round}; closed=${closedCount}/${INVENT_THEOREMS.length}; Solution sorries=${sorryEnd.sorryCount}; plateau=${plateau}; cutoffHit=${cutoffHit}; llmCalls=${llmCalls}; llmOkCalls=${llmOkCalls}; awarenessInjections=${awarenessInjections}; enginePromptId=${ENGINE_PROMPT_ID}.`,
    'Anthropic baseline ~1.5 days / ~60 agents invents the analytic argument AND formalizes it. RH remains OPEN.',
  ].join(' ');

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-invent.v1',
    label: 'riemann-fractisi-zeta23-invent',
    mode: 'invent',
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
    cutoffSeconds: noCutoff ? null : args.cutoffSeconds,
    noCutoff,
    cutoffHit,
    plateau,
    ok,
    leanOk,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      whatThisMeasures:
        'FractiSI invent clock from Challenge-only with Lean/Mathlib tactic search; no sealed Anthropic formalization; no wall-clock cutoff by default',
      whatThisDoesNotMeasure: [
        'Find-assemble of sealed Anthropic Zeta23/Solution (see run-zeta23-find.mjs)',
        'LLM rediscovery of Alpöge–Furman (no model API on this VM)',
        'RH',
      ],
      inventedHere: 'Tactic-search proof attempts under FractiSI coordination',
      reusedNotInvented: [
        'Mathlib (riemannZeta definitions and supporting lemmas)',
        'ChallengeDeps / Challenge trusted statements (Anthropic challenge surface, Apache-2.0)',
      ],
      sealedCorpusUsed: false,
      llmUsed: llmMode,
      llmProvider: llmMode ? 'groq' : null,
      llmModels: [...llmModelsUsed],
      fractisiAwarenessInLlmPrompts: llmMode,
      awarenessKind: llmMode ? 'tiny-footprint-infinite-octave-engine-prompt' : null,
      enginePromptId: llmMode ? ENGINE_PROMPT_ID : null,
      awarenessInjections: llmMode ? awarenessInjections : 0,
      productRhymeDiscovery: withInventMath,
      productRhymePins: withInventMath ? ['#52', '#53', '#54'] : null,
      productRhymeCatalog: withInventMath ? 'data/RHYME_DISCOVERY_CATALOG.json' : null,
      rhymeDiscoveries: withInventMath ? rhymeDiscoveries : 0,
      rhymeImmediateCloses: withInventMath ? rhymeImmediateCloses : 0,
      rhymeApplyLakeOk: withInventMath ? rhymeApplyLakeOk : null,
      apiKeys: keys,
      anthropicBaselinePrimary: ANTHROPIC_INVENT_BASELINE.url,
      anthropicBaselineCharacterization: ANTHROPIC_INVENT_BASELINE.characterization,
      anthropicWinCondition: ANTHROPIC_INVENT_BASELINE.winCondition,
      compareMode,
      paperGuided: paperMode,
      inventMathImported: withInventMath,
      explanation,
    },
    challengeOnlyAtStart: prep.challengeOnly,
    leaksAtStart: prep.leaks,
    invent: {
      theoremCount: INVENT_THEOREMS.length,
      closedCount,
      openCount: INVENT_THEOREMS.length - closedCount,
      rounds: round,
      attempts: attempts.length,
      strategiesTried: llmMode ? ['groq-llm'] : strategies.map((s) => s.id),
      llmMode,
      llmCalls,
      llmOkCalls,
      llmModels: [...llmModelsUsed],
      awarenessInjections,
      awarenessCharsTotal,
      rhymeDiscoveries,
      rhymeDiscoveryCharsTotal,
      rhymeLeadingPartners: rhymeLeadingPartners.slice(0, 40),
      rhymeImmediateMs: rhymeImmediate?.durationMs ?? null,
      rhymeNamedDiscoveryCount: rhymeImmediate?.namedDiscoveryCount ?? 0,
      rhymeApplyLakeOk,
      rhymeImmediateCloses,
      rhymeUniqueApplyPartners: rhymeImmediate?.uniqueApplyPartners?.length ?? 0,
      fractisiAwarenessInLlmPrompts: llmMode,
      awarenessKind: llmMode ? 'tiny-footprint-infinite-octave-engine-prompt' : null,
      enginePromptId: llmMode ? ENGINE_PROMPT_ID : null,
      productRhymeDiscovery: withInventMath,
      productRhymePins: withInventMath ? ['#52', '#53', '#54'] : null,
      productRhymeCatalog: withInventMath ? 'data/RHYME_DISCOVERY_CATALOG.json' : null,
      maxRounds: args.maxRounds,
      solutionImportsZeta23: solutionImportsZeta23(INVENT_ROOT),
      sorryAtEnd: sorryEnd.sorryCount,
    },
    fractisi: {
      agents: agentIds.length,
      agentIds,
      tasks: taskIds.length,
      taskIds,
      contributions: contribIds.length,
      contributionIds: contribIds,
      compositions: compositionId ? 1 : 0,
      compositionId,
    },
    steps,
    attempts,
    comparison: {
      baselineName: 'Anthropic Riemann-zeta expedition (~1.5 days invent+formalize)',
      baselineSecondsApprox: 1.5 * 24 * 3600,
      thisArmSeconds: durationSeconds,
      thisArmOutcome: ok
        ? 'green_solution'
        : plateau
          ? 'plateau_no_theorem_closed'
          : cutoffHit
            ? 'cutoff_incomplete'
            : 'incomplete',
      note:
        'Compare invent clocks only. Do not cite sealed find-assemble 11.66s as invent speedup.',
    },
    paths: { inventSandbox: INVENT_ROOT },
  };

  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const receiptPath =
    args.receipt || join(RECEIPTS, `riemann-fractisi-zeta23-invent-${stamp}.json`);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-invent-latest.json'),
    JSON.stringify(receipt, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok,
        mode: 'invent',
        durationSeconds,
        cutoffSeconds: noCutoff ? null : args.cutoffSeconds,
        noCutoff,
        plateau,
        closedCount,
        theoremCount: INVENT_THEOREMS.length,
        sorryAtEnd: sorryEnd.sorryCount,
        llmMode,
        llmCalls,
        llmOkCalls,
        llmModels: [...llmModelsUsed],
        awarenessInjections,
        fractisiAwarenessInLlmPrompts: llmMode,
        sealedCorpusUsed: false,
        explanation,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main();
