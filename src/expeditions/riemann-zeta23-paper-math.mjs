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
    'Chebyshev–Mertens remaining lines (cheb1b–cheb2b; cheb1a landed in InventAnalytic)',
    'Montgomery–Vaughan Hilbert inequality',
    'Zero-side / prime-side main estimates (main_estimate_Hfun_N0star et al.) → glue → invent_<edge>',
    'Challenge Solution 17/17 via meet-in-middle exact partners',
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
  {
    id: 'H-def',
    leanName: 'Hfun_one',
    section: '§6 / [eq:Fdef]',
    agent: 'invent-asymp',
    difficulty: 'easy',
    paperNote: 'H(1) = 2/3.',
  },
  {
    id: 'F-def',
    leanName: 'Ffun_one',
    section: '§6 / [eq:Fdef]',
    agent: 'invent-asymp',
    difficulty: 'easy',
    paperNote: 'F(1) = 3/4.',
  },
  {
    id: 'E2',
    leanName: 'eps_form_of_isLittleO',
    section: '§6 E2',
    agent: 'invent-asymp',
    difficulty: 'tractable',
    paperNote: 'o(N) error ⇒ ε-form of the proportion bound.',
  },
  {
    id: 'E3-A',
    leanName: 'eps_form_twoThirds',
    section: '§6 E3',
    agent: 'invent-asymp',
    difficulty: 'tractable',
    paperNote: 'λ→1⁻ packages H(λ) ε-forms into the 2/3 Challenge shape.',
  },
  {
    id: 'E3-C',
    leanName: 'eps_form_threeQuarters',
    section: '§6 E3',
    agent: 'invent-asymp',
    difficulty: 'tractable',
    paperNote: 'λ→1⁻ packages F(λ) into the 3/4 distinct shape.',
  },
  {
    id: 'E3-B',
    leanName: 'eps_form_half',
    section: '§6 E3',
    agent: 'invent-asymp',
    difficulty: 'tractable',
    paperNote: 'λ→1⁻ packages 2F−1 into the 1/2 simple-on-line shape.',
  },
  {
    id: 'E4',
    leanName: 'dyadic_eps_form',
    section: '§6 E4',
    agent: 'invent-asymp',
    difficulty: 'tractable',
    paperNote: 'Dyadic windows ⇒ cumulative ε-form.',
  },
  {
    id: 'TD-A',
    leanName: 'challengeA_cumulative_of_dyadic',
    section: 'top-down Challenge A',
    agent: 'invent-topdown',
    difficulty: 'easy',
    paperNote: 'Top-down: Challenge A cumulative from dyadic via E4.',
  },
  {
    id: 'TD-B',
    leanName: 'challengeB_cumulative_of_dyadic',
    section: 'top-down Challenge B',
    agent: 'invent-topdown',
    difficulty: 'easy',
    paperNote: 'Top-down: Challenge B cumulative from dyadic via E4.',
  },
  {
    id: 'TD-C',
    leanName: 'challengeC_cumulative_of_dyadic',
    section: 'top-down Challenge C',
    agent: 'invent-topdown',
    difficulty: 'easy',
    paperNote: 'Top-down: Challenge C cumulative from dyadic via E4.',
  },
  {
    id: 'MID-A',
    leanName: 'challengeA_dyadic_of_Hfun',
    section: 'meet-in-middle A',
    agent: 'invent-middle',
    difficulty: 'easy',
    paperNote: 'Middle: Hfun family ⇒ dyadic 2/3 (feeds Challenge A).',
  },
  {
    id: 'MID-B',
    leanName: 'challengeB_dyadic_of_Ffun',
    section: 'meet-in-middle B',
    agent: 'invent-middle',
    difficulty: 'easy',
    paperNote: 'Middle: 2F−1 family ⇒ dyadic 1/2.',
  },
  {
    id: 'MID-C',
    leanName: 'challengeC_dyadic_of_Ffun',
    section: 'meet-in-middle C',
    agent: 'invent-middle',
    difficulty: 'easy',
    paperNote: 'Middle: F family ⇒ dyadic 3/4.',
  },
  {
    id: 'MID-eps',
    leanName: 'challenge_eps_of_littleO',
    section: 'meet-in-middle E2',
    agent: 'invent-middle',
    difficulty: 'easy',
    paperNote: 'Middle: o(N) main estimate ⇒ Challenge-shaped ε-form.',
  },
]);

/**
 * Endgame / analytic invent targets (InventAnalytic + InventEndgame).
 * Measured by invent arm lake-build, not invent-math 27/27 ladder alone.
 */
export const ENDGAME_ANALYTIC_LADDER = Object.freeze([
  {
    id: 'CHEB-1a',
    leanName: 'cheb1a_psi_bound',
    module: 'InventAnalytic',
    paperNote: 'Chebyshev ψ ≪ x from Mathlib.',
  },
  {
    id: 'ZS-explicit',
    leanName: 'N0star_lower_explicit',
    module: 'InventAnalytic',
    paperNote: 'Zero-side rank–trace → explicit N₀* lower bound (paper §6 arithmetic).',
  },
  {
    id: 'ZS-H',
    leanName: 'N0star_lower_H',
    module: 'InventAnalytic',
    paperNote: 'H(λ)·N − error packaging feeding little-o → MainEstimateHfunN0star.',
  },
  {
    id: 'SEAM-zeros',
    leanName: 'zerosIn_finite',
    module: 'InventEndgame',
    paperNote: 'Local finiteness of ChallengeDeps zerosIn.',
  },
  {
    id: 'SEAM-N',
    leanName: 'Ncount_add',
    module: 'InventEndgame',
    paperNote: 'Ncount additivity on split windows.',
  },
  {
    id: 'SEAM-N0',
    leanName: 'N0star_add',
    module: 'InventEndgame',
    paperNote: 'N0star additivity on split windows.',
  },
  {
    id: 'GLUE-A',
    leanName: 'glueA_dyadic_of_Hfun',
    module: 'InventEndgame',
    paperNote: 'Thm A dyadic under H(λ) family estimate.',
  },
  {
    id: 'MAIN-A',
    leanName: 'main_estimate_Hfun_N0star',
    module: 'InventEndgame',
    paperNote:
      'UNCONDITIONAL λ-family H-estimate — invent from Weil·RvM·traces. Unlocks invent_two_thirds_on_critical_line.',
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
