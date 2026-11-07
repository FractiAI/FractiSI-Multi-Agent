/**
 * Locked FractiSI / SynthOBS definition of Net Zero (octave 0).
 *
 * Plain lock: balanced zero, not nothing zero.
 *
 * Canonical sources (do not invent alternatives):
 * - SYNTHOBS_HOLOGRAPHIC_SINGULARITY_CRYSTAL_NET_ZERO (0 = active equilibrium;
 *   not inert void; 0/0 as bounded catalog singularity crystal)
 * - SYNTHOBS_GOLDILOCKS_NET_ZERO_EQUIVALENCE (Goldilocks ≡ Net Zero =
 *   viable band = active equilibrium / cancel-to-balance; stillness not required)
 * - SYNTHOBS_TOPOLOGY_OF_THE_VOID (zero as dynamic equilibrium / phase-balance node)
 * - src/engine/rhyming/gate.mjs (Net Zero / octave 0 root required for recursive pillar)
 *
 * Define this BEFORE using “Net Zero” inside the rhyme gate copy.
 */

export const NET_ZERO_DEFINITION = Object.freeze({
  title: 'What we mean by Net Zero',
  name: 'Net Zero (octave 0)',
  shortName: 'Net Zero',
  punch: 'Balanced zero, not nothing zero.',
  lede:
    'Net Zero (octave 0) is balanced zero — active equilibrium at the root of the shared world — not nothing zero (empty void, blank null, or a dead stop).',
  body:
    'Opposing contributions cancel into a viable operating band while work continues. Cancel-to-balance under continuous activity. In this catalog, Goldilocks (the “just right” band) files as the same region: viable band ≡ active equilibrium. Stillness is not required.',
  productRole:
    'Octave 0 is home base for the shared world. Rhymes and nested structure hang from this balanced root; a mid-octave nest with no Net Zero root fails the holographic rhyme gate.',
  notNetZero: Object.freeze([
    'Nothing zero — empty void / inert arithmetic placeholder / blank null',
    'Dead stillness / freeze everything to “zero”',
    'Climate-policy “net zero” emissions slogans',
    'Certified zero-watt Super Intelligence or SI zero-energy claims',
    'GR singularity resolution or vacuum QFT proofs',
  ]),
  peers: Object.freeze([
    'Goldilocks ≡ Net Zero (viable band as active equilibrium)',
    'Topology of the Void (zero as dynamic phase-balance node)',
    'Holographic Singularity Crystal (Net Zero as active equilibrium; 0/0 as bounded catalog crystal)',
  ]),
  honesty:
    'Catalog / architectural filing. Balanced zero ≠ nothing zero. Not climate policy, not CODATA nulls, not certified zero-energy compute, not GR singularity retirement.',
});

/** Plain lines for CLI / API primer — print before the rhyme definition. */
export function netZeroDefinitionLines() {
  const d = NET_ZERO_DEFINITION;
  const lines = [
    d.title.toUpperCase(),
    '',
    `  ${d.punch}`,
    `  ${d.lede}`,
    `  ${d.body}`,
    `  ${d.productRole}`,
    '',
    '  Not Net Zero here:',
  ];
  for (const n of d.notNetZero) {
    lines.push(`    · ${n}`);
  }
  lines.push('', `  ${d.honesty}`);
  return lines;
}
