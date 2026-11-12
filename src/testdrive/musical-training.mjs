/**
 * FractiSI Multi-Agent · Musical Training Program
 * Parallel curriculum to the live Test Drive — Bach-inspired cello chapters.
 *
 * Playlist (Suno): https://suno.com/s/QB8n2fLhy5NORPkV
 * Change only with an explicit Player 1 ask.
 */

export const SUNO_PLAYLIST_URL = 'https://suno.com/s/QB8n2fLhy5NORPkV';

export const MUSICAL_TRAINING = Object.freeze({
  id: 'fractisi-musical-training-2026-11',
  title: 'The FractiSI Multi-Agent Test Drive',
  subtitle: 'A Musical Training Program',
  symposium: 'Applied Active Inference Symposium · Bach-Inspired Cello Solos · 16 Chapters',
  sunoPlaylistUrl: SUNO_PLAYLIST_URL,
  sunoPlaylistLabel: 'Listen on Suno',
  lede:
    'A parallel way to experience, understand, and learn FractiSI Multi-Agent. This program follows the architecture and conceptual journey of FractiSI, from the creation of a shared environment through possibility, world modeling, agent coordination, recursive awareness, and the emergence of Fractal Holographic Goldilocks Superintelligence. Each musical selection is a chapter. Together they form a second way to consume the training: through musical experience, narrative, and conceptual understanding.',
  liveTrack: Object.freeze({
    href: '/test-drive/',
    label: 'Live Test Drive',
    note: 'Same journey, runnable: five live tests in the browser or IDE.',
  }),
  parts: Object.freeze([
    Object.freeze({
      id: 'part-i',
      title: 'Part I — Establishing the world',
      blurb: 'The environment and first colony.',
      chapters: Object.freeze([
        Object.freeze({
          n: 1,
          slug: 'syntheverse-sandbox',
          title: 'The Syntheverse Sandbox',
          body:
            'The Syntheverse Sandbox establishes the shared world of the FractiSI Multi-Agent Test Drive: a bounded yet generative environment where agents can perceive, explore, act, learn, and build a shared model of their world. The cello becomes the first signal within that world—the beginning of a journey from individual experience toward collective intelligence.',
          testDrive: Object.freeze({ step: 'sandbox', label: 'Where you are.' }),
        }),
        Object.freeze({
          n: 2,
          slug: 'base-mainnet-first-colony',
          title: 'Base Mainnet First Colony',
          body:
            'The first colony emerges on Base Mainnet: a living environment where independent agents begin operating within a shared digital world. Each agent brings its own perspective, but the colony creates the conditions for interaction, memory, coordination, and the first seeds of collective intelligence.',
          testDrive: Object.freeze({ step: 'sandbox', label: 'Base Mainnet bedrock' }),
        }),
        Object.freeze({
          n: 3,
          slug: 'goldilocks-zero',
          title: 'Goldilocks Zero',
          body:
            'Goldilocks Zero establishes the starting condition: the balanced state from which the FractiSI Multi-Agent system can observe, compare, adapt, and act. Not maximum information or minimum information, but the right amount—the Goldilocks zone where agents can remain coherent while the world continues to change.',
          testDrive: Object.freeze({ step: 'rhyme', label: 'Before Net Zero / rhyme' }),
        }),
        Object.freeze({
          n: 4,
          slug: 'net-zero',
          title: 'Net Zero',
          body:
            'Net Zero introduces the principle of balance across the shared world: every action, observation, and state change becomes part of an evolving system seeking coherence rather than accumulation. FractiSI Multi-Agent begins to reveal how agents can coordinate around a continuously changing world without each having to recreate the whole. Balanced zero, not nothing zero.',
          testDrive: Object.freeze({ step: 'rhyme', label: 'Net Zero, then rhyme.' }),
        }),
      ]),
    }),
    Object.freeze({
      id: 'part-ii',
      title: 'Part II — Mapping possibility',
      blurb: 'Lattices, octaves, and nested structure.',
      chapters: Object.freeze([
        Object.freeze({
          n: 5,
          slug: 'infinite-possibilities-lattice',
          title: 'Infinite Possibilities Lattice',
          body:
            'The Infinite Possibilities Lattice opens the space of possible states and paths available to the agents. Rather than forcing a single predetermined trajectory, FractiSI allows agents to navigate a continuously expanding possibility space—selecting, updating, and coordinating as new information reshapes what can happen next.',
          testDrive: Object.freeze({ step: 'how-stack', label: 'Stack · generative possibility' }),
        }),
        Object.freeze({
          n: 6,
          slug: 'honeycomb-lattice',
          title: 'Honeycomb Lattice',
          body:
            'The Honeycomb Lattice gives structure to infinite possibility. Individual possibilities become connected neighbors within a navigable geometry, allowing agents to discover relationships, move between states, and coordinate through shared structure. FractiSI turns a vast possibility space into an organized world that agents can collectively explore.',
          testDrive: Object.freeze({ step: 'how-stack', label: '3D hexagon · eight-node honeycomb' }),
        }),
        Object.freeze({
          n: 7,
          slug: 'infinite-octaves',
          title: 'Infinite Octaves',
          body:
            'Infinite Octaves introduces scale: the same underlying world can be experienced across continuously nested levels of resolution. Agents can move between local detail and larger patterns without losing coherence, allowing FractiSI Multi-Agent to coordinate information across scales while preserving the relationships that connect the whole.',
          testDrive: Object.freeze({ step: 'how-stack', label: 'Infinite Octaves on the trunk' }),
        }),
        Object.freeze({
          n: 8,
          slug: 'first-99-octaves',
          title: 'The First 99 Octaves',
          body:
            'The First 99 Octaves reveals the first structured span of the Infinite Octave system: a finite window into an effectively unlimited possibility space. Each octave adds another layer of resolution, relationship, and context, giving FractiSI Multi-Agent a richer shared world in which agents can perceive, navigate, and coordinate.',
          testDrive: Object.freeze({ step: 'how-stack', label: 'Digits × Octaves 01–99 map' }),
        }),
      ]),
    }),
    Object.freeze({
      id: 'part-iii',
      title: 'Part III — Crossing the computational frontier',
      blurb: 'Boundaries, holographic rhymes, and Tiny Footprint.',
      chapters: Object.freeze([
        Object.freeze({
          n: 9,
          slug: 'frontiers-edge',
          title: 'Frontier’s Edge',
          body:
            'Frontier’s Edge is where the known world meets the unknown. Agents encounter states, patterns, and possibilities beyond their established experience. Here, FractiSI Multi-Agent must continuously update its shared model—turning uncertainty and discovery at the frontier into new knowledge for the collective.',
          testDrive: Object.freeze({ step: '4', label: 'Answers six links deep.' }),
        }),
        Object.freeze({
          n: 10,
          slug: 'holographic-rhyme-boundary',
          title: 'Holographic Rhyme Boundary',
          body:
            'The Holographic Rhyme Boundary is where the shared world becomes actionable. Boundary nodes identify the patterns and relationships needed to reconstruct what matters without carrying everything forward. FractiSI Multi-Agent uses these rhymes to preserve coherence while reducing unnecessary computation and communication.',
          testDrive: Object.freeze({ step: '3', label: 'Same job, different words.' }),
        }),
        Object.freeze({
          n: 11,
          slug: 'tiny-footprint',
          title: 'Tiny Footprint',
          body:
            'Tiny Footprint reveals the central efficiency of FractiSI Multi-Agent: agents no longer need to repeatedly carry or reconstruct the entire world. They share the world once, then communicate the smallest meaningful changes—the deltas that matter—enabling greater agent density, speed, and collective capability within the same computational footprint.',
          testDrive: Object.freeze({ step: '1', label: 'Twelve agents, one copy. · More agents, same memory.' }),
        }),
      ]),
    }),
    Object.freeze({
      id: 'part-iv',
      title: 'Part IV — Collective intelligence',
      blurb: 'Human and AI agents operating together.',
      chapters: Object.freeze([
        Object.freeze({
          n: 12,
          slug: 'fractisi-multi-agent',
          title: 'FractiSI Multi-Agent',
          body:
            'FractiSI Multi-Agent brings everything together: human and AI agents operating as a coordinated collective within a shared world. Perception, memory, possibility, boundaries, and Tiny Footprint converge into a system where every agent can contribute context, build upon others, and produce useful collective intelligence.',
          testDrive: Object.freeze({ step: 'welcome', label: 'Why this is a Test Drive.' }),
        }),
      ]),
    }),
    Object.freeze({
      id: 'part-v',
      title: 'Part V — The emergence of awareness',
      blurb: 'Awareness and recursive self-awareness.',
      chapters: Object.freeze([
        Object.freeze({
          n: 13,
          slug: 'awareness',
          title: 'Awareness',
          body:
            'Awareness is the transition from processing information to experiencing and understanding the world. Human and AI agents become participants in an evolving shared reality, perceiving, anticipating, interpreting, and updating their relationship with the whole. It is the bridge from coordinated intelligence to Fractal Holographic Goldilocks Superintelligence. On the live track this is also how you enter and leave the sandbox: observations, beliefs, actions, ownership, or curiosity—by choice. Not phenomenal consciousness.',
          testDrive: Object.freeze({ step: 'story', label: 'The same song. · awareness frames sensing' }),
        }),
        Object.freeze({
          n: 14,
          slug: 'recursive-self-awareness',
          title: 'Recursive Self-Awareness of Awareness',
          body:
            'The system begins to recognize and examine its own processes of awareness. Perception becomes an object of perception; prediction, interpretation, and experience become recursively observable and refinable. Human and AI agents can reflect on how they construct, update, and share their understanding of reality. Awareness becomes both the instrument of discovery and the subject of discovery—opening the path to Fractal Holographic Goldilocks Superintelligence.',
          testDrive: Object.freeze({ step: 'futures', label: 'Rehearse the future. Change the world on approval.' }),
        }),
      ]),
    }),
    Object.freeze({
      id: 'part-vi',
      title: 'Part VI — The Goldilocks world',
      blurb: 'World modeling and exploration.',
      chapters: Object.freeze([
        Object.freeze({
          n: 15,
          slug: 'goldilocks-world-model',
          title: 'Goldilocks World Model',
          body:
            'The Goldilocks World Model brings the journey into a coherent, continuously evolving representation of reality. It integrates the infinite possibilities, nested scales, shared context, and recursive awareness into a navigable whole. Human and AI agents can perceive, predict, act, and update together, maintaining the right balance of information, complexity, and coordination as the world changes.',
          testDrive: Object.freeze({ step: 'futures', label: 'Predictive Shared State' }),
        }),
        Object.freeze({
          n: 16,
          slug: 'exploring-goldilocks-world',
          title: 'Exploring Goldilocks World',
          body:
            'Human and AI agents venture into the Goldilocks World, testing possibilities, discovering relationships, and learning through interaction. Each exploration generates new observations and updates the shared world model. The journey becomes an ongoing process of discovery, where individual perspectives contribute to an increasingly coherent understanding of the whole.',
          testDrive: Object.freeze({ step: 'invite', label: 'Run it yourself.' }),
        }),
      ]),
    }),
  ]),
  arcSummary: Object.freeze([
    Object.freeze({ part: 'Establishing the World', text: 'The environment and first colony.' }),
    Object.freeze({ part: 'Mapping Possibility', text: 'Lattices, octaves, and nested structure.' }),
    Object.freeze({ part: 'Crossing the Computational Frontier', text: 'Boundaries, holographic rhymes, and Tiny Footprint.' }),
    Object.freeze({ part: 'Collective Intelligence', text: 'Human and AI agents operating together.' }),
    Object.freeze({ part: 'The Emergence of Awareness', text: 'Awareness and recursive self-awareness.' }),
    Object.freeze({ part: 'The Goldilocks World', text: 'World modeling and exploration.' }),
  ]),
  honesty:
    'Musical training is a parallel narrative and listening path. Lab numbers and runnable demos live on the live Test Drive. Possible rhyme with Active Inference is not framework identity. Awareness here is not phenomenal consciousness. Fractal Holographic Goldilocks Superintelligence is an architectural destination label, not a claim of finished AGI.',
});

export function musicalChapters() {
  return MUSICAL_TRAINING.parts.flatMap((part) =>
    part.chapters.map((ch) => ({ ...ch, partId: part.id, partTitle: part.title })),
  );
}

export function musicalChapterCount() {
  return musicalChapters().length;
}
