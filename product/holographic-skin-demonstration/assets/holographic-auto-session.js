/**
 * Holographic Skin · Auto Session client
 * Helper answers "what am I doing now?" → person skins or Soft Story mission deck.
 */
import {
  SCENES,
  SIRENS,
  TOP_LEVEL,
  DEFAULT_ACTIVITY_MAP,
  CHANNEL,
  STORAGE_KEY,
  DEFAULT_COMPANION_PORT,
} from './holographic-scene-catalog.js';
import {
  DEFAULT_MISSION_DECK,
  loadPeopleFromLocalStorage,
  savePeopleToLocalStorage,
  loadMissionDeckFromLocalStorage,
  saveMissionDeckToLocalStorage,
  resolveContext,
} from './holographic-context-engine.js';

const PROTOCOL = 'fractisi-skin://start';
const params = new URLSearchParams(location.search);
const companionPort = Number(params.get('companion') || DEFAULT_COMPANION_PORT);
const companionBase = `http://127.0.0.1:${companionPort}`;

const els = {
  status: document.getElementById('hl-as-status'),
  companion: document.getElementById('hl-as-companion'),
  activity: document.getElementById('hl-as-activity'),
  scene: document.getElementById('hl-as-scene'),
  source: document.getElementById('hl-as-source'),
  doing: document.getElementById('hl-as-doing'),
  split: document.getElementById('hl-as-split'),
  mapList: document.getElementById('hl-as-map'),
  otherApp: document.getElementById('hl-as-other'),
  cycleSec: document.getElementById('hl-as-cycle-sec'),
  btnStart: document.getElementById('hl-as-start'),
  btnOpenSkin: document.getElementById('hl-as-open-skin'),
  btnSplit: document.getElementById('hl-as-split-btn'),
  btnSave: document.getElementById('hl-as-save'),
  preview: document.getElementById('hl-as-preview'),
  previewImg: document.getElementById('hl-as-preview-img'),
  previewLabel: document.getElementById('hl-as-preview-label'),
  picker: document.getElementById('hl-as-picker'),
  modeManual: document.getElementById('hl-as-mode-manual'),
  modeAuto: document.getElementById('hl-as-mode-auto'),
  modeHint: document.getElementById('hl-as-mode-hint'),
  modeLabel: document.getElementById('hl-as-mode-label'),
  manualBlock: document.getElementById('hl-as-manual-block'),
  autoBlock: document.getElementById('hl-as-auto-block'),
  rulesBlock: document.getElementById('hl-as-rules-block'),
  handheld: document.getElementById('hl-as-handheld'),
  desktop: document.getElementById('hl-as-desktop'),
  peopleList: document.getElementById('hl-as-people'),
  personForm: document.getElementById('hl-as-person-form'),
  personName: document.getElementById('hl-as-person-name'),
  personAliases: document.getElementById('hl-as-person-aliases'),
  personFile: document.getElementById('hl-as-person-file'),
  deckList: document.getElementById('hl-as-deck-list'),
  deckInput: document.getElementById('hl-as-deck-input'),
  deckSave: document.getElementById('hl-as-deck-save'),
};

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;
const handheld = isHandheldDevice();
let config = loadConfig();
let people = loadPeopleFromLocalStorage();
let missionDeck = loadMissionDeckFromLocalStorage();
let lastSceneId = config.defaultScene || 'superhero';
let companionOnline = false;
let pollTimer = null;
let pictureMode = config.pictureMode || 'manual';
let skinWindow = null;
let launchingHelper = false;
let localMissionIndex = 0;

function isHandheldDevice() {
  const ua = navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua)) {
    return true;
  }
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    if (coarse && noHover && narrow) return true;
    if (navigator.maxTouchPoints > 1 && narrow && noHover) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activityMap: parsed.activityMap?.length ? parsed.activityMap : DEFAULT_ACTIVITY_MAP,
        otherApp: parsed.otherApp || 'Cursor',
        defaultScene: parsed.defaultScene || 'superhero',
        cycleSeconds: Number(parsed.cycleSeconds) || 45,
        pictureMode: parsed.pictureMode === 'autodetect' ? 'autodetect' : 'manual',
      };
    }
  } catch {
    /* ignore */
  }
  return {
    activityMap: DEFAULT_ACTIVITY_MAP,
    otherApp: 'Cursor',
    defaultScene: 'superhero',
    cycleSeconds: 45,
    pictureMode: 'manual',
  };
}

