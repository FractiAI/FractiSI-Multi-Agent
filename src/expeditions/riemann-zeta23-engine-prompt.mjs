/**
 * Tiny Footprint / Infinite Octave engine processing prompt for ζ-23 LLM invent.
 *
 * Player 1: "awareness" is the engine instruction that tells the LLM *how* to
 * process shared-world information — not a status dump.
 *
 * Layer-safe: imports only engine + platform (below expeditions). Copy mirrors
 * locked Net Zero / rhyme definitions without importing testdrive.
 */
import { FOUR_PILLARS, NET_ZERO_OCTAVE, PHI_EGS } from '../engine/rhyming/gate.mjs';
import { CORE_TECHNOLOGY, ENGINE, PRODUCT, PRODUCT_VERSION, productBanner } from '../platform/identity.mjs';

export const ENGINE_PROMPT_ID = 'fractisi.tiny-footprint.infinite-octave.invent.v1';

/** Locked Net Zero punch (mirrors src/testdrive/net-zero-definition.mjs). */
const NET_ZERO_PUNCH = 'Balanced zero, not nothing zero.';
const NET_ZERO_LEDE =
  'Net Zero (octave 0) is balanced zero — active equilibrium at the root of the shared world — not nothing zero (empty void, blank null, or a dead stop).';

/** Locked four-pillar bodies (mirrors src/testdrive/rhyme-definition.mjs). */
const PILLAR_BODY = Object.freeze({
  repeating:
    'The same organization appears across multiple expressions (shared shape — not necessarily identical words).',
  self_similar:
    'A local blueprint mirrors the whole — the part carries the organizational pattern of the global.',
  self_correcting:
    'Drift dampens toward Net Zero — pull toward active equilibrium, not unchecked phase wander.',
  recursive:
    'Nests from Net Zero up an ascending Infinite Octaves ladder — not a closed dead loop, not a mid-octave leaf with no root.',
});

const NOT_A_RHYME = Object.freeze([
  'Exact-text identity or prefix-cache reuse alone',
  'Schema-key match alone',
  'Brick-wall repetition (repeats without self-similarity, recursion, and self-correction)',
  'A mid-octave nest with no Net Zero root',
]);

/**
 * System prompt: how Groq must process invent information.
 * This is the awareness / engine frame — not the invent board itself.
 */
export function buildTinyFootprintOctaveEnginePrompt() {
  const pillars = FOUR_PILLARS.map((id) => {
    const name = id
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
    return `- ${name}: ${PILLAR_BODY[id] || id}`;
  }).join('\n');
  const notRhyme = NOT_A_RHYME.map((x) => `- ${x}`).join('\n');

  return [
    `=== ${ENGINE} · ${CORE_TECHNOLOGY} / Infinite Octave engine (processing instructions) ===`,
    productBanner(),
    `promptId=${ENGINE_PROMPT_ID} · product=${PRODUCT} ${PRODUCT_VERSION}`,
    `Φ_EGS≈${PHI_EGS.toFixed(6)} · Net Zero octave=${NET_ZERO_OCTAVE}`,
    '',
    'You do NOT invent in a private full-world copy. You process through this engine:',
    '',
    `1. ${CORE_TECHNOLOGY} (shared-world execution)`,
    '   - One shared Solution.lean world for all invent agents.',
    '   - Keep the organizational pattern once; invent/communicate only the smallest meaningful deltas (tactic bodies that change).',
    '   - Do not reprint N private full copies of Mathlib/Challenge state in your reasoning output.',
    '   - Reconstruct selectively: focus on the claimed theorem while staying coherent with the shared board.',
    '',
    '2. Infinite Octaves (nested scale)',
    `   - Root at Net Zero (octave ${NET_ZERO_OCTAVE}): ${NET_ZERO_PUNCH}`,
    `   - ${NET_ZERO_LEDE}`,
    '   - Ascend octaves of resolution: local tactic detail ↔ theorem statement ↔ Challenge proportion family ↔ shared Solution composition.',
    '   - Prefer proofs that nest cleanly (local step serves the whole board) over orphan mid-octave guesses.',
    '',
    `3. ${ENGINE} · Rhyming Templates (how organization reuses)`,
    '   - A holographic rhyme is motion / organization grammar under Infinite Octaves — not “sounds alike,” not exact-text match, and not a prefix-cache hit.',
    '   - A candidate is a rhyme only when all four pillars pass, rooted at Net Zero and nested through ascending octaves.',
    '   - Four pillars:',
    pillars,
    '   - Not a rhyme:',
    notRhyme,
    '   - When peer drafts share organization (same shape, different words), reuse that pattern as a template+delta — do not brick-wall copy sealed Anthropic Zeta23.',
    '',
    '4. Output contract (still Lean invent)',
    '   - Output ONLY executable Lean 4 tactic lines for the body after := by.',
    '   - First token must be a Lean tactic (intro, aesop, simp, exact, refine, have, …).',
    '   - No English prose, no markdown, no theorem header, no sorry, no import Zeta23.',
    '   - Prefer short, composable deltas that can integrate with peer contributions.',
    '',
    'Process shared-world context (board / peers / lake feedback) THROUGH this engine before inventing the focus theorem.',
  ].join('\n');
}
