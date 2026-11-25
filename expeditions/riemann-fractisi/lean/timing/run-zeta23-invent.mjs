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

function writeInventLakefile(root, { withInventMath = false } = {}) {
  // Drop Zeta23 target — invent must not depend on Anthropic proof library.
  const inventMathLib = withInventMath
    ? `
[[lean_lib]]
name = "InventMath"
roots = ["InventMath"]
`
    : '';
  const body = `name = "Zeta23Invent"
version = "0.1.0"
defaultTargets = ["ChallengeDeps", "Challenge", "Solution"]

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
${inventMathLib}
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

function writeSolution(root, proofs, { withInventMath = false } = {}) {
  const header = `/-
FractiSI invent Solution — NO import of Anthropic Zeta23 library.
Proofs below are invented by FractiSI Lean/Mathlib tactic search on this VM.
-/
import ChallengeDeps
${withInventMath ? 'import InventMath\n' : ''}
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
  if (withInventMath) {
    if (!existsSync(inventMathSrc)) {
      throw new Error(`missing InventMath at ${inventMathSrc}`);
    }
    cpSync(inventMathSrc, join(INVENT_ROOT, 'InventMath.lean'));
  }
  writeInventLakefile(INVENT_ROOT, { withInventMath });
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
  const proofs = new Map();
  for (const thm of INVENT_THEOREMS) proofs.set(thm.name, { tacticId: 'sorry_hold', body: 'sorry' });
  writeSolution(INVENT_ROOT, proofs, { withInventMath });
  return {
    challengeOnly: anthropicProofsAbsent,
    inventSolutionShellWritten: true,
    withInventMath,
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
  let rhymeDiscoveries = 0;
  let rhymeDiscoveryCharsTotal = 0;
  const rhymeLeadingPartners = [];
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
            proofs.set(thm.name, {
              tacticId: `llm:${invented.model}`,
              body: invented.body,
              closed: false,
              round,
              llm: true,
              awareness: true,
              ...rhymeMeta,
            });
            attempts.push({
              atSeconds: (performance.now() - t0) / 1000,
              agent: agentName,
              theorem: thm.name,
              strategy: `llm:${invented.model}`,
              round,
              llm: true,
              awareness: true,
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
          proofs.set(thm.name, {
            tacticId: strategy.id,
            body: strategy.body,
            closed: false,
            round,
          });
          attempts.push({
            atSeconds: (performance.now() - t0) / 1000,
            agent: agentName,
            theorem: thm.name,
            strategy: strategy.id,
            round,
            llm: false,
          });
        }

        // Per-theorem lake gate (accumulate closes toward 17/17).
        writeSolution(INVENT_ROOT, proofs, { withInventMath });
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
            writeSolution(INVENT_ROOT, proofs, { withInventMath });
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

    writeSolution(INVENT_ROOT, proofs, { withInventMath });
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
      writeSolution(INVENT_ROOT, proofs, { withInventMath });
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
      productRhymeDiscovery: llmMode,
      productRhymePins: llmMode ? ['#52', '#53', '#54'] : null,
      productRhymeCatalog: llmMode ? 'data/RHYME_DISCOVERY_CATALOG.json' : null,
      rhymeDiscoveries: llmMode ? rhymeDiscoveries : 0,
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
      fractisiAwarenessInLlmPrompts: llmMode,
      awarenessKind: llmMode ? 'tiny-footprint-infinite-octave-engine-prompt' : null,
      enginePromptId: llmMode ? ENGINE_PROMPT_ID : null,
      productRhymeDiscovery: llmMode,
      productRhymePins: llmMode ? ['#52', '#53', '#54'] : null,
      productRhymeCatalog: llmMode ? 'data/RHYME_DISCOVERY_CATALOG.json' : null,
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
