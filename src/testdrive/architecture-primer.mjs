/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API / self-paced) and the product page.
 *
 * Voice: frontier product engineering — concrete, short, locked names.
 */

export const ARCHITECTURE_PRIMER = Object.freeze({
  title: 'FractiSI Multi-Agent · stack map',
  kicker: 'Architecture primer',
  lede:
    'FractiSI Multi-Agent keeps one shared world for many agents (and human operators) instead of N private full copies. The ladder below is the shipped naming — then the labs measure it.',
  steps: Object.freeze([
    {
      id: 'generative',
      name: 'Generative possibility',
      body:
        'The field of processes and patterns the system can file, nest, and reuse. Organizational openness — not a claim of infinite compute, not a second brand.',
    },
    {
      id: 'net-zero',
      name: 'Net Zero (octave 0)',
      body:
        'Root of the shared world. Active equilibrium, not empty void. Rhymes and nested structure hang from here.',
    },
    {
      id: 'phi',
      name: 'Φ_EGS ≈ 1.618',
      body:
        'Nesting / scale-bridge constant used as design grammar. Not ℏ, c, or G. Not a theory of mind.',
    },
    {
      id: 'octaves',
      name: 'Infinite Octaves',
      body:
        'Nesting depth above Net Zero. Digits × Octaves 01–99 is a filing map. “Infinite” = depth of organization, not infinite measured physics tiers.',
    },
    {
      id: 'boundary',
      name: 'Boundary nodes',
      body:
        'Entry constraints: domain, task, what may cross into the shared world before templates bind data.',
    },
    {
      id: 'trees',
      name: 'Recursive trees · holographic rhyme',
      body:
        'Hierarchical context with four pillars: repeating, self-similar, self-correcting, recursive. Schema match or text prefix alone is not a rhyme.',
    },
    {
      id: 'polygons',
      name: '3D Hexagon / eight-node · honeycomb',
      body:
        'One originating story, eight connection ports. Honeycomb paths between ports. Formal hexagon–circle geometry remains an open Soft Story — not shipped proof.',
    },
    {
      id: 'wave',
      name: 'Wave–Node–Fq · nested vectors · interference',
      body:
        'Template activation; per-agent working sets; collision marks when paths or ownership overlap. Three jobs — keep them distinct.',
    },
    {
      id: 'awareness',
      name: 'Awareness',
      body:
        'What each participant holds about the shared world (observations, beliefs, actions, ownership). Not phenomenal consciousness. Git awareness = Layer E repo state.',
    },
    {
      id: 'synthesis',
      name: 'Product surface',
      body:
        'Rhyming Templates → Tiny Gateway™ → Tiny Footprint → Layers B–F (coordinate, shared state, compose, Git, paid deploy) → FractiSI Multi-Agent beside Cursor, Claude Code, VS Code, and Git.',
    },
  ]),
  activeInference:
    'Possible structural rhyme with Active Inference: many agents — including humans — act in one shared world without each reprinting a private full copy. Kinship for joint experiments — not framework identity.',
  chain:
    'Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Recursive trees / holographic rhyme → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers B–F → FractiSI Multi-Agent',
  honesty:
    'Catalog + in-process labs. Not CapEx guarantees, not a Theory of Everything, not Active Inference identity, not infinite physical octave tiers, not Φ as physics or awareness. Hexagon–circle Soft Story partly open. Tiny Gateway ENGINE_SHELF #52 ≠ production HBM proof.',
});

/** Plain-text lines for CLI / API results panels. */
export function architecturePrimerLines() {
  const p = ARCHITECTURE_PRIMER;
  const lines = [
    p.title.toUpperCase(),
    '',
    `  ${p.lede}`,
    '',
    `  Ladder: ${p.chain}`,
    '',
  ];
  for (const s of p.steps) {
    lines.push(`  ${s.name}`);
    lines.push(`    ${s.body}`);
    lines.push('');
  }
  lines.push('  Active Inference (possible rhyme)');
  lines.push(`    ${p.activeInference}`);
  lines.push('');
  lines.push('  Next: labs 1–7. Same runners as the CLI. No account. No cloud token for the walkthrough.');
  return lines;
}

export function architecturePrimerFractisiBullets() {
  return ARCHITECTURE_PRIMER.steps.map((s) => `${s.name} — ${s.body}`);
}