function saveConfig() {
  config.otherApp = (els.otherApp?.value || 'Cursor').trim() || 'Cursor';
  config.cycleSeconds = Math.max(8, Number(els.cycleSec?.value) || 45);
  config.pictureMode = pictureMode;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  pushConfigToCompanion();
  setText(els.status, 'Saved on this device' + (companionOnline ? ' and pushed to helper.' : '.'));
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'person';
}

function sceneRecord(id, imageOverride) {
  if (imageOverride) {
    const person = people.find((p) => p.id === id);
    if (person) return { id, label: person.label, blurb: person.blurb || 'Person Soft Story', image: imageOverride };
    if (SCENES[id]) return { id, ...SCENES[id], image: imageOverride };
  }
  const person = people.find((p) => p.id === id);
  if (person) return { id: person.id, label: person.label, blurb: person.blurb || 'Person Soft Story', image: person.image };
  if (SCENES[id]) return { id, ...SCENES[id] };
  const s = SIRENS.find((x) => x.id === id);
  if (s) return { id: s.id, label: s.label, blurb: 'Mermaid Soft Story', image: s.image };
  return null;
}

function livingHref(sceneId, opts = {}) {
  const u = new URL('/product/holographic-skin-demonstration/living/', location.origin);
  u.searchParams.set('scene', sceneId || lastSceneId);
  u.searchParams.set('stage', '1');
  if (opts.auto || pictureMode === 'autodetect') {
    u.searchParams.set('auto', '1');
    u.searchParams.set('companion', String(companionPort));
  }
  return u.href;
}

function openOrFocusSkin(sceneId) {
  const href = livingHref(sceneId, { auto: pictureMode === 'autodetect' });
  try {
    if (skinWindow && !skinWindow.closed) {
      skinWindow.location.href = href;
      skinWindow.focus();
      return;
    }
  } catch {
    /* ignore */
  }
  skinWindow = window.open(href, 'hl-skin-half');
}

