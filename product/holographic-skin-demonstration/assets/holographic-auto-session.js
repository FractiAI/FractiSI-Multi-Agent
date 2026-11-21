/**
 * Holographic Skin · Auto Session client
 * Polls local companion, syncs Living via BroadcastChannel + query deep links.
 */
import {
  SCENES,
  SIRENS,
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
};

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;
let config = loadConfig();
let lastSceneId = config.defaultScene || 'superhero';
let companionOnline = false;
let pollTimer = null;
let cycleTimer = null;

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
  };
}

function saveConfig() {
  config.otherApp = (els.otherApp?.value || 'Cursor').trim() || 'Cursor';
  config.cycleSeconds = Math.max(8, Number(els.cycleSec?.value) || 45);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  pushConfigToCompanion();
  setText(els.status, 'Saved on this device' + (companionOnline ? ' and pushed to companion.' : '.'));
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

function livingHref(sceneId) {
  const u = new URL('/product/holographic-skin-demonstration/living/', location.origin);
  u.searchParams.set('scene', sceneId || lastSceneId);
  u.searchParams.set('stage', '1');
  u.searchParams.set('auto', '1');
  u.searchParams.set('companion', String(companionPort));
  return u.href;
}

function broadcastScene(sceneId, meta = {}) {
  const rec = sceneRecord(sceneId);
  if (!rec) return;
  lastSceneId = sceneId;
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
}

function updatePreview(rec) {
  if (els.previewImg && rec?.image) {
    els.previewImg.src = rec.image;
    els.previewImg.alt = rec.label || '';
  }
  setText(els.previewLabel, rec?.label || '');
  if (els.preview) els.preview.hidden = false;
}

async function pingCompanion() {
  try {
    const r = await fetch(`${companionBase}/health`, { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    companionOnline = true;
    setText(els.companion, `Companion online · port ${companionPort}`);
    return true;
  } catch {
    companionOnline = false;
    setText(
      els.companion,
      'Companion offline — run npm run skin:auto-session on this machine for full split + activity detect.',
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
  if (source === 'activity') return 'Workstation activity';
  if (source === 'ignore-skin-window') return 'Skin window (holding last work scene)';
  if (source === 'boot') return 'Session start';
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

function startLocalFallbackCycle() {
  clearInterval(cycleTimer);
  cycleTimer = setInterval(() => {
    if (companionOnline) return;
    // Without companion: gentle cycle through default Cursor mapping scenes.
    const rule = config.activityMap.find((r) => r.id === 'cursor-work') || config.activityMap[0];
    if (!rule?.scenes?.length) return;
    const i = rule.scenes.indexOf(lastSceneId);
    const next = rule.scenes[(i + 1) % rule.scenes.length];
    broadcastScene(next, { source: 'local-cycle' });
    setText(els.source, 'Local cycle (companion offline)');
    setText(els.activity, 'Browser-only mode — start companion for real app detect');
  }, Math.max(8, config.cycleSeconds) * 1000);
}

async function startSession() {
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
      `Session live. Skin half should open with ${config.defaultScene || 'superhero'}. Keep ${config.otherApp} on the other half.`,
    );
  } else {
    window.open(livingHref(config.defaultScene || 'superhero'), 'hl-skin-half');
    setText(
      els.status,
      'Opened the skin half in a browser window. Drag Cursor (or your app) to one side and the skin to the other. For one-click split + activity detect, run npm run skin:auto-session in a terminal on this computer.',
    );
  }
  broadcastScene(config.defaultScene || 'superhero', { source: 'start' });
  startPolling();
}

function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(pollState, 1600);
  pollState();
  startLocalFallbackCycle();
}

function wireUi() {
  if (els.otherApp) els.otherApp.value = config.otherApp;
  if (els.cycleSec) els.cycleSec.value = String(config.cycleSeconds);
  els.btnStart?.addEventListener('click', startSession);
  els.btnOpenSkin?.addEventListener('click', () => {
    window.open(livingHref(lastSceneId), 'hl-skin-half');
  });
  els.btnSplit?.addEventListener('click', async () => {
    if (!(await pingCompanion())) {
      setText(els.split, 'Companion offline — cannot auto-tile from the browser alone.');
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
  renderMap();
  const boot = sceneRecord(config.defaultScene || 'superhero');
  if (boot) updatePreview(boot);
  if (params.get('started') === '1') startSession();
  else {
    pingCompanion();
    startPolling();
  }
}

wireUi();
