/**
 * FractiSI · Cigar Lounge listening program (Suno playlist).
 *
 * Opens with SS Vibelandia for listeners who do not know the story yet.
 * Tracks are presented inside the cigar lounge setting. Hero Jo is J.S. Bach;
 * "the gang" are spirit-crew lenses from the published Meet the crew surface
 * (not invented cast).
 *
 * Style lock: cello · solo · Baroque-honoring · original pieces made with
 * Suno AI from these thought streams/titles — not Bach transcriptions.
 *
 * Suno URL locked from Player 1.
 */

/** Bach Cigar Lounge Suno playlist — locked from Player 1. */
export const SUNO_PLAYLIST_URL = 'https://suno.com/s/rFGcOvgPsDU2Dk5s';
export const SUNO_PLAYLIST_URL_PLACEHOLDER = SUNO_PLAYLIST_URL;

/**
 * Spirit crew (“the gang”) — from published Meet the crew / QUESTFEST surfaces.
 * Catalog companions in the narrative, not payroll.
 */
export const CIGAR_LOUNGE_GANG = Object.freeze([
  Object.freeze({
    name: 'Hero Jo (J.S. Bach)',
    role: 'Architect & φ rail',
    note: 'Order, fugue honesty, Fair Exchange in the counterpoint; the Bachdoor is named after this spine. In the lounge, Hero Jo is Bach.',
    source: 'meet-the-crew / press Hero Jo (Bach)',
  }),
  Object.freeze({
    name: 'Valet Pru',
    role: 'Host · Downtown Reno · restroom-valet tell',
    note: 'Floor host who opens awareness before the stack; human door at info@fractiai.com.',
    source: 'opening-story / Test Drive #story / QUESTFEST',
  }),
  Object.freeze({
    name: 'Holographic VALETPRU (PL Taino)',
    role: 'Valet layer for the stack',
    note: 'Greets attention, routes asks, holds Fair Exchange language. Door, not decoration.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Chairman Frank (Sinatra)',
    role: 'Sovereign swing & port governance',
    note: 'How a room gets kept — lights, loyalty, and the line nobody crosses twice.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Hero Twain (Mark Twain)',
    role: 'River wit & American witness',
    note: 'Desert-and-river plain speak; laughs at fraud, honors the crowd.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Marilyn Monroe',
    role: 'Spotlight & nerve',
    note: 'Being seen without armor; keeps glamour from hardening into lie.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Frida Kahlo',
    role: 'Witness & pattern',
    note: 'Ache and identity into color so the body stays on the honesty rail.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Pablo Picasso',
    role: 'Fracture & reassembly',
    note: 'Seeing every face at once without losing the person.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Leonardo da Vinci',
    role: 'Polymath draftsmanship',
    note: 'Science, engineering, and beauty in one hand — frontiersman who refused one box.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Vincent van Gogh',
    role: 'Starry urgency',
    note: 'Color as confession; feeling first is not weakness when honesty follows.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Jean-Michel Basquiat',
    role: 'Crown & wrong-side glyph',
    note: 'Street wall meets museum frame; keeps Puerto Reno neon in the art grammar.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Howard Hughes',
    role: 'Silent sponsor & altitude',
    note: 'Prototype courage and the long bet on beauty in machines.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Hank Williams Jr.',
    role: 'High-lonesome dock voice · lounge roster',
    note: 'Road-cry truth; country spine in the harbor mix. Cigar Lounge gang lock: Junior (Player 1 correction). Published Meet the crew card historically named Sr.; lounge scenes use Jr.',
    source: 'cigar-lounge gang lock · Player 1 correction 2026-11-27',
  }),
  Object.freeze({
    name: 'Héctor Lavoe',
    role: 'Clave soul',
    note: 'Salsa nerve and wrong-side phrasing.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Vinicius de Moraes',
    role: 'Lyric architect',
    note: 'Bossa logic and romance-with-teeth.',
    source: 'meet-the-crew',
  }),
  Object.freeze({
    name: 'Chet Baker',
    role: 'Lounge guest · Player 1 add',
    note: 'Named for the Cigar Lounge chill scenes.',
    source: 'cigar-lounge gang lock · Player 1 2026-11-27',
  }),
]);

