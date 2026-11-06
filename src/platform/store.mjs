/**
 * Local shared-state store. In-memory Maps with optional JSON file persistence.
 * Prefer extending this over introducing a database for Workstation installs.
 */
import fs from 'node:fs';
import path from 'node:path';

export function createStore(opts = {}) {
  const state = {
    project: null,
    agents: new Map(),
    tasks: new Map(),
    contributions: new Map(),
    compositions: new Map(),
    events: [],
  };

  function snapshot() {
    return {
      project: state.project,
      agents: [...state.agents.values()],
      tasks: [...state.tasks.values()],
      contributions: [...state.contributions.values()],
      compositions: [...state.compositions.values()],
      events: state.events.slice(-500),
    };
  }

  function loadSnapshot(data) {
    if (!data || typeof data !== 'object') return;
    state.project = data.project ?? null;
    state.agents = new Map((data.agents || []).map((a) => [a.id, a]));
    state.tasks = new Map((data.tasks || []).map((t) => [t.id, t]));
    state.contributions = new Map((data.contributions || []).map((c) => [c.id, c]));
    state.compositions = new Map((data.compositions || []).map((c) => [c.id, c]));
    state.events = Array.isArray(data.events) ? data.events.slice(-500) : [];
  }

  function persist() {
    if (!opts.path) return null;
    fs.mkdirSync(path.dirname(opts.path), { recursive: true });
    const json = JSON.stringify(snapshot(), null, 2);
    fs.writeFileSync(opts.path, json);
    return opts.path;
  }

  function restore() {
    if (!opts.path || !fs.existsSync(opts.path)) return false;
    loadSnapshot(JSON.parse(fs.readFileSync(opts.path, 'utf8')));
    return true;
  }

  function emit(type, detail = {}) {
    const event = { type, at: new Date().toISOString(), ...detail };
    state.events.push(event);
    if (state.events.length > 500) state.events.shift();
    if (opts.autoPersist) persist();
    return event;
  }

  return {
    state,
    snapshot,
    loadSnapshot,
    persist,
    restore,
    emit,
  };
}
