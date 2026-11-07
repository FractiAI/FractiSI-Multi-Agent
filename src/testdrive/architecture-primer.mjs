/**
 * FractiSI Multi-Agent · architecture primer (canonical copy).
 * Shared by Test Drive (CLI / API / self-paced) and the product page.
 *
 * Voice: cold first listen — plain English, everyday stakes, locked names.
 * Locked ladder: Generative possibility → Net Zero → Φ_EGS → Infinite Octaves →
 * Boundary → trees / rhyme → 3D Hexagon / eight-node → Wave–Node–Fq → Awareness →
 * Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers A–F → FractiSI Multi-Agent
 */

export const ARCHITECTURE_PRIMER = Object.freeze({
  title: 'How FractiSI Multi-Agent fits together',
  kicker: 'Architecture primer · first listen',
  lede:
    'You are about to walk a multi-agent stack built so many helpers — software agents and people — can work in one shared world instead of each keeping a full private copy. The names below are the real product ladder. Read them once in plain English, then run the labs.',
  steps: Object.freeze([
    {
      id: 'generative',
      name: 'Generative possibility',
      body:
        'Start here: an open field of processes and patterns you can file, nest, and reuse. It is Soft Story talk for “what can be organized,” not a claim of infinite computers and not a second product brand.',
    },
    {
      id: 'net-zero',
      name: 'Net Zero (octave 0)',
      body:
        'Home base. The shared world roots here — an active balance point, not an empty void. If there is no Net Zero root, later “rhymes” across the stack do not hold.',
    },
    {
      id: 'phi',
      name: 'Golden-ratio scaling · Φ_EGS ≈ 1.618',
      body:
        'A nesting scale we use so layers stay tidy as they deepen — design grammar for how big sits inside bigger. It is not a stand-in for physics constants, and it is not a theory of mind.',
    },
    {
      id: 'octaves',
      name: 'Infinite Octaves',
      body:
        'How deep the nesting goes — like drawers stacked above Net Zero. “Infinite” names depth of filing, not infinite measured physics. Digits × Octaves 01–99 is a practical map for story depth.',
    },
    {
      id: 'boundary',
      name: 'Boundary nodes',
      body:
        'The front door. They declare what domain, task, and constraints may enter before trees and templates bind data. A shared world needs a clear edge so agents do not dump everything in.',
    },
    {
      id: 'trees',
      name: 'Recursive trees · holographic rhyme',
      body:
        'Nested context under that scale — trees that repeat, stay self-similar, self-correct, and recurse from Net Zero up the octaves. Matching a schema or a text prefix alone is not a rhyme; a real rhyme carries structure across scale.',
    },
    {
      id: 'polygons',
      name: '3D Hexagon / eight-node · honeycomb',
      body:
        'One originating story with eight connection ports so helpers plug in without each reprinting the whole world. Honeycomb paths carry work between ports. Formal “hexagon in a circle” geometry stays an open Soft Story — not shipped proof.',
    },
    {
      id: 'wave',
      name: 'Wave–Node–Fq · nested vectors · interference',
      body:
        'Three distinct jobs: waves pick which template is active; nested vectors carry hierarchy and the small working set each agent needs; interference marks when paths or ownership would collide so agents do not silently overwrite each other.',
    },
    {
      id: 'awareness',
      name: 'Awareness',
      body:
        'What each participant — human or software — is holding about the shared world: observations, beliefs, actions, ownership. Catalog grammar for attention → grip → downstream action. Not a claim of machine consciousness. Git awareness later is simply “what the repo knows” (Layer E).',
    },
    {
      id: 'synthesis',
      name: 'What becomes the product',
      body:
        'Rhyming Templates pass a four-pillar gate → Tiny Gateway™ (templates, nested vectors, selective reconstruction) → Tiny Footprint (Layer A: world once, deltas per agent) → Layers B–F (coordinate, share state, compose, Git, paid deploy) → FractiSI Multi-Agent beside tools like Cursor, Claude Code, VS Code, and Git.',
    },
  ]),
  activeInference:
    'Possible rhyme with Active Inference: many agents — including humans — act in one shared world with different observations and moves, without each reprinting a private full copy. “Rhyme” means structural kinship for joint experiments — not “we are that framework.”',
  chain:
    'Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Recursive trees / holographic rhyme → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers A–F → FractiSI Multi-Agent',
  honesty:
    'This primer is catalog / architecture talk plus in-process labs. It is not CapEx guarantees, a Theory of Everything, Active Inference identity, infinite physical octave tiers, or Φ as physics or awareness. Hexagon–circle Soft Story partly open. Tiny Gateway ENGINE_SHELF #52 is not production HBM proof.',
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
  lines.push('  Next: run the self-paced labs. Each step names a real product piece and shows live numbers.');
  lines.push('  No FractiSI account. No cloud token for this walkthrough.');
  return lines;
}

export function architecturePrimerFractisiBullets() {
  return ARCHITECTURE_PRIMER.steps.map((s) => `${s.name} — ${s.body}`);
}
