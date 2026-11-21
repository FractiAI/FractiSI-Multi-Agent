/**
 * Soft Story context engine — "What am I doing now?" → which skin image.
 *
 * Priority:
 *  1. Person / relationship skins (email Daniel → Daniel's image)
 *  2. Activity rules (mail, code, chat, …)
 *  3. Mission cycling deck (default Soft Story set)
 */

export const PEOPLE_STORAGE_KEY = 'hl-soft-story-people-v1';
export const MISSION_DECK_KEY = 'hl-soft-story-mission-deck-v1';

/** Default Soft Story mission / Enrichment deck — cycles when no person hit. */
export const DEFAULT_MISSION_DECK = [
  'superhero',
  'vibelandia',
  'frontier-work',
  'duck-hunting',
  'big-game-fishing',
  'wiring-wet-lab',
  'whatsapp-root-lab',
  'bat-cave',
  'clark-kent',
];

/**
 * @typedef {{ id: string, label: string, aliases?: string[], emails?: string[], match?: string, image: string, blurb?: string }} PersonSkin
 */

/**
 * Normalize haystack from active window.
 * @param {{ app?: string, title?: string }} win
 */
export function haystack(win) {
  return `${win?.app || ''} ${win?.title || ''}`.toLowerCase();
}

/**
 * True if this looks like the holographic skin browser itself.
 */
export function isSkinSelfWindow(hay) {
  return /holographic.?skin|enrichment menu|fractisi|auto.session/i.test(hay);
}

/**
 * Does the window text mention this person?
 * @param {PersonSkin} person
 * @param {string} hay
 */
export function personMatches(person, hay) {
  if (!person || !hay) return false;
  const tokens = [
    person.label,
    person.id,
    ...(person.aliases || []),
    ...(person.emails || []),
  ]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase().trim())
    .filter((t) => t.length >= 2);

  for (const t of tokens) {
    if (hay.includes(t)) return true;
    // email local-part
    if (t.includes('@')) {
      const local = t.split('@')[0];
      if (local && hay.includes(local)) return true;
    }
  }
  if (person.match) {
    try {
      if (new RegExp(person.match, 'i').test(hay)) return true;
    } catch {
      /* ignore bad regex */
    }
  }
  return false;
}

/**
 * Guess activity kind from window text (for plain-language "doing now").
 * @param {string} hay
 */
export function guessActivityKind(hay) {
  if (/mail|outlook|thunderbird|gmail|inbox|compose/i.test(hay)) return 'email';
  if (/slack|discord|whatsapp|messages|telegram|signal|chat/i.test(hay)) return 'chat';
  if (/cursor|visual studio code|vscode|windsurf|zed|code -/i.test(hay)) return 'code';
  if (/terminal|kitty|alacritty|iterm|powershell|warp|konsole/i.test(hay)) return 'terminal';
  if (/chrome|firefox|safari|edge|brave|chromium/i.test(hay)) return 'browser';
  if (/zoom|meet|teams|webex/i.test(hay)) return 'call';
  return 'work';
}

/**
 * Resolve what the Soft Story should show right now.
 *
 * @param {object} opts
 * @param {{ app?: string, title?: string }} opts.win
 * @param {PersonSkin[]} opts.people
 * @param {object[]} opts.activityMap
 * @param {string[]} opts.missionDeck
 * @param {number} opts.missionIndex
 * @param {Map|Record<string, number>} [opts.cycleBuckets]
 * @param {string} [opts.fallbackScene]
 */
export function resolveContext({
  win,
  people = [],
  activityMap = [],
  missionDeck = DEFAULT_MISSION_DECK,
  missionIndex = 0,
  cycleBuckets = new Map(),
  fallbackScene = 'superhero',
}) {
  const hay = haystack(win);
  const kind = guessActivityKind(hay);

  if (!hay.trim() || isSkinSelfWindow(hay)) {
    const deck = missionDeck.length ? missionDeck : [fallbackScene];
    const idx = missionIndex % deck.length;
    return {
      sceneId: deck[idx],
      source: 'mission-deck',
      doing: 'Holding Soft Story mission set (skin window or idle)',
      kind: 'idle',
      personId: null,
      matchedRule: null,
      cycleIndex: idx,
      priority: 'mission',
    };
  }

  // 1) Person skins — e.g. emailing Daniel → Daniel's image
  for (const person of people) {
    if (!personMatches(person, hay)) continue;
    const verb =
      kind === 'email' ? 'Emailing' : kind === 'chat' ? 'Talking with' : kind === 'call' ? 'On a call with' : 'With';
    return {
      sceneId: person.id,
      source: 'person',
      doing: `${verb} ${person.label}`,
      kind,
      personId: person.id,
      personLabel: person.label,
      image: person.image,
      matchedRule: null,
      cycleIndex: 0,
      priority: 'person',
    };
  }

  // 2) Activity rules
  for (const rule of activityMap) {
    let re;
    try {
      re = new RegExp(rule.match, 'i');
    } catch {
      continue;
    }
    if (!re.test(hay)) continue;

    const scenes = Array.isArray(rule.scenes) && rule.scenes.length ? rule.scenes : null;
    // Mail / generic without a person → lean on mission deck for Soft Story support
    if (rule.id === 'mail' || rule.id === 'default' || rule.id === 'browser-other') {
      const deck = missionDeck.length ? missionDeck : scenes || [fallbackScene];
      const get =
        cycleBuckets instanceof Map
          ? cycleBuckets.get(rule.id) || missionIndex
          : cycleBuckets[rule.id] || missionIndex;
      const idx = get % deck.length;
      return {
        sceneId: deck[idx],
        source: 'mission-deck',
        doing:
          rule.id === 'mail'
            ? 'In mail — Soft Story mission deck (add a person skin to pin someone)'
            : `Activity “${rule.label}” — Soft Story mission deck`,
        kind,
        personId: null,
        matchedRule: rule.id,
        cycleIndex: idx,
        priority: 'mission',
      };
    }

    let cycleIndex = 0;
    if (rule.mode === 'cycle' && scenes) {
      cycleIndex =
        (cycleBuckets instanceof Map ? cycleBuckets.get(rule.id) || 0 : cycleBuckets[rule.id] || 0) %
        scenes.length;
    }
    const sceneId = scenes ? scenes[cycleIndex] || scenes[0] : fallbackScene;
    return {
      sceneId,
      source: 'activity',
      doing: `In ${rule.label}`,
      kind,
      personId: null,
      matchedRule: rule.id,
      cycleIndex,
      priority: 'activity',
    };
  }

  // 3) Mission deck fallback
  const deck = missionDeck.length ? missionDeck : [fallbackScene];
  const idx = missionIndex % deck.length;
  return {
    sceneId: deck[idx],
    source: 'mission-deck',
    doing: 'Soft Story mission set',
    kind,
    personId: null,
    matchedRule: null,
    cycleIndex: idx,
    priority: 'mission',
  };
}

export function loadPeopleFromLocalStorage() {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => p && p.id && p.image) : [];
  } catch {
    return [];
  }
}

export function savePeopleToLocalStorage(people) {
  localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people || []));
}

export function loadMissionDeckFromLocalStorage() {
  try {
    const raw = localStorage.getItem(MISSION_DECK_KEY);
    if (!raw) return [...DEFAULT_MISSION_DECK];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_MISSION_DECK];
  } catch {
    return [...DEFAULT_MISSION_DECK];
  }
}

export function saveMissionDeckToLocalStorage(deck) {
  localStorage.setItem(MISSION_DECK_KEY, JSON.stringify(deck || DEFAULT_MISSION_DECK));
}
