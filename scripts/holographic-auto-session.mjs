#!/usr/bin/env node
/**
 * Holographic Skin · Auto Session companion
 *
 * One-click workstation split:
 *   • One half → browser on Enrichment Living (scene matched to context)
 *   • Other half → your chosen app (default: Cursor)
 *
 * Also serves a tiny localhost API the skin pages poll for activity.
 *
 * Usage:
 *   npm run skin:auto-session
 *   node scripts/holographic-auto-session.mjs [--port 18765] [--scene superhero]
 *     [--other Cursor] [--url https://fractisi.vercel.app/...] [--no-open] [--companion-only]
 */
import http from 'node:http';
import { execFile, execFileSync, spawn } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

const DEFAULT_PORT = 18765;
const DEFAULT_SCENE = 'superhero';
const DEFAULT_OTHER = 'Cursor';
const LIVE_BASE = 'https://fractisi.vercel.app/product/holographic-skin-demonstration';

const args = parseArgs(process.argv.slice(2));
const PORT = Number(args.port || process.env.HL_AUTO_PORT || DEFAULT_PORT);
const SCENE = String(args.scene || process.env.HL_AUTO_SCENE || DEFAULT_SCENE);
const OTHER = String(args.other || process.env.HL_AUTO_OTHER || DEFAULT_OTHER);
const BASE = String(args.url || process.env.HL_AUTO_URL || LIVE_BASE).replace(/\/$/, '');
const OPEN = args['no-open'] !== true && args.companionOnly !== true;
const COMPANION_ONLY = args['companion-only'] === true || args.companionOnly === true;

/** @type {{ id: string, label: string, match: string, scenes: string[], mode: string }[]} */
let activityMap = defaultActivityMap();
let lastMenuSelection = null;
let lastState = {
  activeApp: '',
  title: '',
  sceneId: SCENE,
  cycleIndex: 0,
  source: 'boot',
  ts: Date.now(),
  companion: true,
  otherApp: OTHER,
  split: { attempted: false, ok: false, detail: '' },
};
const cycleBuckets = new Map();

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function defaultActivityMap() {
  return [
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
    },
    {
      id: 'default',
      label: 'Default / idle',
      match: '.*',
      scenes: [SCENE],
      mode: 'pin',
    },
  ];
}

