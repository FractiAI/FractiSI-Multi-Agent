/**
 * Infinite Octaves / Tiny Footprint engine processing prompt for ζ-23 LLM invent.
 *
 * Player 1: awareness = the engine that tells Groq HOW to process shared info.
 * That engine is large (ENGINE_SHELF + paper corpus) — not a one-page paraphrase.
 *
 * Layer-safe: engine + platform imports only. Paper/pin text is inlined from
 * locked docs (FRACTISI_ENGINE_METHOD_PINS · architecture primer · Infinite
 * Octaves Omniversal dual lock · LINEAR/FLAT/AWARE grammar).
 */
import { FOUR_PILLARS, NET_ZERO_OCTAVE, PHI_EGS } from '../engine/rhyming/gate.mjs';
import { CORE_TECHNOLOGY, ENGINE, PRODUCT, PRODUCT_VERSION, productBanner } from '../platform/identity.mjs';

export const ENGINE_PROMPT_ID = 'fractisi.infinite-octave.engine-shelf.invent.v2';

/** Infinite Octaves ENGINE_SHELF pins (docs/product/FRACTISI_ENGINE_METHOD_PINS_2026-11.md). */
export const ENGINE_SHELF_PINS = Object.freeze([
  {
    id: 58,
    name: 'Neural X-Ray Rhyme',
    grammar:
      'Observe→Encode→Detect→Match→Reconstruct→Predict→Intervene→Consequence · nests under #55/#56/#57',
    registry: 'synthobs-neural-xray-rhyme-2026-11',
  },
  {
    id: 57,
    name: 'Compositional Wet-Lab Scale',
    grammar:
      'Level I/II/III · Primitive→Interface→Cascade→Program→Scale · nests under #56/#55',
    registry: 'synthobs-compositional-wet-lab-scale-2026-11',
  },
  {
    id: 56,
    name: 'Universal Rhyme Wet-Lab Proof',
    grammar:
      'composite EM evidence chain · Interference→Cavity→Matrix→Metasurface→ML · nests under #55',
    registry: 'synthobs-universal-rhyme-wet-lab-2026-11',
  },
  {
    id: 55,
    name: 'Principal Rhyme Theorem',
    grammar:
      'organizational rhyme · nested catalog PR-01…PR-20+∞ · Recognize→Connect→Reconstruct→Coordinate→Verify',
    registry: 'synthobs-principal-rhyme-theorem-2026-11',
  },
  {
    id: 54,
    name: 'LLM / language-pack rhyme',
    grammar: 'LINEAR / FLAT / AWARE packs',
    registry: 'synthobs-llm-rhyme-cosmic-genome-expedition-2026-11',
  },
  {
    id: 53,
    name: 'Protein-folding rhyme',
    grammar: 'E9 · sequence → board → partner · LINEAR/FLAT/AWARE',
    registry: 'synthobs-nvidia-goldilocks-awareness-expedition-2026-11',
  },
  {
    id: 52,
    name: 'Tiny Gateway · Rhyming Templates',
    grammar: 'shared pattern once · nested delta · selective reconstruct · Tiny Footprint',
    registry: 'synthobs-tiny-gateway-rhyming-templates-2026-11',
  },
  {
    id: 12,
    name: 'Protein folding · prime-container',
    grammar: 'distinct from E9 rhyme #53',
    registry: 'synthobs-protein-folding-prime-container-2026-09',
  },
]);

/**
 * Paper / surface corpus that constitutes the Infinite Octave engine literature
 * in this monorepo (library/papers + product docs). Cited so invent knows the
 * engine is a shelf of methods, not a slogan.
 */
