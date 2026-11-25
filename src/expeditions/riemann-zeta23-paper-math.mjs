/**
 * Paper-guided invent targets from Alpöge–Furman (arXiv:2608.13637).
 * Public math outline only — NEVER the sealed Anthropic Zeta23 Lean corpus.
 *
 * Strategy: invent the lemma ladder bottom-up (linear algebra → assembly →
 * window constants → Theorem A/C arithmetic chains). Measured by
 * run-zeta23-invent-math.mjs / run-zeta23-invent-compare.mjs.
 */
export const PAPER_META = Object.freeze({
  arxiv: '2608.13637',
  title:
    'More than two thirds of the zeros of the Riemann zeta function are simple and on the critical line',
  authors: 'Alpöge–Furman (argument by Claude; authors verify)',
  coreIdea:
    'Make Montgomery 1973 unconditional: replace RH termwise positivity by a rank–trace inequality on a finite compression of Weil’s Hermitian form; Sylvester inertia handles off-line pairs. Analytic inputs: Weil explicit formula, Riemann–von Mangoldt, Stirling Γ′/Γ, Chebyshev–Mertens, Montgomery–Vaughan.',
  remainingStack: Object.freeze([
    'Full Hermitian Lemma 3.2 (not only diagonal)',
    'Lemma 3.1 inertia under pull-back',
    'Weil explicit formula (ζ and Dirichlet L)',
    'Riemann–von Mangoldt zero counting',
    'Stirling Γ′/Γ on vertical lines',
    'Chebyshev–Mertens prime sums',
    'Montgomery–Vaughan Hilbert inequality',
    'Zero-side / prime-side / assembly → Challenge Solution 17/17',
  ]),
});

/**
 * Ordered invent ladder. Agents invent Lean for these before Challenge headlines.
 * `leanName` is the constant in InventMath.lean.
 */
export const PAPER_LEMMA_LADDER = Object.freeze([
  {
    id: 'L3.2b',
    leanName: 'rank_trace_scalar_cases',
    section: '§3 / Remark 3.3',
    agent: 'invent-la',
    difficulty: 'easy',
    paperNote: 'Scalar inequalities used in rank–trace equality cases.',
  },
  {
    id: 'L3.2-cell',
    leanName: 'rank_trace_cell',
    section: '§3 Linear algebra',
    agent: 'invent-la',
    difficulty: 'tractable',
    paperNote: 'Pointwise diagonal cell feeding the finite rank–trace form.',
  },
  {
    id: 'L3.2',
    leanName: 'rank_trace_inequality_real_diag',
    section: '§3 Linear algebra',
    agent: 'invent-la',
    difficulty: 'tractable',
    paperNote: 'Scalar / simultaneous-diagonal reduction of Lemma 3.2.',
  },
  {
    id: 'L3.2-diagM',
    leanName: 'rank_trace_diagonal_matrices',
    section: '§3 Linear algebra',
    agent: 'invent-la',
    difficulty: 'tractable',
    paperNote: 'Matrix.diagonal packaging of the real rank–trace form.',
  },
  {
    id: 'R-ind',
    leanName: 'window_constant_indicator',
    section: '§5 / Lemma 5.6',
    agent: 'invent-window',
    difficulty: 'easy',
    paperNote: 'R(ψ₀) = 4/3 for the indicator window.',
  },
  {
    id: 'R-two-thirds',
    leanName: 'two_minus_indicator_window',
    section: '§1 / §5',
    agent: 'invent-window',
    difficulty: 'easy',
    paperNote: '2 − R(ψ₀) = 2/3.',
  },
  {
    id: 'A-arith',
    leanName: 'thmA_assembly_two_thirds',
    section: '§1.2 / §6',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'R ≤ 4/3 ⇒ 2 − R ≥ 2/3.',
  },
  {
    id: 'A-chain',
    leanName: 'thmA_chain_two_thirds',
    section: '§6 Proof of Theorem A',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'Ns ≥ (2−R)N and R ≤ 4/3 ⇒ Ns ≥ (2/3)N.',
  },
  {
    id: 'A-ind',
    leanName: 'thmA_indicator_specialization',
    section: '§6',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'Indicator window specializes the A-chain to 2/3.',
  },
  {
    id: 'C-arith',
    leanName: 'thmC_assembly_five_sixths',
    section: '§1 / §6',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'R ≤ 4/3 ⇒ (3−R)/2 ≥ 5/6.',
  },
  {
    id: 'C-chain',
    leanName: 'thmC_chain_five_sixths',
    section: '§6',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'Nd ≥ ((3−R)/2)N and R ≤ 4/3 ⇒ Nd ≥ (5/6)N.',
  },
  {
    id: 'm-quad',
    leanName: 'multiplicity_quadratic_bound',
    section: '§1 / §3',
    agent: 'invent-la',
    difficulty: 'easy',
    paperNote: 'm² ≥ 2m − 1 (scalar seed of the matrix form).',
  },
  {
    id: 'm-flat',
    leanName: 'multiplicity_flat_charge_identity',
    section: '§1',
    agent: 'invent-la',
    difficulty: 'easy',
    paperNote: 'm² − (3m − 2) = (m−1)(m−2).',
  },
]);

export const PAPER_MATH_THEOREM_NAMES = Object.freeze(
  PAPER_LEMMA_LADDER.map((l) => l.leanName),
);

export function paperMathSystemAddendum() {
  return [
    '=== Paper-guided invent (arXiv:2608.13637) — actual math, not aesop ===',
    `Paper: ${PAPER_META.title}`,
    `Core idea: ${PAPER_META.coreIdea}`,
    '',
    'Invent REAL Lean 4 proofs of the assigned lemma from Mathlib.',
    'Prefer complete proofs of linear-algebra / arithmetic lemmas first.',
    'Do NOT import Zeta23. Do NOT use sorry. Do NOT dump English.',
    'Output ONLY the tactic body after := by for the assigned lemma.',
    'If the full Hermitian Lemma 3.2 is too large, invent the scalar/diagonal form cleanly.',
    '',
    'Still ahead for Anthropic-comparable close:',
    ...PAPER_META.remainingStack.map((s) => `- ${s}`),
  ].join('\n');
}

/** Anthropic invent baseline pins for comparison receipts. */
export const ANTHROPIC_INVENT_BASELINE = Object.freeze({
  url: 'https://www.anthropic.com/research/riemann-zeta',
  characterization: '~60 subagents · ~1.5 days · invent+formalize critical-line bound 41.6% → 67.2%',
  winCondition:
    'Challenge-only start → Comparator-green Solution for all 17 theorems, axioms trio only, no sealed Zeta23 import',
});
