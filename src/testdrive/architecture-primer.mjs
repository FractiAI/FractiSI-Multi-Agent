/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API) and the product page.
 *
 * Voice: frontier product engineering — concrete, short, locked names.
 * Net Zero first: src/testdrive/net-zero-definition.mjs ← singularity crystal + Goldilocks≡Net Zero.
 * Then rhyme: src/testdrive/rhyme-definition.mjs ← gate.mjs + holographic-rhyme paper.
 */

import { NET_ZERO_DEFINITION, netZeroDefinitionLines } from './net-zero-definition.mjs';
import { RHYME_DEFINITION, rhymeDefinitionLines } from './rhyme-definition.mjs';

export { NET_ZERO_DEFINITION, netZeroDefinitionLines, RHYME_DEFINITION, rhymeDefinitionLines };

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
      name: NET_ZERO_DEFINITION.name,
      body: `${NET_ZERO_DEFINITION.lede} ${NET_ZERO_DEFINITION.body} ${NET_ZERO_DEFINITION.productRole}`,
    },
    {
      id: 'phi',
      name: 'Φ_EGS ≈ 1.618',
      body:
        'Nesting / scale-bridge constant used as design grammar for recursive octave ascent. Not ℏ, c, or G. Not a theory of mind.',
    },
    {
      id: 'octaves',
      name: 'Infinite Octaves',
      body:
        `Nesting depth above ${NET_ZERO_DEFINITION.shortName}. Digits × Octaves 01–99 is a filing map. “Infinite” = depth of organization, not infinite measured physics tiers.`,
    },
    {
      id: 'boundary',
      name: 'Boundary nodes',
      body:
        'Entry constraints: domain, task, what may cross into the shared world before templates bind data.',
    },
    {
      id: 'rhyme',
      name: 'Holographic rhyme (four-pillar gate)',
      body:
        `${RHYME_DEFINITION.lede} ${RHYME_DEFINITION.gate} Pillars: repeating · self-similar · self-correcting · recursive. Not a rhyme: exact-text / prefix cache alone, schema-key match alone, brick-wall repetition, or mid-octave nest without ${NET_ZERO_DEFINITION.shortName}.`,
    },
    {
      id: 'trees',
      name: 'Recursive trees',
      body:
        'Hierarchical context that carries rhyme across scale once the four-pillar gate passes. Schema match or text prefix alone is still not a rhyme.',
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
        'What each participant holds about the shared world (observations, beliefs, actions, ownership). Not phenomenal consciousness. Git awareness = repo grip (commits / worktrees).',
    },
    {
      id: 'synthesis',
      name: 'Product surface',
      body:
        'Rhyming Templates (under the rhyme gate) → Tiny Gateway™ → Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy (paid) → FractiSI Multi-Agent beside Cursor, Claude Code, VS Code, and Git.',
    },
  ]),
  activeInference: RHYME_DEFINITION.symposiumKinship,
  chain:
    'Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Holographic rhyme (four pillars) → Recursive trees → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy → FractiSI Multi-Agent',
  honesty:
    'Catalog + in-process labs. Not CapEx guarantees, not a Theory of Everything, not Active Inference identity, not infinite physical octave tiers, not Φ as physics or awareness. Net Zero ≠ dead stillness / climate slogan. Rhyme ≠ prefix cache. Hexagon–circle Soft Story partly open. Tiny Gateway ENGINE_SHELF #52 ≠ production HBM proof.',
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
  // Define Net Zero before the rhyme gate that roots on it.
  lines.push(...netZeroDefinitionLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push(...rhymeDefinitionLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push('  Symposium kinship (separate word use)');
  lines.push(`    ${p.activeInference}`);
  lines.push('');
  lines.push('  Next: labs 1–7. Same runners as the CLI. No account. No cloud token for the Test Drive.');
  return lines;
}

export function architecturePrimerFractisiBullets() {
  return ARCHITECTURE_PRIMER.steps.map((s) => `${s.name} — ${s.body}`);
}