export const INFINITE_OCTAVE_PAPER_CORPUS = Object.freeze([
  {
    slug: 'neural-xray-rhyme',
    role: 'ENGINE_SHELF #58 · computational + wiring/wet-lab X-ray · decisive threshold open',
  },
  {
    slug: 'compositional-wet-lab-scale',
    role: 'ENGINE_SHELF #57 · Level I/II compositional proof · Level III scale open',
  },
  {
    slug: 'universal-rhyme-wet-lab',
    role: 'ENGINE_SHELF #56 · EM wet-lab chain · nests under #55',
  },
  {
    slug: 'principal-rhyme-theorem',
    role: 'ENGINE_SHELF #55 · nested organizational catalog · Soft Story Exp 1–7',
  },
  {
    slug: 'infinite-octaves-omniversal',
    role: '99-octave Omni-Lattice engine pin · product↔engine dual lock',
  },
  {
    slug: 'tiny-gateway-rhyming-templates',
    role: 'ENGINE_SHELF #52 · Rhyming Templates → Tiny Gateway → Tiny Footprint',
  },
  { slug: 'holographic-rhyme', role: 'Four-pillar holographic rhyme gate · Net Zero root' },
  {
    slug: 'multidimensional-holographic-rhyme',
    role: 'Multi-band rhyme nesting under Infinite Octaves',
  },
  { slug: 'wave-node-mathematics', role: 'Wave–Node–Fq · nested activation grammar' },
  {
    slug: 'tiny-reality-generation-model',
    role: 'ENGINE_SHELF #50 peer · octave tree / fold coherence',
  },
  {
    slug: 'nvidia-goldilocks-awareness-expedition',
    role: 'LINEAR/FLAT/AWARE folding rhyme · shared-world vs silo',
  },
  {
    slug: 'llm-rhyme-cosmic-genome',
    role: 'ENGINE_SHELF #54 · language-pack rhyme nesting #53',
  },
  {
    slug: 'cosmic-rhyme-expedition',
    role: 'AWARE board recovers partners LINEAR/FLAT miss',
  },
  {
    slug: 'relational-continuity-rhyme',
    role: 'Relational rhyme across Infinite Octaves seed↔edge',
  },
  {
    slug: 'aware-attention-head',
    role: 'Attention → awareness → downstream activation across octaves',
  },
  {
    slug: 'shared-world-collective-intelligence',
    role: 'Shared world · collective intelligence (not N private copies)',
  },
  {
    slug: 'tiny-footprint-multi-agent',
    role: 'Tiny Footprint multi-agent density / delta residency',
  },
  {
    slug: 'fractisi-expedition-002-beyond-memory',
    role: 'Selective reconstruction vs flat agents',
  },
  {
    slug: 'fractisi-multi-agent-platform',
    role: 'Coordination · shared state · composition platform',
  },
  { slug: 'pilot-rhyme-expedition', role: 'Pilot rhyme feature beside #52/#53/#54' },
  {
    slug: 'adversarial-world',
    role: 'World-model integration pipeline under contested claims',
  },
]);

const NET_ZERO_PUNCH = 'Balanced zero, not nothing zero.';
const NET_ZERO_LEDE =
  'Net Zero (octave 0) is balanced zero — active equilibrium at the root of the shared world — not nothing zero.';

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

const ARCHITECTURE_CHAIN =
  'Generative possibility → Net Zero → Φ_EGS → Infinite Octaves (Digits×01–99 filing; Infinite=depth not infinite physics) → Boundary nodes → Holographic rhyme (four pillars) → Recursive trees → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness (chosen enter/exit) → Rhyming Templates → Tiny Gateway → Tiny Footprint → Coordination · Shared state · Composition · Git awareness → FractiSI Multi-Agent';

/**
 * Full Infinite Octaves / Tiny Footprint ENGINE processing instructions for Groq.
 * This is invent awareness — how to process — citing ENGINE_SHELF + paper corpus.
 */