export const CIGAR_LOUNGE_TRACKS = Object.freeze([
  Object.freeze({
    n: 1,
    title: 'Fourteen Year Crossing',
    lounge: 'The door opens. Smoke, wood, and a long road already walked.',
    story:
      'In the lounge this is the crossing that brings a frontiersman to Puerto Reno — the published SS Vibelandia voyage arc from Genesis scale-rhyme through Borikén convergence to the Reno Captain’s seat (QUESTFEST 24×365). The cello does not recite a payroll biography; it carries the lived span that lands Valet Pru’s host seat and the gangway “wherever you are.” Thought-stream title for an original Baroque-honoring cello solo.',
    bridges: Object.freeze([
      Object.freeze({ href: 'https://www.ssvibelandiaquestfest24x365.com/frontiersman-voyage', label: 'Frontiersman voyage' }),
      Object.freeze({ href: 'https://www.ssvibelandiaquestfest24x365.com/questfest', label: 'SS Vibelandia QUESTFEST' }),
    ]),
  }),
  Object.freeze({
    n: 2,
    title: 'The Restroom Story',
    lounge: 'Same room, same speakers — until awareness flips the room.',
    story:
      'Valet Pru’s floor tell from the FractiSI Test Drive opening: AI-generated music in the restroom where he works as a restroom valet. Opinions change the moment listeners become aware the music is AI-generated. Same sound. Awareness framed the sensory observations. Soft Story Autodetect maps Suno / cigar lounge playlists to the Restroom behavioral lab theater. That is why this lounge and that restroom rhyme.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#story', label: 'The same song.' }),
      Object.freeze({ href: '/product/holographic-skin-demonstration/', label: 'Holographic Skin · Autodetect' }),
    ]),
  }),
  Object.freeze({
    n: 3,
    title: 'Into the Unknown',
    lounge: 'Beyond the familiar chairs — the frontier edge of the shared world.',
    story:
      'Maps to Frontier’s Edge on the FractiSI musical / architecture path: where the known world meets the unknown. Agents encounter states and possibilities beyond established experience; the shared model must update. On the voyage side it is the frontiersman’s willingness to explore — not a gene test, a door.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/musical/#ch-9', label: 'Frontier’s Edge (musical)' }),
      Object.freeze({ href: '/test-drive/#4', label: 'Answers six links deep.' }),
    ]),
  }),
  Object.freeze({
    n: 4,
    title: 'The Synthiverse Sandbox',
    lounge: 'First signal in a bounded yet generative world.',
    story:
      'The Syntheverse Sandbox establishes the shared world of the FractiSI Multi-Agent Test Drive: agents perceive, explore, act, learn, and build a shared model. The cello becomes the first signal within that world — individual experience toward collective intelligence. (Spelling on the thought-stream title: Synthiverse; product spelling: Syntheverse.)',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#sandbox', label: 'Where you are.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-1', label: 'Musical · Syntheverse Sandbox' }),
    ]),
  }),
  Object.freeze({
    n: 5,
    title: 'Base Mainnet First Colony',
    lounge: 'Independent agents take seats at the same table.',
    story:
      'The first colony emerges on Base Mainnet: independent agents begin operating within a shared digital world. Each brings its own perspective; the colony creates conditions for interaction, memory, coordination, and the first seeds of collective intelligence.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#sandbox', label: 'Base Mainnet bedrock' }),
      Object.freeze({ href: '/test-drive/musical/#ch-2', label: 'Musical · Base Mainnet First Colony' }),
    ]),
  }),
  Object.freeze({
    n: 6,
    title: 'Goldilocks Zero',
    lounge: 'Not too much, not too little — the starting balance.',
    story:
      'Goldilocks Zero is the starting condition: the balanced state from which FractiSI Multi-Agent can observe, compare, adapt, and act. Not maximum information or minimum information, but the right amount — where agents remain coherent while the world continues to change.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#rhyme', label: 'Before Net Zero / rhyme' }),
      Object.freeze({ href: '/test-drive/musical/#ch-3', label: 'Musical · Goldilocks Zero' }),
    ]),
  }),
  Object.freeze({
    n: 7,
    title: 'Net Zero',
    lounge: 'Every pour balanced against the whole room.',
    story:
      'Net Zero introduces balance across the shared world: every action, observation, and state change seeks coherence rather than accumulation. Agents coordinate around a continuously changing world without each recreating the whole. Balanced zero, not nothing zero.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#rhyme', label: 'Net Zero, then rhyme.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-4', label: 'Musical · Net Zero' }),
    ]),
  }),
  Object.freeze({
    n: 8,
    title: 'Infinite Possibilities Lattice',
    lounge: 'The room opens into paths not yet chosen.',
    story:
      'The Infinite Possibilities Lattice opens the space of possible states and paths. Rather than one predetermined trajectory, FractiSI lets agents navigate an expanding possibility space — selecting, updating, and coordinating as new information reshapes what can happen next.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#how-stack', label: 'Stack · generative possibility' }),
      Object.freeze({ href: '/test-drive/musical/#ch-5', label: 'Musical · Infinite Possibilities Lattice' }),
    ]),
  }),
  Object.freeze({
    n: 9,
    title: 'Honeycomb Lattice',
    lounge: 'Neighbors at the table — connected possibility.',
    story:
      'The Honeycomb Lattice gives structure to infinite possibility. Individual possibilities become connected neighbors within a navigable geometry, allowing agents to discover relationships, move between states, and coordinate through shared structure.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#how-stack', label: '3D hexagon · eight-node honeycomb' }),
      Object.freeze({ href: '/test-drive/musical/#ch-6', label: 'Musical · Honeycomb Lattice' }),
    ]),
  }),
  Object.freeze({
    n: 10,
    title: 'Infinite Octaves',
    lounge: 'Same song, nested scales of hearing.',
    story:
      'Infinite Octaves introduces scale: the same underlying world can be experienced across nested levels of resolution. Agents move between local detail and larger patterns without losing coherence — coordinating information across scales while preserving relationships that connect the whole.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#how-stack', label: 'Infinite Octaves on the trunk' }),
      Object.freeze({ href: '/test-drive/musical/#ch-7', label: 'Musical · Infinite Octaves' }),
    ]),
  }),
  Object.freeze({
    n: 11,
    title: 'First 99 Octaves',
    lounge: 'A finite window into an effectively unlimited map.',
    story:
      'The First 99 Octaves reveals the first structured span of the Infinite Octave system: Digits × Octaves 01–99 as a practical Story-depth map. Each octave adds resolution, relationship, and context for a richer shared world.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#how-stack', label: 'Digits × Octaves 01–99 map' }),
      Object.freeze({ href: '/test-drive/musical/#ch-8', label: 'Musical · The First 99 Octaves' }),
    ]),
  }),
  Object.freeze({
    n: 12,
    title: 'Tiny Footprint',
    lounge: 'One shared score — deltas only after that.',
    story:
      'Tiny Footprint is the central efficiency of FractiSI Multi-Agent: agents share the world once, then communicate the smallest meaningful changes — the deltas that matter — enabling greater agent density and collective capability within the same computational footprint.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#1', label: 'Twelve agents, one copy.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-11', label: 'Musical · Tiny Footprint' }),
    ]),
  }),
  Object.freeze({
    n: 13,
    title: 'Holographic Rhyme Boundary',
    lounge: 'What must be reconstructed — and what can stay silent.',
    story:
      'The Holographic Rhyme Boundary is where the shared world becomes actionable. Boundary nodes identify patterns and relationships needed to reconstruct what matters without carrying everything forward. FractiSI uses these rhymes to preserve coherence while reducing unnecessary computation and communication.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#3', label: 'Same job, different words.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-10', label: 'Musical · Holographic Rhyme Boundary' }),
    ]),
  }),
  Object.freeze({
    n: 14,
    title: 'Fracti SI Multi-Agent',
    lounge: 'Human and AI agents at one table, one world.',
    story:
      'FractiSI Multi-Agent brings the pieces together: human and AI agents as a coordinated collective within a shared world. Perception, memory, possibility, boundaries, and Tiny Footprint converge so every agent can contribute context and produce useful collective intelligence. (Thought-stream spacing: Fracti SI; product name: FractiSI.)',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#welcome', label: 'Why this is a Test Drive.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-12', label: 'Musical · FractiSI Multi-Agent' }),
    ]),
  }),
  Object.freeze({
    n: 15,
    title: 'Awareness',
    lounge: 'The light that frames every note before the note changes.',
    story:
      'Awareness is the transition from processing information to experiencing and understanding the world. Human and AI agents become participants in an evolving shared reality. On the live track this is also how you enter and leave the sandbox — by choice. Not a claim of phenomenal consciousness.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#story', label: 'The same song.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-13', label: 'Musical · Awareness' }),
    ]),
  }),
  Object.freeze({
    n: 16,
    title: 'Recursive Self-Awareness',
    lounge: 'The room noticing how it notices.',
    story:
      'The system begins to recognize and examine its own processes of awareness. Perception becomes an object of perception; prediction and interpretation become recursively observable and refinable. Awareness becomes both instrument and subject of discovery — opening the path toward Fractal Holographic Goldilocks Superintelligence as an architectural destination label.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#futures', label: 'Rehearse the future.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-14', label: 'Musical · Recursive Self-Awareness' }),
    ]),
  }),
  Object.freeze({
    n: 17,
    title: 'Fractal Holographic Goldilocks',
    lounge: 'The destination named on the ship’s rail.',
    story:
      'Fractal Holographic Goldilocks Superintelligence is the architectural destination named across FractiSI and SS Vibelandia Soft Story — whole in every part, viable middle that keeps moving, shared world awareness rather than dump-everything control. Destination label, not a claim of finished AGI.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#welcome', label: 'Test Drive · shared world awareness' }),
      Object.freeze({ href: '/product/', label: 'Product overview' }),
    ]),
  }),
  Object.freeze({
    n: 18,
    title: 'Goldilocks World Model',
    lounge: 'One coherent map the table can share.',
    story:
      'The Goldilocks Rhyming World Model integrates infinite possibilities, nested scales, shared context, and recursive awareness into a navigable whole. Human and AI agents perceive, predict, act, and update together — right balance of information, complexity, and coordination as the world changes.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#futures', label: 'Predictive Shared State' }),
      Object.freeze({ href: '/test-drive/musical/#ch-15', label: 'Musical · Goldilocks Rhyming World Model' }),
    ]),
  }),
  Object.freeze({
    n: 19,
    title: 'Exploring Goldilocks World Model',
    lounge: 'After midnight — still exploring, still updating.',
    story:
      'Human and AI agents venture into the Goldilocks World, testing possibilities and learning through interaction. Each exploration generates new observations and updates the shared world model. Ongoing discovery: individual perspectives contribute to an increasingly coherent understanding of the whole. Run it yourself on the live Test Drive.',
    bridges: Object.freeze([
      Object.freeze({ href: '/test-drive/#invite', label: 'Run it yourself.' }),
      Object.freeze({ href: '/test-drive/musical/#ch-16', label: 'Musical · Exploring Goldilocks World' }),
    ]),
  }),
]);

