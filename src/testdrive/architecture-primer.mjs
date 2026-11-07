/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API / self-paced) and the product page.
 *
 * Spine (catalog / engineering grammar — see honesty):
 *   Infinite Possibilities Lattice → Net Zero → Φ_EGS → Infinite Octaves
 *   → Boundary nodes → Recursive trees → Polygons-in-circle (hex / eight-node)
 *   → Wave–Node–Fq / nested & interference vectors → Awareness
 *   → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers A–F
 *   → FractiSI Multi-Agent (possible Active Inference rhyme)
 */

export const ARCHITECTURE_PRIMER = Object.freeze({
  title: 'Architecture primer · FractiSI Multi-Agent',
  kicker: 'From Infinite Possibilities Lattice to product layers',
  lede:
    'FractiSI Multi-Agent sits on an Infinite Octaves architecture. The stack below is the synthesis — catalog grammar that productizes as Tiny Gateway™, Tiny Footprint (Layer A), and platform Layers B–F. Offered also as a possible rhyme with Active Inference: humans are agents too, in a shared world.',
  steps: Object.freeze([
    {
      id: 'ipl',
      name: 'Infinite Possibilities Lattice',
      body:
        'The generative field of possibility — processes and patterns that can be filed, nested, and reused. Not infinite compute; the open lattice of organizational possibility from which engines and products crystallize.',
    },
    {
      id: 'net-zero',
      name: 'Net Zero (octave 0)',
      body:
        'Active equilibrium origin — not an empty void. Holographic rhymes and shared worlds root here. Without a Net Zero root, the recursive pillar of a holographic rhyme fails the gate.',
    },
    {
      id: 'phi',
      name: 'Golden-ratio scaling · Φ_EGS',
      body:
        'Φ_EGS ≈ 1.618 — nesting / scale-bridge design grammar (El Gran Sol’s Fractal constant as catalog key). Used to map depth across octaves. Not a substitute for ℏ, c, or G; not a physical memory constant by itself.',
    },
    {
      id: 'octaves',
      name: 'Infinite Octaves',
      body:
        'Recursive / holographic nesting depth — ascending octave ladder from Net Zero. Digits × Octaves 01–99 remain the practical filing map. “Infinite” names nesting depth in experience, not infinite measured physics tiers.',
    },
    {
      id: 'boundary',
      name: 'Boundary nodes',
      body:
        'Domain, task, and entry declarations with constraints — where a shared world meets a participant. Boundary nodes bound what may enter the lattice before trees and templates bind data.',
    },
    {
      id: 'trees',
      name: 'Recursive trees',
      body:
        'Nested hierarchical context under Φ scale — holographic rhyme trees that repeat, self-similarize, self-correct, and recurse across octaves. Selective reconstruction walks these trees instead of flat-skimming noise.',
    },
    {
      id: 'polygons',
      name: 'Polygons within a circle (incl. hex)',
      body:
        'Circle hosts regular polygons as phase / broadcast geometry — honeycomb (axial hex pathways), 3D Hexagon / eight-node shared originating broadcast, polygon-spin clocks. Formal hexagon–circle Soft Story geometry remains an open novelty; honeycomb and eight-node labs are exercised in-suite.',
    },
    {
      id: 'wave',
      name: 'Wave · interference · nested vectors',
      body:
        'Wave–Node–Fq activation selects and phases templates; nested vectors carry cross-scale relationships beyond flat trees; interference vectors mark overlap (coordination layer) so agents do not silently collide. Wave–Node mathematics companions sit on the engine shelf as catalog labs.',
    },
    {
      id: 'awareness',
      name: 'Awareness',
      body:
        'What each agent — human or software — keeps as its grip on the shared world: observations, beliefs, actions, ownership. Attention → awareness → downstream activation is catalog grammar (MFA ≠ phenomenal consciousness). Git awareness is the Layer E product surface for repo grip.',
    },
    {
      id: 'synthesis',
      name: 'Synthesis → product',
      body:
        'Rhyming Templates organize reuse under the four-pillar holographic rhyme gate (Net Zero → octaves). Tiny Gateway™ is the engine (templates · nested vectors · selective reconstruction). Tiny Footprint productizes Layer A memory/execution. Layers B–F add Coordination · Shared state · Composition · Git · Deploy (paid). FractiSI Multi-Agent is the commercial surface — beside Cursor / Claude Code / VS Code / Git.',
    },
  ]),
  activeInference:
    'Possible Active Inference rhyme: many agents — including humans — operate in one shared world with different observations, beliefs, and actions, without each reprinting a private full copy. “Rhyme” = structural kinship for joint experiments — not framework identity.',
  chain:
    'Infinite Possibilities Lattice → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Recursive trees → Polygons-in-circle (hex / eight-node) → Wave–Node–Fq / nested & interference vectors → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers A–F → FractiSI Multi-Agent',
  honesty:
    'Catalog / architectural grammar and in-process labs — not CapEx guarantees, not a Theory of Everything, not interchangeable with Active Inference formalisms, not infinite physical octave tiers, not Φ as ℏ/c/G. Hexagon–circle Soft Story geometry partly open. Engine pin and product layers remain the operational claims.',
});

/** Plain-text lines for CLI / API results panels. */
export function architecturePrimerLines() {
  const p = ARCHITECTURE_PRIMER;
  const lines = [
    p.title.toUpperCase(),
    '',
    `  ${p.lede}`,
    '',
    `  Chain: ${p.chain}`,
    '',
  ];
  for (const s of p.steps) {
    lines.push(`  ${s.name}`);
    lines.push(`    ${s.body}`);
    lines.push('');
  }
  lines.push('  Active Inference Symposium');
  lines.push(`    ${p.activeInference}`);
  lines.push('');
  lines.push('  Self-paced labs next name each product component as they run.');
  lines.push('  No FractiSI account. No cloud token for the walkthrough.');
  return lines;
}

export function architecturePrimerFractisiBullets() {
  return ARCHITECTURE_PRIMER.steps.map((s) => `${s.name} — ${s.body.split('—')[0].trim().replace(/\.$/, '')}`);
}
