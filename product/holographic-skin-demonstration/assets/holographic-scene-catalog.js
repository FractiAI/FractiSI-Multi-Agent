/**
 * Shared Enrichment Menu scene catalog for Living + Auto Session.
 * Soft Story demo media only — not CapEx proof.
 */
export const MEDIA = '/product/holographic-skin-demonstration/media/';

export const SCENES = {
  'clark-kent': { label: 'Clark Kent', blurb: 'Ordinary day', image: MEDIA + 'hl-clark-kent.jpg' },
  superhero: { label: 'Superhero', blurb: 'Captain of SS Vibelandia', image: MEDIA + 'hl-superhero.jpg' },
  vibelandia: { label: 'SS Vibelandia', blurb: 'Goldilocks cruiseship', image: MEDIA + 'hl-vibelandia.jpg?v=no-hat' },
  'bat-cave': { label: 'Bat cave', blurb: 'Work-cave', image: MEDIA + 'hl-bat-cave.jpg?v=no-bats' },
  'frontier-work': { label: 'Frontier work', blurb: 'Labor at the edge', image: MEDIA + 'hl-frontier-work.jpg' },
  'duck-hunting': { label: 'Duck hunting', blurb: 'Hunt for deliveries', image: MEDIA + 'hl-duck-hunting.jpg' },
  'big-game-fishing': { label: 'Big game fishing', blurb: 'Tropical marlin · hunt for a sponsor', image: MEDIA + 'hl-big-game-fishing-marlin.jpg?v=fish-cap' },
  'bottom-fishing': { label: 'Bottom fishing', blurb: 'Lines in deep water', image: MEDIA + 'hl-bottom-fishing.jpg?v=fish-cap' },
  'whatsapp-root-lab': {
    label: 'Root Lab',
    blurb: 'Root talk on the channel',
    image: MEDIA + 'hl-whatsapp-root-lab.jpg',
  },
  'wiring-wet-lab': { label: 'Wiring lab', blurb: 'Wires between people', image: MEDIA + 'hl-wiring-wet-lab.jpg' },
  'el-cortez-lab': { label: 'El Cortez Lab', blurb: 'Compute in town', image: MEDIA + 'hl-el-cortez-lab.jpg' },
  'mens-restroom-theater': {
    label: 'Restroom theater',
    blurb: 'Behavior theater',
    image: MEDIA + 'hl-mens-restroom-theater.jpg',
  },
  'eating-drinking': { label: 'Table', blurb: 'Food and drink', image: MEDIA + 'hl-eating-drinking.jpg' },
  resting: { label: 'Resting', blurb: 'Quiet between hunts', image: MEDIA + 'hl-resting.jpg' },
  sleeping: { label: 'Sleeping', blurb: 'Night rest', image: MEDIA + 'hl-sleeping.jpg' },
  bathroom: { label: 'Bathroom', blurb: 'Wash and water', image: MEDIA + 'hl-bathroom.jpg' },
  errands: { label: 'Errands', blurb: 'Town errands', image: MEDIA + 'hl-errands.jpg' },
};

export const SIRENS = [
  { id: 'dorila', label: 'Dorila', image: MEDIA + 'hl-siren-dorila.jpg' },
  { id: 'valeria', label: 'Valeria', image: MEDIA + 'hl-siren-valeria.jpg' },
  { id: 'viviana', label: 'Viviana', image: MEDIA + 'hl-siren-viviana.jpg' },
  { id: 'yeris', label: 'Yeris', image: MEDIA + 'hl-siren-yeris.jpg' },
  { id: 'erika', label: 'Erika', image: MEDIA + 'hl-siren-erika.jpg' },
  { id: 'winni', label: 'Winni', image: MEDIA + 'hl-siren-winni.jpg' },
  { id: 'fanfan', label: 'Fanfan', image: MEDIA + 'hl-siren-fanfan.jpg' },
  { id: 'monica', label: 'Monica', image: MEDIA + 'hl-siren-monica.jpg' },
  { id: 'sarah', label: 'Sarah', image: MEDIA + 'hl-siren-sarah.jpg' },
  { id: 'yaqui', label: 'Yaqui', image: MEDIA + 'hl-siren-yaqui.jpg' },
];

