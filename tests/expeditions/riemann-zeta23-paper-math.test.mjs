/**
 * Mirrors `src/expeditions/riemann-zeta23-paper-math.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PAPER_LEMMA_LADDER,
  PAPER_MATH_THEOREM_NAMES,
  PAPER_META,
  paperMathSystemAddendum,
} from '../../src/expeditions/riemann-zeta23-paper-math.mjs';

describe('riemann zeta23 paper-math ladder', () => {
  it('pins public arXiv outline only (no sealed corpus language as a source)', () => {
    assert.equal(PAPER_META.arxiv, '2608.13637');
    assert.ok(PAPER_LEMMA_LADDER.length >= 3);
    assert.ok(PAPER_MATH_THEOREM_NAMES.includes('rank_trace_inequality_real_diag'));
    assert.ok(PAPER_MATH_THEOREM_NAMES.includes('thmA_assembly_two_thirds'));
    const add = paperMathSystemAddendum();
    assert.match(add, /Do NOT import Zeta23/);
    assert.match(add, /arXiv:2608\.13637/);
  });
});