function broadcastScene(sceneId, meta = {}) {
  const rec = sceneRecord(sceneId, meta.image || null);
  if (!rec) return;
  lastSceneId = sceneId;
  config.defaultScene = sceneId;
  const payload = {
    type: 'select-scene',
    sceneId,
    label: rec.label,
    image: rec.image,
    blurb: rec.blurb,
    ts: Date.now(),
    ...meta,
  };
  try {
    localStorage.setItem('hl-auto-session-last', JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  bc?.postMessage(payload);
  updatePreview(rec);
  setText(els.scene, rec.label);
  highlightPicker(sceneId);
}

function updatePreview(rec) {
  if (els.previewImg && rec?.image) {
    els.previewImg.src = rec.image;
    els.previewImg.alt = rec.label || '';
  }
  setText(els.previewLabel, rec?.label || '');
  if (els.preview) els.preview.hidden = false;
}

function applyHandheldGate() {
  document.body.classList.add('hl-as--handheld');
  if (els.handheld) els.handheld.hidden = false;
  if (els.desktop) els.desktop.hidden = true;
  setText(els.modeLabel, 'Unavailable on handheld');
  setText(els.companion, 'Desktop helper not available on phones/tablets yet');
  setText(els.doing, 'Open Auto Session on a computer');
}

async function setPictureMode(mode, { autoStart = true } = {}) {
  if (handheld) {
    applyHandheldGate();
    return;
  }
  pictureMode = mode === 'autodetect' ? 'autodetect' : 'manual';
  config.pictureMode = pictureMode;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }

  const isAuto = pictureMode === 'autodetect';
  if (els.modeManual) els.modeManual.checked = !isAuto;
  if (els.modeAuto) els.modeAuto.checked = isAuto;
  if (els.manualBlock) els.manualBlock.hidden = isAuto;
  if (els.autoBlock) els.autoBlock.hidden = !isAuto;
  // Soft Story app theaters stay visible in both modes so the map is always editable.
  setText(els.modeLabel, isAuto ? 'Autodetect' : 'Manual');
  setText(
    els.modeHint,
    isAuto
      ? 'Autodetect is on. Helper maps what you are doing now → Soft Story skins (people first, then mission deck).'
      : 'Manual is on. Tap a picture below to put it on the skin half.',
  );

  if (!isAuto) {
    clearInterval(pollTimer);
    pollTimer = null;
    setText(els.source, 'Manual pick');
    setText(els.doing, 'You are choosing pictures by hand');
    setText(els.activity, '—');
    return;
  }

  if (autoStart) await ensureHelperAndSession();
  else startPolling();
}

function launchHelperViaProtocol() {
  const url = `${PROTOCOL}?port=${companionPort}&ts=${Date.now()}`;
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 2500);
  } catch {
    /* ignore */
  }
  try {
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    /* ignore */
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureHelperAndSession() {
  if (handheld) return false;
  setText(els.status, 'Looking for helper…');
  if (await pingCompanion()) {
    setText(els.status, 'Helper already running. Mapping activity → skins.');
    await finishAutodetectStart();
    return true;
  }

  launchingHelper = true;
  setText(els.companion, 'Starting helper automatically…');
  setText(els.status, 'Asking this computer to start the FractiSI Skin helper…');
  launchHelperViaProtocol();

  for (let i = 0; i < 16; i++) {
    await sleep(500);
    if (await pingCompanion()) {
      launchingHelper = false;
      setText(els.status, 'Helper started. Mapping activity → skins.');
      await finishAutodetectStart();
      return true;
    }
  }

  launchingHelper = false;
  setText(els.companion, 'Helper did not start — install once, then select Autodetect again');
  setText(
    els.status,
    'Could not auto-start. Run npm run skin:auto-session:install once (or npm run skin:auto-session now).',
  );
  startPolling();
  return false;
}

async function finishAutodetectStart() {
  await pushConfigToCompanion();
  try {
    await fetch(`${companionBase}/open-skin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sceneId: config.defaultScene || missionDeck[0] || 'superhero' }),
    });
    await fetch(`${companionBase}/split`, { method: 'POST' });
  } catch {
    openOrFocusSkin(config.defaultScene || missionDeck[0] || 'superhero');
  }
  broadcastScene(config.defaultScene || missionDeck[0] || 'superhero', { source: 'start' });
  startPolling();
}

function renderPicker() {
  if (!els.picker) return;
  els.picker.innerHTML = '';
  people.forEach((p) => appendPick(p.id, p.label, p.image, 'Person skin'));
  TOP_LEVEL.forEach((id) => {
    if (id === 'sirens') {
      SIRENS.forEach((s) => appendPick(s.id, s.label, s.image, 'Siren'));
      return;
    }
    const scene = SCENES[id];
    if (!scene) return;
    appendPick(id, scene.label, scene.image, scene.blurb);
  });
  highlightPicker(lastSceneId);
}

function appendPick(id, label, image, blurb) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hl-as__pick';
  btn.setAttribute('role', 'listitem');
  btn.dataset.sceneId = id;
  btn.style.setProperty('--hl-pick', `url("${image}")`);
  btn.innerHTML =
    `<span class="hl-as__pick-label">${escapeHtml(label)}</span>` +
    `<small>${escapeHtml(blurb || '')}</small>`;
  btn.addEventListener('click', () => {
    if (handheld) return;
    setPictureMode('manual', { autoStart: false });
    broadcastScene(id, { source: 'manual', image });
    setText(els.source, 'Manual pick');
    setText(els.doing, `You chose ${label}`);
    setText(els.status, `Showing ${label} on the skin half.`);
    openOrFocusSkin(id);
    if (companionOnline) {
      fetch(`${companionBase}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: id, label, image }),
      }).catch(() => {});
    }
  });
  els.picker.appendChild(btn);
}

function highlightPicker(sceneId) {
  if (!els.picker) return;
  els.picker.querySelectorAll('.hl-as__pick').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.sceneId === sceneId);
  });
}

function renderPeople() {
  if (!els.peopleList) return;
  els.peopleList.innerHTML = '';
  if (!people.length) {
    const li = document.createElement('li');
    li.className = 'hl-as__hint';
    li.textContent = 'No people skins yet. Add Daniel (or anyone) with the image you made for them.';
    els.peopleList.appendChild(li);
    return;
  }
  people.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'hl-as__person';
    li.innerHTML =
      `<img src="${escapeHtml(p.image)}" alt="" />` +
      `<div><strong>${escapeHtml(p.label)}</strong>` +
      `<span class="hl-as__meta">matches: ${escapeHtml([p.label, ...(p.aliases || []), ...(p.emails || [])].join(', '))}</span></div>`;
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Remove';
    del.addEventListener('click', () => {
      people = people.filter((x) => x.id !== p.id);
      savePeopleToLocalStorage(people);
      renderPeople();
      renderPicker();
      pushConfigToCompanion();
    });
    li.appendChild(del);
    els.peopleList.appendChild(li);
  });
}

