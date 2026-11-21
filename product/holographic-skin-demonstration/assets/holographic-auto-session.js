/**
 * Holographic Skin · Auto Session client
 * Manual picture pick OR Autodetect from workstation activity.
 * Other half = any app the user chooses (not IDE-only).
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

const params = new URLSearchParams(location.search);
const companionPort = Number(params.get('companion') || DEFAULT_COMPANION_PORT);
const companionBase = `http://127.0.0.1:${companionPort}`;

const els = {
  status: document.getElementById('hl-as-status'),
  companion: document.getElementById('hl-as-companion'),
  activity: document.getElementById('hl-as-activity'),
  scene: document.getElementById('hl-as-scene'),
  source: document.getElementById('hl-as-source'),
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
};

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;
let config = loadConfig();
let lastSceneId = config.defaultScene || 'superhero';
let companionOnline = false;
let pollTimer = null;
let pictureMode = config.pictureMode || 'manual'; // 'manual' | 'autodetect'
let skinWindow = null;

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

function sceneRecord(id) {
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
    /* cross-origin or closed */
  }
  skinWindow = window.open(href, 'hl-skin-half');
}

function broadcastScene(sceneId, meta = {}) {
  const rec = sceneRecord(sceneId);
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

function setPictureMode(mode) {
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
  if (els.rulesBlock) els.rulesBlock.hidden = !isAuto;
  setText(els.modeLabel, isAuto ? 'Autodetect' : 'Manual');
  setText(
    els.modeHint,
    isAuto
      ? 'Autodetect is on. Start the helper so pictures follow the app on your other half (any app you choose).'
      : 'Manual is on. Tap a picture below to put it on the skin half.',
  );

  if (!isAuto) {
    clearInterval(pollTimer);
    pollTimer = null;
    setText(els.source, 'Manual pick');
    setText(els.activity, 'Not used in Manual — pick pictures yourself');
  } else {
    startPolling();
  }
}

function renderPicker() {
  if (!els.picker) return;
  els.picker.innerHTML = '';
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
    setPictureMode('manual');
    broadcastScene(id, { source: 'manual' });
    setText(els.source, 'Manual pick');
    setText(els.status, `Showing ${label} on the skin half.`);
    openOrFocusSkin(id);
    if (companionOnline) {
      fetch(`${companionBase}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: id, label }),
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

async function pingCompanion() {
  try {
    const r = await fetch(`${companionBase}/health`, { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    companionOnline = true;
    setText(els.companion, `Helper online · port ${companionPort}`);
    return true;
  } catch {
    companionOnline = false;
    setText(
      els.companion,
      pictureMode === 'autodetect'
        ? 'Helper offline — run npm run skin:auto-session for Autodetect'
        : 'Helper optional in Manual mode',
    );
    return false;
  }
}

async function pushConfigToCompanion() {
  if (!companionOnline) return;
  try {
    await fetch(`${companionBase}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityMap: config.activityMap }),
    });
  } catch {
    /* ignore */
  }
}

async function pollState() {
  if (pictureMode !== 'autodetect') return;
  if (!(await pingCompanion())) return;
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
    setText(els.source, sourceLabel(state.source));
    if (state.split?.attempted) {
      setText(els.split, state.split.ok ? `Split ok — ${state.split.detail}` : `Split note — ${state.split.detail}`);
    }
    if (state.sceneId && state.sceneId !== lastSceneId) {
      broadcastScene(state.sceneId, { source: state.source || 'companion' });
      openOrFocusSkin(state.sceneId);
    } else if (state.sceneId) {
      const rec = sceneRecord(state.sceneId);
      if (rec) updatePreview(rec);
      setText(els.scene, rec?.label || state.sceneId);
    }
  } catch {
    companionOnline = false;
  }
}

function sourceLabel(source) {
  if (source === 'menu') return 'Menu selection (pinned briefly)';
  if (source === 'activity') return 'Detected activity';
  if (source === 'manual') return 'Manual pick';
  if (source === 'ignore-skin-window') return 'Skin window (holding last work scene)';
  if (source === 'boot' || source === 'start') return 'Session start';
  return source || '—';
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
      `<span class="hl-as__meta">match: <code>${escapeHtml(rule.match)}</code></span>` +
      `<span class="hl-as__meta">scenes: ${escapeHtml(scenes)} · ${escapeHtml(rule.mode || 'pin')}</span>`;
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
  setPictureMode('autodetect');
  setText(els.status, 'Starting…');
  const online = await pingCompanion();
  if (online) {
    await pushConfigToCompanion();
    try {
      await fetch(`${companionBase}/open-skin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: config.defaultScene || 'superhero' }),
      });
      await fetch(`${companionBase}/split`, { method: 'POST' });
    } catch {
      /* ignore */
    }
    setText(
      els.status,
      `Autodetect live. Skin half should open. Keep any app you like on the other half (named “${config.otherApp}” for split hints).`,
    );
  } else {
    openOrFocusSkin(config.defaultScene || 'superhero');
    setText(
      els.status,
      'Opened the skin half. Snap any work app to one side and the skin to the other. For Autodetect, run npm run skin:auto-session in a terminal on this computer.',
    );
  }
  broadcastScene(config.defaultScene || 'superhero', { source: 'start' });
  startPolling();
}

function startPolling() {
  clearInterval(pollTimer);
  if (pictureMode !== 'autodetect') return;
  pollTimer = setInterval(pollState, 1600);
  pollState();
}

function wireUi() {
  if (els.otherApp) els.otherApp.value = config.otherApp;
  if (els.cycleSec) els.cycleSec.value = String(config.cycleSeconds);
  els.modeManual?.addEventListener('change', () => {
    if (els.modeManual.checked) setPictureMode('manual');
  });
  els.modeAuto?.addEventListener('change', () => {
    if (els.modeAuto.checked) setPictureMode('autodetect');
  });
  els.btnStart?.addEventListener('click', startSession);
  els.btnOpenSkin?.addEventListener('click', () => openOrFocusSkin(lastSceneId));
  els.btnSplit?.addEventListener('click', async () => {
    if (!(await pingCompanion())) {
      setText(els.split, 'Helper offline — snap the two windows yourself.');
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
  bc?.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || msg.type !== 'menu-selection') return;
    setText(els.source, 'Menu selection');
    if (msg.sceneId) broadcastScene(msg.sceneId, { source: 'menu' });
    if (companionOnline) {
      fetch(`${companionBase}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: msg.sceneId, label: msg.label }),
      }).catch(() => {});
    }
  });
  renderPicker();
  renderMap();
  const boot = sceneRecord(config.defaultScene || 'superhero');
  if (boot) updatePreview(boot);
  setPictureMode(params.get('mode') === 'autodetect' || params.get('started') === '1' ? 'autodetect' : config.pictureMode);
  if (params.get('started') === '1') startSession();
  else pingCompanion();
}

wireUi();
