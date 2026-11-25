#!/usr/bin/env node
/**
 * FractiSI · Anthropic-comparable invent campaign entrypoint
 *
 * 1) Measure paper-math InventMath ladder (Challenge-only).
 * 2) Long-horizon Challenge headline invent with --compare (paper guidance +
 *    InventMath import + Groq LLM). No sealed Zeta23.
 *
 * Win condition (not claimed until met): Comparator-green Solution 17/17,
 * axioms trio only, no Zeta23 import — vs Anthropic ~1.5d / ~60 agents.
 *
 * Usage:
 *   GROQ_API_KEY=… node timing/run-zeta23-invent-compare.mjs
 *   GROQ_API_KEY=… node timing/run-zeta23-invent-compare.mjs --max-rounds 25
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ANTHROPIC_INVENT_BASELINE,
  PAPER_META,
  PAPER_MATH_THEOREM_NAMES,
} from '../../../../src/expeditions/riemann-zeta23-paper-math.mjs';
import { groqKeyPresent } from '../../../../src/expeditions/riemann-zeta23-llm.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECEIPTS = join(resolve(__dirname, '..'), 'receipts');

function parseArgs(argv) {
  const out = { maxRounds: 20, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--max-rounds') out.maxRounds = Number(argv[++i]);
    else if (a === '--help' || a === '-h') out.help = true;
  }
  if (!Number.isFinite(out.maxRounds) || out.maxRounds <= 0) out.maxRounds = 20;
  return out;
}

function runNode(script, args) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: resolve(__dirname),
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    error: r.error ? String(r.error.message || r.error) : null,
  };
}

/** Child scripts print one JSON object (pretty-printed). Parse the whole stdout. */
function parseJsonStdout(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return { ok: false, parseError: true, error: 'empty_stdout' };
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    return { ok: false, parseError: true, stdoutTail: text.slice(-800) };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      'Usage: GROQ_API_KEY=… node timing/run-zeta23-invent-compare.mjs [--max-rounds 20]',
    );
    process.exit(0);
  }
  if (!groqKeyPresent()) {
    console.error('GROQ_API_KEY required for invent-compare');
    process.exit(1);
  }

  const startedAt = new Date();
  const t0 = performance.now();

  const math = runNode(join(__dirname, 'run-zeta23-invent-math.mjs'), []);
  const mathSummary = parseJsonStdout(math.stdout);

  const inventArgs = [
    '--compare',
    '--llm',
    '--no-cutoff',
    '--max-rounds',
    String(args.maxRounds),
    '--model',
    'openai/gpt-oss-20b',
  ];
  const invent = runNode(join(__dirname, 'run-zeta23-invent.mjs'), inventArgs);
  const inventSummary = parseJsonStdout(invent.stdout);

  const durationSeconds = (performance.now() - t0) / 1000;
  const headlinesClosed = inventSummary?.closedCount ?? 0;
  const headlinesTotal = inventSummary?.theoremCount ?? 17;
  const ladderClosed = mathSummary?.closedCount ?? 0;
  const ladderTotal = mathSummary?.theoremCount ?? PAPER_MATH_THEOREM_NAMES.length;
  const win =
    inventSummary?.ok === true &&
    headlinesClosed === headlinesTotal &&
    mathSummary?.ok === true;

  const receipt = {
    schema: 'fractisi.riemann-expedition.zeta23-invent-compare.v1',
    label: 'riemann-fractisi-zeta23-invent-compare',
    mode: 'invent_compare',
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
    ok: win,
    honesty: {
      rhClaimStatus: 'OPEN — Riemann hypothesis is not proved in this repository',
      sealedCorpusUsed: false,
      anthropicBaseline: ANTHROPIC_INVENT_BASELINE,
      paperArxiv: PAPER_META.arxiv,
      remainingStack: PAPER_META.remainingStack,
      whatThisMeasures:
        'Anthropic-comparable invent campaign: paper-math ladder + long Challenge invent with paper guidance; Challenge-only; no sealed Zeta23',
      whatThisDoesNotMeasure: [
        'Find-assemble of sealed Anthropic Zeta23',
        'RH',
        win ? null : 'Successful Anthropic-comparable close (17/17 Comparator-green) — not yet met',
      ].filter(Boolean),
      explanation: [
        `Paper-math ladder ${ladderClosed}/${ladderTotal} (ok=${mathSummary?.ok}).`,
        `Challenge headlines ${headlinesClosed}/${headlinesTotal} (ok=${inventSummary?.ok}).`,
        win
          ? 'Win condition met: Challenge Solution green without sealed corpus.'
          : 'Win condition NOT met — continue inventing remaining analytic stack.',
        `Anthropic baseline: ${ANTHROPIC_INVENT_BASELINE.characterization}.`,
      ].join(' '),
    },
    paperMath: mathSummary,
    headlineInvent: inventSummary,
    maxRounds: args.maxRounds,
  };

  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const receiptPath = join(RECEIPTS, `riemann-fractisi-zeta23-invent-compare-${stamp}.json`);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  writeFileSync(
    join(RECEIPTS, 'riemann-fractisi-zeta23-invent-compare-latest.json'),
    JSON.stringify(receipt, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        receiptPath,
        ok: win,
        mode: 'invent_compare',
        durationSeconds,
        paperMathClosed: `${ladderClosed}/${ladderTotal}`,
        headlinesClosed: `${headlinesClosed}/${headlinesTotal}`,
        sealedCorpusUsed: false,
        anthropicComparableWin: win,
        explanation: receipt.honesty.explanation,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main();
