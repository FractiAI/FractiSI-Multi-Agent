/**
 * Locked FractiSI / SynthOBS definition of rhyme for Test Drive surfaces.
 *
 * Canonical sources (do not invent alternatives):
 * - src/testdrive/net-zero-definition.mjs (define Net Zero BEFORE this gate)
 * - src/engine/rhyming/gate.mjs (FOUR_PILLARS · auditRhyme · Net Zero root)
 * - library/papers/holographic-rhyme/ (four-pillar catalog grammar)
 * - research/.../SYNTHOBS_TINY_GATEWAY_RHYMING_TEMPLATES_EGS_2026-11.md
 *   (Rhyming Templates under the holographic four-pillar gate;
 *    schema match / prefix reuse alone is not a rhyme)
 *
 * Separate word use: symposium “possible rhyme with Active Inference” =
 * structural kinship for joint experiments — not the four-pillar software gate,
 * and not framework identity.
 */

import { NET_ZERO_DEFINITION } from './net-zero-definition.mjs';

const NZ = NET_ZERO_DEFINITION.shortName;
const NZ_FULL = NET_ZERO_DEFINITION.name;

export const RHYME_FOUR_PILLARS = Object.freeze([
  {
    id: 'repeating',
    name: 'Repeating',
    body: 'The same organization appears across multiple expressions (shared shape — not necessarily identical words).',
  },
  {
    id: 'self_similar',
    name: 'Self-similar',
    body: 'A local blueprint mirrors the whole — the part carries the organizational pattern of the global.',
  },
  {
    id: 'self_correcting',
    name: 'Self-correcting',
    body: `Drift dampens toward ${NZ_FULL} — pull toward active equilibrium, not unchecked phase wander.`,
  },
  {
    id: 'recursive',
    name: 'Recursive',
    body: `Nests from ${NZ_FULL} up an ascending Infinite Octaves ladder — not a closed dead loop, not a mid-octave leaf with no root.`,
  },
]);

export const RHYME_DEFINITION = Object.freeze({
  title: 'What we mean by rhyme',
  lede:
    'A holographic rhyme is motion / organization grammar under Infinite Octaves — not a synonym for “sounds alike,” not exact-text match, and not a prefix-cache hit.',
  gate: `A candidate is a rhyme only when all four pillars pass, rooted at ${NZ_FULL} (active-equilibrium home base — see Net Zero definition) and nested through ascending octaves.`,
  pillars: RHYME_FOUR_PILLARS,
  notARhyme: Object.freeze([
    'Exact-text identity or prefix-cache reuse alone',
    'Schema-key match alone',
    'Brick-wall repetition (repeats without self-similarity, recursion, and self-correction)',
    `A mid-octave nest with no ${NZ} root`,
  ]),
  product:
    'Rhyming Templates (Tiny Gateway) are reusable organizational patterns that pass this gate — so differently worded sessions can share structure and reconstruct selectively.',
  symposiumKinship:
    'Symposium wording “possible rhyme with Active Inference” means structural kinship for joint experiments (shared world, many agents including humans). It is not a claim that Active Inference passes this software gate, and not framework identity.',
  papers: Object.freeze([
    '/library/papers/holographic-rhyme/',
    '/library/papers/tiny-gateway-rhyming-templates/',
  ]),
  honesty:
    'Catalog / architectural gate (ENGINE_SHELF #52 companions). Not Mandelbrot retirement, not physics QED, not “rhyme beats every prefix cache on live heap.”',
});

/** Plain lines for CLI / API primer and lab 3. */
export function rhymeDefinitionLines() {
  const d = RHYME_DEFINITION;
  const lines = [
    d.title.toUpperCase(),
    '',
    `  ${d.lede}`,
    `  ${d.gate}`,
    '',
    '  Four pillars (all required):',
  ];
  for (const p of d.pillars) {
    lines.push(`    · ${p.name} — ${p.body}`);
  }
  lines.push('', '  Not a rhyme:');
  for (const n of d.notARhyme) {
    lines.push(`    · ${n}`);
  }
  lines.push('', `  Product: ${d.product}`, '', `  ${d.honesty}`);
  return lines;
}