function renderDeck() {
  const labels = missionDeck.map((id) => SCENES[id]?.label || id).join(' · ');
  setText(els.deckList, labels || '—');
  if (els.deckInput) els.deckInput.value = missionDeck.join(', ');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function onPersonSubmit(ev) {
  ev.preventDefault();
  const name = (els.personName?.value || '').trim();
  if (!name) return;
  const file = els.personFile?.files?.[0];
  if (!file) {
    setText(els.status, 'Choose an image file for this person skin.');
    return;
  }
  const image = await readFileAsDataUrl(file);
  const aliasesRaw = (els.personAliases?.value || '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const emails = aliasesRaw.filter((a) => a.includes('@'));
  const aliases = aliasesRaw.filter((a) => !a.includes('@'));
  const id = slugify(name);
  const person = {
    id,
    label: name,
    aliases,
    emails,
    image,
    blurb: `Soft Story person · ${name}`,
  };
  people = [person, ...people.filter((p) => p.id !== id)];
  savePeopleToLocalStorage(people);
  renderPeople();
  renderPicker();
  await pushConfigToCompanion();
  if (els.personForm) els.personForm.reset();
  setText(els.status, `Saved ${name}. When their name shows in a window title, Autodetect will show their image.`);
}

async function pingCompanion() {
  try {
    const r = await fetch(`${companionBase}/health`, { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    companionOnline = true;
    setText(els.companion, `Helper online · port ${companionPort}`);
    return true;
  } catch {
    companionOnline = false;
    if (!handheld) {
      setText(
        els.companion,
        pictureMode === 'autodetect'
          ? launchingHelper
            ? 'Starting helper…'
            : 'Helper offline — Autodetect will try auto-start'
          : 'Helper optional in Manual mode',
      );
    }
    return false;
  }
}

async function pushConfigToCompanion() {
  if (!companionOnline) return;
  try {
    await fetch(`${companionBase}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityMap: config.activityMap,
        people,
        missionDeck,
      }),
    });
  } catch {
    /* ignore */
  }
}

function sourceLabel(source) {
  if (source === 'person') return 'Person skin match';
  if (source === 'app-theater') return 'Soft Story app theater';
  if (source === 'mission-deck') return 'Soft Story mission deck';
  if (source === 'menu') return 'Menu selection (pinned briefly)';
  if (source === 'activity') return 'App activity rule';
  if (source === 'manual') return 'Manual pick';
  if (source === 'ignore-skin-window') return 'Skin window (holding last context)';
  if (source === 'boot' || source === 'start') return 'Session start';
  return source || '—';
}

async function pollState() {
  if (handheld || pictureMode !== 'autodetect') return;
  if (!(await pingCompanion())) {
    // Offline fallback: still cycle mission deck locally so the story keeps moving
    localMissionIndex = (localMissionIndex + 1) % Math.max(missionDeck.length, 1);
    const resolved = resolveContext({
      win: { app: 'local', title: 'Soft Story offline cycle' },
      people,
      activityMap: config.activityMap,
      missionDeck,
      missionIndex: localMissionIndex,
    });
    setText(els.doing, 'Helper offline — cycling Soft Story mission deck locally');
    setText(els.source, sourceLabel('mission-deck'));
    if (resolved.sceneId !== lastSceneId) {
      broadcastScene(resolved.sceneId, { source: 'mission-deck' });
      openOrFocusSkin(resolved.sceneId);
    }
    return;
  }
  try {
    const r = await fetch(`${companionBase}/state`, { cache: 'no-store' });
    if (!r.ok) return;
    const state = await r.json();
    setText(
      els.activity,
      state.activeApp || state.title
        ? `${state.activeApp || 'app'}${state.title ? ' — ' + state.title : ''}`
        : 'No active window read yet',
    );
    setText(els.doing, state.doing || '—');
    setText(els.source, sourceLabel(state.source));
    if (state.split?.attempted) {
      setText(els.split, state.split.ok ? `Split ok — ${state.split.detail}` : `Split note — ${state.split.detail}`);
    }
    if (state.sceneId && (state.sceneId !== lastSceneId || state.image)) {
      broadcastScene(state.sceneId, {
        source: state.source || 'companion',
        image: state.image || undefined,
      });
      openOrFocusSkin(state.sceneId);
    } else if (state.sceneId) {
      const rec = sceneRecord(state.sceneId, state.image || null);
      if (rec) updatePreview(rec);
      setText(els.scene, rec?.label || state.sceneId);
    }
  } catch {
    companionOnline = false;
  }
}

function renderMap() {
  if (!els.mapList) return;
  els.mapList.innerHTML = '';
  config.activityMap.forEach((rule, idx) => {
    const li = document.createElement('li');
    li.className = 'hl-as__rule';
    const scenes = (rule.scenes || []).join(', ');
    li.innerHTML =
      `<strong>${escapeHtml(rule.label || rule.id)}</strong>` +
      (rule.story ? `<span class="hl-as__meta">${escapeHtml(rule.story)}</span>` : '') +
      `<span class="hl-as__meta">window match: <code>${escapeHtml(rule.match)}</code></span>` +
      `<span class="hl-as__meta">skin: ${escapeHtml(scenes)} · ${escapeHtml(rule.mode || 'pin')}</span>`;
    const row = document.createElement('div');
    row.className = 'hl-as__rule-actions';
    const up = document.createElement('button');
    up.type = 'button';
    up.textContent = '↑';
    up.disabled = idx === 0;
    up.addEventListener('click', () => moveRule(idx, -1));
    const down = document.createElement('button');
    down.type = 'button';
    down.textContent = '↓';
    down.disabled = idx === config.activityMap.length - 1;
    down.addEventListener('click', () => moveRule(idx, 1));
    const cycle = document.createElement('button');
    cycle.type = 'button';
    cycle.textContent = rule.mode === 'cycle' ? 'Mode: cycle' : 'Mode: pin';
    cycle.addEventListener('click', () => {
      rule.mode = rule.mode === 'cycle' ? 'pin' : 'cycle';
      renderMap();
    });
    row.append(up, down, cycle);
    li.appendChild(row);
    els.mapList.appendChild(li);
  });
}

function moveRule(idx, delta) {
  const j = idx + delta;
  if (j < 0 || j >= config.activityMap.length) return;
  const tmp = config.activityMap[idx];
  config.activityMap[idx] = config.activityMap[j];
  config.activityMap[j] = tmp;
  renderMap();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function startSession() {
  if (handheld) {
    applyHandheldGate();
    return;
  }
  await setPictureMode('autodetect', { autoStart: true });
}

function startPolling() {
  clearInterval(pollTimer);
  if (handheld || pictureMode !== 'autodetect') return;
  pollTimer = setInterval(pollState, Math.max(8, config.cycleSeconds) * 1000 > 2000 ? 1600 : 1600);
  pollState();
}

function wireUi() {
  if (handheld) {
    applyHandheldGate();
    return;
  }

  if (els.otherApp) els.otherApp.value = config.otherApp;
  if (els.cycleSec) els.cycleSec.value = String(config.cycleSeconds);
  els.modeManual?.addEventListener('change', () => {
    if (els.modeManual.checked) setPictureMode('manual', { autoStart: false });
  });
  els.modeAuto?.addEventListener('change', () => {
    if (els.modeAuto.checked) setPictureMode('autodetect', { autoStart: true });
  });
  els.btnStart?.addEventListener('click', startSession);
  els.btnOpenSkin?.addEventListener('click', () => openOrFocusSkin(lastSceneId));
  els.btnSplit?.addEventListener('click', async () => {
    if (!(await pingCompanion())) {
      setText(els.split, 'Helper offline — snap windows yourself, or select Autodetect.');
      return;
    }
    try {
      const r = await fetch(`${companionBase}/split`, { method: 'POST' });
      const split = await r.json();
      setText(els.split, split.detail || JSON.stringify(split));
    } catch (e) {
      setText(els.split, String(e.message || e));
    }
  });
  els.btnSave?.addEventListener('click', saveConfig);
  els.personForm?.addEventListener('submit', onPersonSubmit);
  els.deckSave?.addEventListener('click', () => {
    const raw = (els.deckInput?.value || '')
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    missionDeck = raw.length ? raw : [...DEFAULT_MISSION_DECK];
    saveMissionDeckToLocalStorage(missionDeck);
    renderDeck();
    pushConfigToCompanion();
    setText(els.status, 'Mission deck saved.');
  });
  bc?.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || msg.type !== 'menu-selection') return;
    setText(els.source, 'Menu selection');
    setText(els.doing, `Menu: ${msg.label || msg.sceneId}`);
    if (msg.sceneId) broadcastScene(msg.sceneId, { source: 'menu', image: msg.image });
    if (companionOnline) {
      fetch(`${companionBase}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: msg.sceneId, label: msg.label, image: msg.image }),
      }).catch(() => {});
    }
  });
  renderPeople();
  renderDeck();
  renderPicker();
  renderMap();
  const boot = sceneRecord(config.defaultScene || missionDeck[0] || 'superhero');
  if (boot) updatePreview(boot);

  const wantAuto =
    params.get('mode') === 'autodetect' ||
    params.get('started') === '1' ||
    config.pictureMode === 'autodetect';
  setPictureMode(wantAuto ? 'autodetect' : 'manual', { autoStart: wantAuto });
  if (!wantAuto) pingCompanion();
}

wireUi();
