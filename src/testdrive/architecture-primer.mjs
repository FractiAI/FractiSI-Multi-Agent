/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API / self-paced) and the product page.
 *
 * Locked productization ladder (TECH_PAPER / Tiny Gateway):
 *   Generative possibility → processes → Infinite Octaves →
 *   3D Hexagon / eight-node broadcast → Rhyming Templates → nested vectors →
 *   Tiny Gateway → Tiny Footprint → FractiSI Multi-Agent Layers A–F
 *
 * Deeper grammar (language-radar / engine shelf) nested in the primer:
 *   Net Zero · Φ_EGS · Boundary nodes · Recursive trees · Honeycomb hex ·
 *   Wave–Node–Fq · Awareness (human grip Soft Story; MFA ≠ consciousness)
 */

export const ARCHITECTURE_PRIMER = Object.freeze({
  title: 'Architecture primer · FractiSI Multi-Agent',
  kicker: 'From generative possibility to product layers',
  lede:
    'FractiSI Multi-Agent sits on the Infinite Octaves architecture. The stack below is the synthesis — catalog grammar that productizes as Tiny Gateway™, Tiny Footprint (Layer A), and platform Layers B–F. Offered also as a possible rhyme with Active Inference: humans are agents too, in a shared world.',
  steps: Object.freeze([
    {
      id: 'generative',
      name: 'Generative possibility',
      body:
        'Locked stack start (Tiny Gateway TECH_PAPER): the generative field of processes and patterns that can be filed, nested, and reused — Soft Story talk for an open lattice of organizational possibility. Not infinite compute; not a second product brand.',
    },
    {
      id: 'net-zero',
      name: 'Net Zero (octave 0)',
      body:
        'Active equilibrium origin — not an inert void. Holographic rhymes and shared worlds root here. Without a Net Zero root, the recursive pillar of a holographic rhyme fails the gate.',
    },
    {
      id: 'phi',
      name: 'Golden-ratio scaling · Φ_EGS',
      body:
        'Φ_EGS ≈ 1.618 — nesting / Golden Spiral scale-bridge design grammar (El Gran Sol’s Fractal constant as catalog key). Not a substitute for ℏ, c, or G; not a physical memory constant; not an awareness ontology.',
    },
    {
      id: 'octaves',
      name: 'Infinite Octaves',
      body:
        'Engine brand + recursive / holographic nesting depth — ascending octave ladder from Net Zero. Digits × Octaves 01–99 = practical Story-depth filing map. Guest catalog: Infinite Octave Omniversal Lattice Catalog. “Infinite” names nesting depth, not infinite measured physics tiers.',
    },
    {
      id: 'boundary',
      name: 'Boundary nodes',
      body:
        'Domain, task, and entry declarations with constraints — where a shared world meets a participant (Tiny Gateway language-radar: Boundary Node → Recursive Tree → …). Bounds what may enter before trees and templates bind data.',
    },
    {
      id: 'trees',
      name: 'Recursive trees · holographic rhyme',
      body:
        'Nested hierarchical context under Φ — holographic rhyme trees with four pillars: repeating · self-similar · self-correcting · recursive, rooted at Net Zero through ascending octaves. Schema match or prefix reuse alone is not a rhyme. Selective reconstruction walks these trees.',
    },
    {
      id: 'polygons',
      name: '3D Hexagon / eight-node · honeycomb · polygons-in-circle',
      body:
        'Locked product step: 3D Hexagon / eight-node broadcast — one originating story, eight connection ports (not subject categories). Honeycomb = axial hex pathway graph (language-radar). Polygon-spin clocks appear in TRGM companions. Formal hexagon–circle Soft Story geometry remains an open novelty — not claimed as shipped proof.',
    },
    {
      id: 'wave',
      name: 'Wave–Node–Fq · nested vectors · interference',
      body:
        'Wave–Node–Fq activation / phase / template selector; nested vectors carry hierarchy, cross-links, and selective working sets; Layer B interference detection marks path/ownership overlap so agents do not silently collide. Keep these three uses distinct.',
    },
    {
      id: 'awareness',
      name: 'Awareness (human grip Soft Story)',
      body:
        'What each participant keeps as its grip on the shared world: observations, beliefs, actions, ownership — including human operators. Attention → awareness → downstream activation is catalog grammar (MFA ≠ phenomenal consciousness). Do not upgrade Φ or Tiny Gateway into awareness physics. Git awareness is Layer E repo grip.',
    },
    {
      id: 'synthesis',
      name: 'Synthesis → product',
      body:
        'Rhyming Templates under the four-pillar gate → Tiny Gateway™ (templates · nested vectors · selective reconstruction) → Tiny Footprint (Layer A shared world + deltas) → Layers B–F (Coordination · Shared state · Composition · Git · Deploy paid) → FractiSI Multi-Agent beside Cursor / Claude Code / VS Code / Git.',
    },
  ]),
  activeInference:
    'Possible Active Inference rhyme: many agents — including humans — operate in one shared world with different observations, beliefs, and actions, without each reprinting a private full copy. “Rhyme” = structural kinship for joint experiments — not framework identity.',
  chain:
    'Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Recursive trees / holographic rhyme → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers A–F → FractiSI Multi-Agent',
  honesty:
    'Catalog / architectural grammar and in-process labs — not CapEx guarantees, not a Theory of Everything, not Active Inference identity, not infinite physical octave tiers, not Φ as ℏ/c/G or awareness ontology. Formal hexagon–circle geometry open. Eight-node / Exp 002 / Tiny Gateway #52 are architectural labs — not production HBM proof. MFA ≠ phenomenal consciousness.',
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
