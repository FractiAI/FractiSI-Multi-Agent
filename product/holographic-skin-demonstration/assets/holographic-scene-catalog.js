/**
 * Shared Enrichment Menu scene catalog for Living + Auto Session.
 * Soft Story demo media only — not CapEx proof.
 */
export const MEDIA = '/product/holographic-skin-demonstration/media/';

export const SCENES = {
  'clark-kent': { label: 'Clark Kent', blurb: 'Ordinary day', image: MEDIA + 'hl-clark-kent.jpg' },
  superhero: { label: 'Superhero', blurb: 'Captain of SS Vibelandia', image: MEDIA + 'hl-superhero.jpg' },
  vibelandia: { label: 'SS Vibelandia', blurb: 'Goldilocks cruiseship', image: MEDIA + 'hl-vibelandia.jpg' },
  'bat-cave': { label: 'Bat cave', blurb: 'Work-cave', image: MEDIA + 'hl-bat-cave.jpg' },
  'frontier-work': { label: 'Frontier work', blurb: 'Labor at the edge', image: MEDIA + 'hl-frontier-work.jpg' },
  'duck-hunting': { label: 'Duck hunting', blurb: 'Hunt for deliveries', image: MEDIA + 'hl-duck-hunting.jpg' },
  'big-game-fishing': { label: 'Big game fishing', blurb: 'Hunt for a sponsor', image: MEDIA + 'hl-big-game-fishing.jpg' },
  'bottom-fishing': { label: 'Bottom fishing', blurb: 'Lines in deep water', image: MEDIA + 'hl-bottom-fishing.jpg' },
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

/** Default activity → scene rules for Auto Session. */
export const DEFAULT_ACTIVITY_MAP = [
  {
    id: 'cursor-work',
    label: 'Cursor / code',
    match: 'cursor|visual studio code|code -|vscode|windsurf|zed',
    scenes: ['superhero', 'bat-cave', 'frontier-work'],
    mode: 'pin',
  },
  {
    id: 'chat',
    label: 'Chat / Root Lab',
    match: 'slack|discord|whatsapp|messages|telegram|signal',
    scenes: ['whatsapp-root-lab', 'wiring-wet-lab'],
    mode: 'cycle',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    match: 'terminal|kitty|alacritty|iterm|powershell|warp|gnome-terminal|konsole',
    scenes: ['frontier-work', 'el-cortez-lab'],
    mode: 'cycle',
  },
  {
    id: 'mail',
    label: 'Mail / errands',
    match: 'mail|outlook|thunderbird|gmail',
    scenes: ['errands'],
    mode: 'pin',
  },
  {
    id: 'browser-other',
    label: 'Other browser tabs',
    match: 'chrome|firefox|safari|edge|brave|chromium',
    scenes: ['clark-kent'],
    mode: 'pin',
    ignoreIfUrlIncludes: ['holographic-skin'],
  },
  {
    id: 'default',
    label: 'Default / idle',
    match: '.*',
    scenes: ['superhero'],
    mode: 'pin',
  },
];

export const CHANNEL = 'hl-auto-session';
export const STORAGE_KEY = 'hl-auto-session-config-v1';
export const DEFAULT_COMPANION_PORT = 18765;