export const TOP_LEVEL = [
  'clark-kent',
  'superhero',
  'vibelandia',
  'bat-cave',
  'frontier-work',
  'duck-hunting',
  'big-game-fishing',
  'bottom-fishing',
  'whatsapp-root-lab',
  'wiring-wet-lab',
  'el-cortez-lab',
  'mens-restroom-theater',
  'sirens',
  'eating-drinking',
  'resting',
  'sleeping',
  'bathroom',
  'errands',
];

/**
 * Soft Story app theaters — real apps map to Enrichment scenes.
 * Order matters (first match wins after people skins).
 * Edit on Auto Session; these are the seeded Soft Story defaults.
 */
export const DEFAULT_ACTIVITY_MAP = [
  {
    id: 'whatsapp-root-lab',
    label: 'WhatsApp → Root behavior lab',
    match: 'whatsapp',
    scenes: ['whatsapp-root-lab'],
    mode: 'pin',
    story: 'Root Lab — root talk / root behavior on the channel',
  },
  {
    id: 'uber-eats-duck-hunt',
    label: 'Uber Eats → Duck hunting',
    match: 'uber eats|ubereats|uber\\s*eats|uber -|door.?dash|grubhub|postmates',
    scenes: ['duck-hunting'],
    mode: 'pin',
    story: 'Duck hunting — hunt for deliveries',
  },
  {
    id: 'suno-restroom-theater',
    label: 'Suno / cigar lounge → Restroom behavioral lab',
    match: 'suno|cigar lounge|restroom theater',
    scenes: ['mens-restroom-theater'],
    mode: 'pin',
    story: 'Restroom behavioral lab — Soft Story behavior theater',
  },
  {
    id: 'cursor-frontier-work',
    label: 'Cursor AI → Frontier work',
    match: 'cursor',
    scenes: ['frontier-work'],
    mode: 'pin',
    story: 'Frontier work — Cursor AI is frontier work at the desk',
  },
  {
    id: 'bat-cave-workstation',
    label: 'Other workstation → Bat cave',
    match: 'visual studio code|code -|vscode|windsurf|zed|jetbrains|sublime|workstation|bat.?cave',
    scenes: ['bat-cave'],
    mode: 'pin',
    story: 'Bat cave — the work-cave at the desk',
  },
  {
    id: 'sponsor-hunt',
    label: 'Sponsor hunt apps → Big game fishing (tropical marlin)',
    match: 'linkedin|crunchbase|pitch|investor|sponsor',
    scenes: ['big-game-fishing'],
    mode: 'pin',
    story: 'Tropical marlin fishing — hunt for a sponsor',
  },
  {
    id: 'wiring-chat',
    label: 'Other chat → Wiring lab',
    match: 'slack|discord|telegram|signal|messages|imessage',
    scenes: ['wiring-wet-lab'],
    mode: 'pin',
    story: 'Wiring lab — wires between people',
  },
  {
    id: 'compute-lab',
    label: 'Terminal / compute → El Cortez Lab',
    match: 'terminal|kitty|alacritty|iterm|powershell|warp|gnome-terminal|konsole|docker',
    scenes: ['el-cortez-lab', 'frontier-work'],
    mode: 'cycle',
    story: 'El Cortez Lab — compute in town',
  },
  {
    id: 'mail',
    label: 'Mail → Errands (or person skin if named)',
    match: 'mail|outlook|thunderbird|gmail|inbox',
    scenes: ['errands'],
    mode: 'pin',
    story: 'Errands / mail — person skins still win if a name is in the title',
  },
  {
    id: 'table',
    label: 'Food / drink apps → Table',
    match: 'opentable|resy|yelp|recipe|cookbook',
    scenes: ['eating-drinking'],
    mode: 'pin',
    story: 'Table — food and drink',
  },
  {
    id: 'browser-other',
    label: 'Other browser → Clark Kent',
    match: 'chrome|firefox|safari|edge|brave|chromium',
    scenes: ['clark-kent'],
    mode: 'pin',
    story: 'Clark Kent — ordinary day face in the browser',
  },
  {
    id: 'default',
    label: 'Default → Soft Story mission deck',
    match: '.*',
    scenes: ['superhero'],
    mode: 'pin',
    story: 'Falls through to the mission cycling deck',
  },
];

export const CHANNEL = 'hl-auto-session';
/** v2 — Soft Story app theaters (WhatsApp Root Lab, Uber Eats duck hunt, …). */
export const STORAGE_KEY = 'hl-auto-session-config-v2';
export const DEFAULT_COMPANION_PORT = 18765;