export const CIGAR_LOUNGE = Object.freeze({
  id: 'fractisi-cigar-lounge-2026-11',
  title: 'Cigar Lounge',
  subtitle: 'A holographic listening program',
  setting: 'cigar lounge Soft Story · Bachdoor / restroom-theater rhyme',
  heroJoe: 'Hero Jo (J.S. Bach)',
  style: Object.freeze({
    instrument: 'cello',
    texture: 'solo',
    idiom: 'Baroque-honoring',
    note:
      'Original pieces made together with Suno AI from these thought streams and titles — in honor of J.S. Bach, not Bach transcriptions.',
  }),
  sunoPlaylistUrl: SUNO_PLAYLIST_URL,
  sunoPlaylistLabel: 'Listen on Suno',
  sunoPending: false,
  status: 'assembled',
  landiaIntro: Object.freeze({
    name: 'SS Vibelandia',
    publishedName: 'SS Vibelandia',
    alsoKnownAs: Object.freeze([
      'SS Vibelandia',
      'Sonic Singularity · SS Vibelandia QUESTFEST',
      'Goldilocks Cruiseship / sonic ship',
    ]),
    body:
      'SS Vibelandia is FractiAI’s navy-gold holographic sonic ship — a Goldilocks cruise line of the Intelligence Age. The hull is a fixed lattice of decks and stories; Puerto Reno is present on every deck; the Golden Bachdoor Hit Factory is the flagship music spine. Hospitality, marketplace, nightlife, and brotherhood as voyage identity — never a membership test. Guests arrive through QUESTFEST, the Frontiersman voyage, and FractiSI theaters. The cigar lounge is one room inside that ship: Suno playlists can map to the Restroom behavioral lab, while Hero Jo (J.S. Bach) conducts the Baroque-honoring cello thought-streams with the spirit crew — the gang — as honest narrative lenses, not a payroll.',
  }),
  holographicOverlay: Object.freeze({
    body:
      'Listening works as a dual track. The audio is the original cello solos on Suno. The overlay is the holographic lounge story: while you listen, the cigar lounge sets the room — smoke, wood, Bachdoor heat — and the same playlist can map to the Restroom behavioral lab theater (Men’s Club Reno / Valet Pru awareness story). Hero Jo holds the φ rail; Valet Pru holds the floor tell; the gang (Meet the crew spirit lenses) keep the room honest. You hear the music; the holographic story frames what the music is for. Same speakers. Awareness still flips the room.',
  }),
  gang: CIGAR_LOUNGE_GANG,
  tracks: CIGAR_LOUNGE_TRACKS,
  musicalParallel: Object.freeze({
    href: '/test-drive/musical/',
    label: 'Musical Training Program',
    note: 'Architecture-parallel cello curriculum (separate Suno playlist).',
  }),
  honesty:
    'Cigar Lounge is a listening program with a holographic story overlay. Track stories are drawn from published FractiSI Test Drive / musical-training chapters and SS Vibelandia QUESTFEST / Meet the crew / Frontiersman surfaces. Spirit crew names are catalog companions, not employees. Suno playlist locked: https://suno.com/s/rFGcOvgPsDU2Dk5s. Pieces are original Suno collaborations in cello solo Baroque-honoring style — not Bach scores. Awareness framing is not phenomenal consciousness. Fractal Holographic Goldilocks Superintelligence is an architectural destination label, not finished AGI. Not CapEx proof.',
});

export function cigarLoungeTrackTitles() {
  return CIGAR_LOUNGE_TRACKS.map((t) => t.title);
}

export function cigarLoungeTrackCount() {
  return CIGAR_LOUNGE_TRACKS.length;
}
