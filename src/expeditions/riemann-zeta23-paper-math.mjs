/**
 * Paper-guided invent targets from Alpöge–Furman (arXiv:2608.13637).
 * Public math outline only — NEVER the sealed Anthropic Zeta23 Lean corpus.
 *
 * Strategy: invent the lemma ladder bottom-up (linear algebra → assembly arithmetic).
 * Measured arm: run-zeta23-invent-math.mjs → InventMath.lean (Challenge-only).
 */
export const PAPER_META = Object.freeze({
  arxiv: '2608.13637',
  title:
    'More than two thirds of the zeros of the Riemann zeta function are simple and on the critical line',
  authors: 'Alpöge–Furman (argument by Claude; authors verify)',
  coreIdea:
    'Make Montgomery 1973 unconditional: replace RH termwise positivity by a rank–trace inequality on a finite compression of Weil’s Hermitian form; Sylvester inertia handles off-line pairs. Analytic inputs: Weil explicit formula, Riemann–von Mangoldt, Stirling Γ′/Γ, Chebyshev–Mertens, Montgomery–Vaughan.',
});

/**
 * Ordered invent ladder. Agents invent Lean for these before Challenge headlines.
 * `leanName` is the constant in InventMath.lean.
 */
export const PAPER_LEMMA_LADDER = Object.freeze([
  {
    id: 'L3.2b',
    leanName: 'rank_trace_scalar_cases',
    section: '§3 Linear algebra / Remark 3.3',
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
    paperNote:
      'Scalar / simultaneous-diagonal reduction of Lemma 3.2 (rank–trace). Full Hermitian form is later.',
  },
  {
    id: 'A-arith',
    leanName: 'thmA_assembly_two_thirds',
    section: '§1.2 / §6 assembly',
    agent: 'invent-assembly',
    difficulty: 'easy',
    paperNote: 'R ≤ 4/3 ⇒ 2 − R ≥ 2/3 — constant that feeds Theorem A.',
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
  ].join('\n');
}