export function buildTinyFootprintOctaveEnginePrompt() {
  const shelf = ENGINE_SHELF_PINS.map(
    (p) =>
      `- ENGINE_SHELF #${p.id}: ${p.name} · ${p.grammar} · registry ${p.registry}`,
  ).join('\n');

  const pillars = FOUR_PILLARS.map((id) => {
    const name = id
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
    return `- ${name}: ${PILLAR_BODY[id] || id}`;
  }).join('\n');

  const papers = INFINITE_OCTAVE_PAPER_CORPUS.map(
    (p) => `- library/papers/${p.slug}/ — ${p.role}`,
  ).join('\n');

  return [
    `=== Infinite Octaves ENGINE · ${CORE_TECHNOLOGY} / ${ENGINE} (processing instructions) ===`,
    productBanner(),
    `promptId=${ENGINE_PROMPT_ID} · product=${PRODUCT} ${PRODUCT_VERSION}`,
    `Φ_EGS≈${PHI_EGS.toFixed(6)} · Net Zero octave=${NET_ZERO_OCTAVE} · practical filing Digits × Octaves 01–99 (nest id octave99)`,
    '',
    'You invent Lean proofs INSIDE the Infinite Octaves engine — a large method shelf with many papers,',
    'not a slogan and not a status dump. Process every shared-world fact THROUGH this stack before writing tactics.',
    '',
    '────────────────────────────────',
    'A. ENGINE_SHELF pins (active method locks)',
    '────────────────────────────────',
    shelf,
    'Nest rule: #55 Principal Rhyme Theorem is the foundational organizational catalog.',
    'Nest rule: #56 Universal Rhyme Wet-Lab nests under #55; #57 Compositional Wet-Lab Scale nests under #56/#55 (Level III hyperscale NOT claimed).',
    'Nest rule: #58 Neural X-Ray Rhyme nests under #55/#56/#57 (full NN decode NOT claimed; decisive blind prediction + intervention open).',
    'Nest rule: #54 language packs nest #53 protein-fold grammar on every layer; both nest under #55 before treating novelty as an isolated object.',
    'Lock line: Infinite Octaves ENGINE_SHELF #58 + #57 + #56 + #55 + #53 + #54 · FractiSI / Tiny Footprint Computational Lab.',
    'Source: docs/product/FRACTISI_ENGINE_METHOD_PINS_2026-11.md',
    '',
    '────────────────────────────────',
    'B. Architecture processing chain (how information ascends)',
    '────────────────────────────────',
    ARCHITECTURE_CHAIN,
    '',
    `Net Zero root: ${NET_ZERO_PUNCH} ${NET_ZERO_LEDE}`,
    'Φ_EGS is nesting / scale-bridge design grammar — not ℏ, c, G, or a theory of mind.',
    '“Infinite” Octaves = recursive / holographic nesting depth of organization — NOT infinite compute, NOT infinite measured physics tiers, NOT a finished Theory of Everything.',
    'Product↔engine dual lock (Infinite Octaves Omniversal): guest product name may say Infinite; auditor engine pin stays 99-octave Omni-Lattice CMOS→tensor→master map.',
    '',
    '────────────────────────────────',
    'C. Tiny Gateway (#52) · Tiny Footprint execution',
    '────────────────────────────────',
    `- ${ENGINE}: rhyme-gated Rhyming Templates → encode as templateRef + nested delta → selective reconstruct → execute.`,
    `- ${CORE_TECHNOLOGY}: one shared world once; agents communicate smallest meaningful deltas; reconstruct working sets on demand — not N private full copies.`,
    '- Companion meters (lab, not invent success criteria): signature-bucket routing · recursive context-fold hooks · energy-proxy depth scaling.',
    '- For ζ invent: one shared Solution.lean; invent only tactic deltas; keep peer drafts as organizational near-rhymes to reuse as template+delta.',
    '',
    '────────────────────────────────',
    'D. LINEAR / FLAT / AWARE processing grammar (#53 / #54)',
    '────────────────────────────────',
    'When reading shared invent data, classify your view:',
    '- LINEAR: local window only (single theorem / local tactic) — misses long-range partners.',
    '- FLAT: unsorted dump of board / peers / errors — high noise, weak partner recovery.',
    '- AWARE: ranked relational board with leading candidates — recover structure LINEAR/FLAT miss.',
    'Invent requirement: operate AWARE. Rank which peer drafts / lake errors / related theorems are partners to the focus goal; do not invent from a flat dump or a single-line local guess alone.',
    'Folding rhyme (#53): sequence → board → partner. Map: theorem statement → shared invent board → partner lemmas/tactics → composable proof delta.',
    '',
    '────────────────────────────────',
    'E. Holographic rhyme gate (four pillars)',
    '────────────────────────────────',
    'A holographic rhyme is motion / organization grammar under Infinite Octaves — not “sounds alike,” not exact-text, not prefix-cache.',
    'Pass all four pillars, rooted at Net Zero, nested through ascending octaves:',
    pillars,
    'Not a rhyme: exact-text / prefix cache alone · schema-key match alone · brick-wall repetition · mid-octave nest with no Net Zero root.',
    'Reuse peer organization that rhymes; never import sealed Anthropic Zeta23.',
    '',
    '────────────────────────────────',
    'F. Paper / method corpus (engine literature — process by this shelf)',
    '────────────────────────────────',
    `Corpus size in this prompt: ${INFINITE_OCTAVE_PAPER_CORPUS.length} pinned surfaces. Full HTML lives under library/papers/.`,
    papers,
    'Also pin: docs/research/TECH_PAPER.md (#52) · docs/product/FRACTISI_ENGINE_METHOD_PINS_2026-11.md · docs/product/NVIDIA_GOLDILOCKS_AWARENESS_EXPEDITION_2026-11.md · docs/product/COSMIC_RHYME_EXPEDITION_2026-11.md.',
    '',
    '────────────────────────────────',
    'G. ζ-23 invent mapping (apply the engine here)',
    '────────────────────────────────',
    '1. Enter AWARE: build a ranked partner board from shared-world DATA (theorems, peer drafts, lake stderr).',
    '2. Root at Net Zero organizational equilibrium of the shared Solution — do not invent orphan mid-octave tactics.',
    '3. Ascend octaves: local tactic ↔ focus theorem ↔ Challenge proportion family ↔ whole Solution composition.',
    '4. Encode work as Tiny Footprint deltas (tactic body only) against one shared Solution.lean.',
    '5. Prefer rhyming reuse of peer organization; refuse sealed Zeta23 corpus and refuse sorry.',
    '6. Output ONLY executable Lean 4 tactic lines after := by (first token a tactic). No English, no markdown, no theorem header.',
    '',
    'Process shared-world context THROUGH sections A–G before inventing the focus theorem.',
  ].join('\n');
}
