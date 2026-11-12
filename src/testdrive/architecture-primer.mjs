/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API) and the product page.
 *
 * Voice: frontier product engineering — concrete, short, locked names.
 * Sandbox frame first: Base Mainnet → Syntheverse (enter/exit with chosen awareness).
 * Net Zero: src/testdrive/net-zero-definition.mjs
 * Rhyme: src/testdrive/rhyme-definition.mjs
 */

import { OPENING_STORY, openingStoryLines } from './opening-story.mjs';
import { SANDBOX_FRAME, sandboxFrameLines } from './sandbox-frame.mjs';
import { NET_ZERO_DEFINITION, netZeroDefinitionLines } from './net-zero-definition.mjs';
import { RHYME_DEFINITION, rhymeDefinitionLines } from './rhyme-definition.mjs';

export {
  OPENING_STORY,
  openingStoryLines,
  SANDBOX_FRAME,
  sandboxFrameLines,
  NET_ZERO_DEFINITION,
  netZeroDefinitionLines,
  RHYME_DEFINITION,
  rhymeDefinitionLines,
};

export const ARCHITECTURE_PRIMER = Object.freeze({
  title: 'FractiSI Multi-Agent · stack map',
  kicker: 'Architecture primer',
  lede:
    'We begin with a restroom-valet AI-music story: awareness frames sensory observations. With that in mind we introduce FractiSI Multi-Agent as a shared Fractal Holographic Goldilocks Superintelligence World Awareness — an operating Test Drive, not a lecture — then peek inside the Syntheverse Sandbox on Base Mainnet. Enter and leave with whichever awareness you choose. Inside: one shared world where human and digital agents collaborate instead of N private full copies.',
  steps: Object.freeze([
    {
      id: 'base-mainnet',
      name: SANDBOX_FRAME.baseMainnet.name,
      body: SANDBOX_FRAME.baseMainnet.body,
    },
    {
      id: 'syntheverse',
      name: SANDBOX_FRAME.syntheverse.name,
      body: SANDBOX_FRAME.syntheverse.body,
    },
    {
      id: 'generative',
      name: 'Generative possibility',
      body:
        'The field of processes and patterns the system can file, nest, and reuse. Organizational openness — not a claim of infinite compute, not a second brand.',
    },
    {
      id: 'net-zero',
      name: NET_ZERO_DEFINITION.name,
      body: `${NET_ZERO_DEFINITION.punch} ${NET_ZERO_DEFINITION.lede} ${NET_ZERO_DEFINITION.body} ${NET_ZERO_DEFINITION.productRole}`,
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
      name: SANDBOX_FRAME.awareness.name,
      body: `${SANDBOX_FRAME.awareness.body} Git awareness = repo grip (commits / worktrees) when you choose that path.`,
    },
    {
      id: 'synthesis',
      name: 'Product surface',
      body:
        'Rhyming Templates (under the rhyme gate) → Tiny Gateway™ → Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy (paid) → FractiSI Multi-Agent beside Cursor, Claude Code, VS Code, and Git — still inside the sandbox until you leave.',
    },
  ]),
  activeInference: RHYME_DEFINITION.symposiumKinship,
  chain:
    'Base Mainnet → Syntheverse Sandbox → Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Holographic rhyme (four pillars) → Recursive trees → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness (enter/exit by choice) → Rhyming Templates → Tiny Gateway → Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy → FractiSI Multi-Agent',
  honesty:
    'Catalog + in-process labs inside Syntheverse Sandbox on Base Mainnet bedrock. Voluntary enter/exit with chosen awareness — not a crypto purchase requirement. Not CapEx guarantees, not a Theory of Everything, not Active Inference identity, not infinite physical octave tiers, not Φ as physics or awareness. Net Zero = balanced zero ≠ nothing zero / climate slogan. Rhyme ≠ prefix cache. Hexagon–circle Soft Story partly open. Tiny Gateway ENGINE_SHELF #52 ≠ production HBM proof. Not clinical Synthio MRI.',
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
  lines.push(...openingStoryLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push(...sandboxFrameLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push(...netZeroDefinitionLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push(...rhymeDefinitionLines().map((l) => (l.startsWith('  ') || l === '' ? l : `  ${l}`)));
  lines.push('');
  lines.push('  Symposium kinship (separate word use)');
  lines.push(`    ${p.activeInference}`);
  lines.push('');
  lines.push('  Next: optional labs 1–7. Same runners as the CLI. No account required for the peek.');
  return lines;
}

export function architecturePrimerFractisiBullets() {
  return ARCHITECTURE_PRIMER.steps.map((s) => `${s.name} — ${s.body}`);
}