function hasBin(bin) {
  try {
    execFileSync('which', [bin], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function readActiveWindow() {
  if (process.platform === 'linux' && hasBin('xdotool')) {
    try {
      const { stdout: idRaw } = await execFileAsync('xdotool', ['getactivewindow']);
      const id = idRaw.trim();
      const [{ stdout: name }, { stdout: cls }] = await Promise.all([
        execFileAsync('xdotool', ['getwindowname', id]),
        execFileAsync('xdotool', ['getwindowclassname', id]).catch(() => ({ stdout: '' })),
      ]);
      return { id, title: name.trim(), app: (cls || '').trim() || name.trim() };
    } catch {
      return null;
    }
  }
  if (process.platform === 'darwin') {
    try {
      const script =
        'tell application "System Events" to get {name, title} of (first process whose frontmost is true)';
      const { stdout } = await execFileAsync('osascript', ['-e', script]);
      const parts = stdout.trim().split(', ');
      return { id: 'osascript', app: parts[0] || '', title: parts[1] || parts[0] || '' };
    } catch {
      return null;
    }
  }
  return null;
}

function pickScene(win) {
  const hay = `${win?.app || ''} ${win?.title || ''}`.toLowerCase();
  // Ignore our own skin browser chrome so we do not thrash away from work context.
  if (/holographic.?skin|enrichment menu|fractisi/i.test(hay)) {
    return {
      sceneId: lastState.sceneId || SCENE,
      ruleId: 'skin-self',
      source: 'ignore-skin-window',
      cycleIndex: lastState.cycleIndex || 0,
    };
  }
  for (const rule of activityMap) {
    let re;
    try {
      re = new RegExp(rule.match, 'i');
    } catch {
      continue;
    }
    if (!re.test(hay)) continue;
    const scenes = Array.isArray(rule.scenes) && rule.scenes.length ? rule.scenes : [SCENE];
    let cycleIndex = cycleBuckets.get(rule.id) || 0;
    if (rule.mode === 'cycle') {
      // advance slowly via tick; here just report current index
      cycleIndex = cycleIndex % scenes.length;
    } else {
      cycleIndex = 0;
    }
    return {
      sceneId: scenes[cycleIndex] || scenes[0],
      ruleId: rule.id,
      source: 'activity',
      cycleIndex,
      scenes,
      mode: rule.mode,
    };
  }
  return { sceneId: SCENE, ruleId: 'fallback', source: 'fallback', cycleIndex: 0 };
}

function advanceCycles() {
  for (const rule of activityMap) {
    if (rule.mode !== 'cycle' || !rule.scenes?.length) continue;
    const cur = cycleBuckets.get(rule.id) || 0;
    cycleBuckets.set(rule.id, (cur + 1) % rule.scenes.length);
  }
}

async function refreshState() {
  const win = await readActiveWindow();
  const picked = pickScene(win);
  // Menu selection wins for a short pin window (90s) unless activity rule is cursor-work.
  let sceneId = picked.sceneId;
  let source = picked.source;
  if (lastMenuSelection && Date.now() - lastMenuSelection.ts < 90_000) {
    sceneId = lastMenuSelection.sceneId;
    source = 'menu';
  }
  lastState = {
    activeApp: win?.app || '',
    title: win?.title || '',
    sceneId,
    cycleIndex: picked.cycleIndex || 0,
    ruleId: picked.ruleId,
    source,
    ts: Date.now(),
    companion: true,
    otherApp: OTHER,
    menu: lastMenuSelection,
    split: lastState.split,
  };
  return lastState;
}

function livingUrl(sceneId) {
  const u = new URL(`${BASE}/living/`);
  u.searchParams.set('scene', sceneId || SCENE);
  u.searchParams.set('stage', '1');
  u.searchParams.set('auto', '1');
  u.searchParams.set('companion', String(PORT));
  return u.toString();
}

function autoSessionUrl() {
  const u = new URL(`${BASE}/auto-session/`);
  u.searchParams.set('companion', String(PORT));
  u.searchParams.set('started', '1');
  return u.toString();
}

function openUrl(url) {
  const plat = process.platform;
  if (plat === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  else if (plat === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

async function listWindows() {
  if (!(process.platform === 'linux' && hasBin('xdotool'))) return [];
  try {
    const { stdout } = await execFileAsync('xdotool', ['search', '--name', '.*']);
    const ids = stdout.trim().split('\n').filter(Boolean);
    const out = [];
    for (const id of ids.slice(0, 80)) {
      try {
        const [{ stdout: name }, { stdout: cls }] = await Promise.all([
          execFileAsync('xdotool', ['getwindowname', id]),
          execFileAsync('xdotool', ['getwindowclassname', id]).catch(() => ({ stdout: '' })),
        ]);
        out.push({ id, title: name.trim(), app: (cls || '').trim() });
      } catch {
        /* skip */
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function displaySize() {
  if (process.platform === 'linux' && hasBin('xdotool')) {
    try {
      const { stdout } = await execFileAsync('xdotool', ['getdisplaygeometry']);
      const [w, h] = stdout.trim().split(/\s+/).map(Number);
      if (w && h) return { w, h };
    } catch {
      /* fall through */
    }
  }
  return { w: 1920, h: 1080 };
}

async function attemptSplit() {
  const detail = { platform: process.platform, steps: [] };
  if (!(process.platform === 'linux' && hasBin('xdotool'))) {
    lastState.split = {
      attempted: true,
      ok: false,
      detail:
        'Auto tile needs Linux + xdotool (or macOS Stage Manager / manual split). Browser and companion are still running.',
    };
    return lastState.split;
  }
  const { w, h } = await displaySize();
  const half = Math.floor(w / 2);
  // Wait for browser to appear
  await sleep(1800);
  const wins = await listWindows();
  const skinRe = /holographic|enrichment|fractisi|auto.session/i;
  const otherRe = new RegExp(OTHER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const browserRe = /chrome|firefox|brave|chromium|safari|edge|vivaldi/i;

  let skinWin =
    wins.find((x) => skinRe.test(x.title) || skinRe.test(x.app)) ||
    wins.find((x) => browserRe.test(x.app) || browserRe.test(x.title));
  let otherWin =
    wins.find((x) => otherRe.test(x.title) || otherRe.test(x.app)) ||
    wins.find((x) => /cursor/i.test(x.title) || /cursor/i.test(x.app));

  if (otherWin) {
    try {
      await execFileAsync('xdotool', [
        'windowsize',
        otherWin.id,
        String(half),
        String(h),
        'windowmove',
        otherWin.id,
        '0',
        '0',
      ]);
      detail.steps.push(`tiled other=${otherWin.title} left`);
    } catch (e) {
      detail.steps.push(`other tile failed: ${e.message}`);
    }
  } else {
    detail.steps.push(`other app "${OTHER}" window not found — leave it where you like`);
  }

  if (skinWin) {
    try {
      await execFileAsync('xdotool', [
        'windowsize',
        skinWin.id,
        String(w - half),
        String(h),
        'windowmove',
        skinWin.id,
        String(half),
        '0',
      ]);
      detail.steps.push(`tiled skin=${skinWin.title} right`);
    } catch (e) {
      detail.steps.push(`skin tile failed: ${e.message}`);
    }
  } else {
    detail.steps.push('skin browser window not found yet — drag it to the other half');
  }

  const ok = Boolean(skinWin || otherWin);
  lastState.split = { attempted: true, ok, detail: detail.steps.join('; ') };
  return lastState.split;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sendJson(res, code, body) {
  const raw = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(raw);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, port: PORT, otherApp: OTHER });
    }
    if (req.method === 'GET' && url.pathname === '/state') {
      await refreshState();
      return sendJson(res, 200, lastState);
    }
    if (req.method === 'GET' && url.pathname === '/config') {
      return sendJson(res, 200, { activityMap, otherApp: OTHER, defaultScene: SCENE, port: PORT });
    }
    if (req.method === 'POST' && url.pathname === '/config') {
      const body = await readBody(req);
      if (Array.isArray(body.activityMap) && body.activityMap.length) {
        activityMap = body.activityMap;
      }
      return sendJson(res, 200, { ok: true, activityMap });
    }
    if (req.method === 'POST' && url.pathname === '/menu') {
      const body = await readBody(req);
      if (body.sceneId) {
        lastMenuSelection = {
          sceneId: String(body.sceneId),
          label: body.label || '',
          ts: Date.now(),
        };
      }
      await refreshState();
      return sendJson(res, 200, lastState);
    }
    if (req.method === 'POST' && url.pathname === '/split') {
      const split = await attemptSplit();
      return sendJson(res, 200, split);
    }
    if (req.method === 'POST' && url.pathname === '/open-skin') {
      const body = await readBody(req);
      const sceneId = body.sceneId || lastState.sceneId || SCENE;
      openUrl(livingUrl(sceneId));
      return sendJson(res, 200, { ok: true, url: livingUrl(sceneId) });
    }
    sendJson(res, 404, { error: 'not_found' });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`[hl-auto-session] companion on http://127.0.0.1:${PORT}`);
  console.log(`[hl-auto-session] other half app: ${OTHER}`);
  console.log(`[hl-auto-session] skin base: ${BASE}`);
  console.log(`[hl-auto-session] tip: npm run skin:auto-session`);

  if (!COMPANION_ONLY && OPEN) {
    openUrl(autoSessionUrl());
    await sleep(600);
    openUrl(livingUrl(SCENE));
    // Fire-and-forget tile attempt
    attemptSplit().then((s) => {
      console.log(`[hl-auto-session] split: ${s.ok ? 'ok' : 'partial'} — ${s.detail}`);
    });
  }

  setInterval(() => {
    advanceCycles();
    refreshState().catch(() => {});
  }, 12_000);

  setInterval(() => {
    refreshState().catch(() => {});
  }, 1500);
});

process.on('SIGINT', () => {
  console.log('\n[hl-auto-session] bye');
  process.exit(0);
});
