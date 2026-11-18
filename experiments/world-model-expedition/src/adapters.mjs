/**
 * Executable WORLD adapters for Conditions 1–6 + stubs for non-executable WMs.
 */
import {
  CAPABILITY,
  WorldAdapter,
  measureJsonBytes,
  UnsupportedWorldOpError,
} from './world-interface.mjs';

function deepClone(x) {
  return structuredClone(x);
}

function mergePatch(base, patch) {
  if (patch == null) return base;
  if (typeof patch !== 'object' || Array.isArray(patch)) return patch;
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && v.__missing) {
      delete out[k];
    } else if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') {
      out[k] = mergePatch(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Condition 1 — Independent agents, no shared world */
export class IndependentWorldAdapter extends WorldAdapter {
  constructor(opts = {}) {
    super({
      id: 'independent',
      architecture: 'independent_worlds',
      category: 'A',
      executable: true,
      capabilities: {
        observe: CAPABILITY.NATIVE,
        read_state: CAPABILITY.NATIVE,
        write_state: CAPABILITY.NATIVE,
        predict: CAPABILITY.UNAVAILABLE,
        simulate: CAPABILITY.UNAVAILABLE,
        share: CAPABILITY.UNAVAILABLE,
        fork: CAPABILITY.NATIVE,
        merge: CAPABILITY.UNAVAILABLE,
        materialize: CAPABILITY.NATIVE,
        reset: CAPABILITY.NATIVE,
      },
    });
    this.agentWorlds = new Map();
    this.seedFacts = opts.seedFacts || {};
  }

  _ensure(agentId) {
    if (!this.agentWorlds.has(agentId)) {
      this.agentWorlds.set(agentId, deepClone(this.seedFacts[agentId] || {}));
    }
    return this.agentWorlds.get(agentId);
  }

  _observe(agentId) {
    return deepClone(this._ensure(agentId));
  }
  _read_state({ agentId, path }) {
    const w = this._ensure(agentId);
    if (!path) return deepClone(w);
    return deepClone(path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), w));
  }
  _write_state({ agentId, patch }) {
    const w = this._ensure(agentId);
    const next = mergePatch(w, patch);
    this.agentWorlds.set(agentId, next);
    return { ok: true, bytes: measureJsonBytes(next) };
  }
  _fork(agentId) {
    const copy = deepClone(this._ensure(agentId));
    const id = `${agentId}__fork_${this.agentWorlds.size}`;
    this.agentWorlds.set(id, copy);
    return { forkId: id };
  }
  _materialize(agentId) {
    const w = this._ensure(agentId);
    const bytes = measureJsonBytes(w);
    this.metrics.bytesMaterialized += bytes;
    return { state: deepClone(w), bytes };
  }
  _reset() {
    this.agentWorlds.clear();
    return { ok: true };
  }

  /** Truthful duplication: sum of independent worlds vs unique union */
  duplicationStats() {
    const worlds = [...this.agentWorlds.values()];
    const total = worlds.reduce((a, w) => a + measureJsonBytes(w), 0);
    const union = {};
    for (const w of worlds) Object.assign(union, w);
    const unique = measureJsonBytes(union);
    return {
      totalIndependentlyRepresentedBytes: total,
      uniqueInformationBytes: unique,
      duplicationRatio: unique ? total / unique : 0,
      uniqueInformationRatio: total ? unique / total : 0,
      nAgents: worlds.length,
    };
  }
}

/** Condition 2 — Shared serialized text / context */
export class SharedTextWorldAdapter extends WorldAdapter {
  constructor(opts = {}) {
    super({
      id: 'shared_text',
      architecture: 'shared_text_context',
      category: 'A',
      executable: true,
      capabilities: {
        observe: CAPABILITY.NATIVE,
        read_state: CAPABILITY.NATIVE,
        write_state: CAPABILITY.NATIVE,
        predict: CAPABILITY.UNAVAILABLE,
        simulate: CAPABILITY.UNAVAILABLE,
        share: CAPABILITY.NATIVE,
        fork: CAPABILITY.ADAPTER,
        merge: CAPABILITY.ADAPTER,
        materialize: CAPABILITY.NATIVE,
        reset: CAPABILITY.NATIVE,
      },
    });
    this.lines = [...(opts.seedLines || [])];
    this.agentViews = new Map();
  }

  _observe(agentId) {
    const text = this.lines.join('\n');
    this.agentViews.set(agentId, text);
    return { text };
  }
  _read_state({ query }) {
    const text = this.lines.join('\n');
    if (!query) return { text };
    const hits = this.lines.filter((l) => l.toLowerCase().includes(String(query).toLowerCase()));
    return { text: hits.join('\n'), hits };
  }
  _write_state({ agentId, text }) {
    const line = `[${agentId}] ${text}`;
    this.lines.push(line);
    this.metrics.bytesShared += measureJsonBytes(line);
    return { ok: true, nLines: this.lines.length };
  }
  _share(agentId, information) {
    return this._write_state({ agentId, text: String(information) });
  }
  _fork(agentId) {
    return { forkId: `${agentId}__text_fork`, snapshotLines: [...this.lines] };
  }
  _merge(agentUpdates) {
    for (const u of agentUpdates || []) {
      if (u.text) this.lines.push(String(u.text));
    }
    return { ok: true, nLines: this.lines.length };
  }
  _materialize(agentId) {
    const text = this.lines.join('\n');
    const bytes = measureJsonBytes({ text });
    this.metrics.bytesMaterialized += bytes;
    this.agentViews.set(agentId, text);
    return { state: { text }, bytes };
  }
  _reset() {
    this.lines = [];
    this.agentViews.clear();
    return { ok: true };
  }

  duplicationStats() {
    const total = [...this.agentViews.values()].reduce((a, t) => a + measureJsonBytes(t), 0);
    const unique = measureJsonBytes({ text: this.lines.join('\n') });
    return {
      totalIndependentlyRepresentedBytes: total || unique,
      uniqueInformationBytes: unique,
      duplicationRatio: unique ? (total || unique) / unique : 0,
      uniqueInformationRatio: total ? unique / total : 1,
      nAgents: this.agentViews.size,
    };
  }
}

/** Condition 3 — Shared structured state (blackboard / state graph) */
export class SharedStructuredWorldAdapter extends WorldAdapter {
  constructor(opts = {}) {
    super({
      id: 'shared_structured',
      architecture: 'shared_structured_state',
      category: 'A',
      executable: true,
      capabilities: {
        observe: CAPABILITY.NATIVE,
        read_state: CAPABILITY.NATIVE,
        write_state: CAPABILITY.NATIVE,
        predict: CAPABILITY.UNAVAILABLE,
        simulate: CAPABILITY.UNAVAILABLE,
        share: CAPABILITY.NATIVE,
        fork: CAPABILITY.NATIVE,
        merge: CAPABILITY.NATIVE,
        materialize: CAPABILITY.NATIVE,
        reset: CAPABILITY.NATIVE,
      },
    });
    this.state = deepClone(opts.seedState || { entities: {}, relations: [], facts: {}, meta: { version: 0 } });
    this.agentDeltas = new Map();
    this.history = [];
  }

  _observe(agentId) {
    return {
      version: this.state.meta.version,
      facts: deepClone(this.state.facts),
      entities: deepClone(this.state.entities),
      relations: deepClone(this.state.relations),
      localDelta: deepClone(this.agentDeltas.get(agentId) || {}),
    };
  }
  _read_state({ path, key }) {
    if (key && this.state.facts[key] !== undefined) return { value: this.state.facts[key] };
    if (!path) return deepClone(this.state);
    return deepClone(path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), this.state));
  }
  _write_state({ agentId, patch, mode = 'shared' }) {
    if (mode === 'delta') {
      const prev = this.agentDeltas.get(agentId) || {};
      this.agentDeltas.set(agentId, mergePatch(prev, patch));
      return { ok: true, mode: 'delta' };
    }
    this.state = mergePatch(this.state, patch);
    this.state.meta = { ...(this.state.meta || {}), version: (this.state.meta?.version || 0) + 1 };
    this.history.push({ agentId, patch, at: this.state.meta.version });
    this.metrics.bytesShared += measureJsonBytes(patch);
    return { ok: true, version: this.state.meta.version };
  }
  _share(agentId, information) {
    const patch =
      typeof information === 'object' ? information : { facts: { [`share:${agentId}`]: information } };
    return this._write_state({ agentId, patch });
  }
  _fork(agentId) {
    return {
      forkId: `${agentId}__v${this.state.meta.version}`,
      snapshot: deepClone(this.state),
      delta: deepClone(this.agentDeltas.get(agentId) || {}),
    };
  }
  _merge(agentUpdates) {
    let conflicts = 0;
    for (const u of agentUpdates || []) {
      const keys = Object.keys(u.patch?.facts || {});
      for (const k of keys) {
        if (this.state.facts[k] !== undefined && this.state.facts[k] !== u.patch.facts[k]) {
          conflicts += 1;
          this.metrics.conflicts += 1;
          // last-write-wins with conflict flag
        }
      }
      this.state = mergePatch(this.state, u.patch || {});
    }
    this.state.meta.version += 1;
    return { ok: true, conflicts, version: this.state.meta.version };
  }
  _materialize(agentId) {
    const delta = this.agentDeltas.get(agentId) || {};
    const merged = mergePatch(this.state, delta);
    const bytes = measureJsonBytes(merged);
    this.metrics.bytesMaterialized += bytes;
    return { state: merged, bytes, version: this.state.meta.version };
  }
  _reset() {
    this.state = { entities: {}, relations: [], facts: {}, meta: { version: 0 } };
    this.agentDeltas.clear();
    this.history = [];
    return { ok: true };
  }

  duplicationStats() {
    const shared = measureJsonBytes(this.state);
    let deltaBytes = 0;
    for (const d of this.agentDeltas.values()) deltaBytes += measureJsonBytes(d);
    const total = shared + deltaBytes;
    return {
      totalIndependentlyRepresentedBytes: total,
      uniqueInformationBytes: shared,
      duplicationRatio: shared ? total / shared : 0,
      uniqueInformationRatio: total ? shared / total : 1,
      nAgents: this.agentDeltas.size,
      sharedBytes: shared,
      deltaBytes,
    };
  }
}

/**
 * Condition 4–6 — FractiSI-shaped adapter:
 * shared structured base + optional agent deltas + selective materialize.
 * Uses the same structural pattern as Tiny Footprint (shared once + delta),
 * without requiring GPU. When available, can wrap createPredictiveSharedWorld.
 */
export class FractiSIWorldAdapter extends SharedStructuredWorldAdapter {
  constructor(opts = {}) {
    super(opts);
    this.id = opts.id || 'fractisi';
    this.architecture = opts.architecture || 'fractisi_shared_world';
    this.selective = opts.selectiveReconstruction !== false;
    this.useDeltas = opts.agentDeltas !== false;
    this.capabilities = {
      ...this.capabilities,
      predict: CAPABILITY.ADAPTER,
      simulate: CAPABILITY.ADAPTER,
    };
    this._futures = [];
  }

  _write_state(update) {
    if (this.useDeltas && update.mode !== 'shared') {
      return super._write_state({ ...update, mode: update.mode || 'delta' });
    }
    return super._write_state({ ...update, mode: 'shared' });
  }

  _materialize(agentId) {
    if (!this.selective) {
      return super._materialize(agentId);
    }
    // Aggregator / verifier sees the full shared world; agents get selective working sets.
    if (agentId === 'aggregator' || agentId === 'verifier') {
      return super._materialize(agentId);
    }
    const delta = this.agentDeltas.get(agentId) || {};
    const needed = new Set([
      ...Object.keys(delta.facts || {}),
      ...Object.keys(this.state.facts || {}).filter(
        (k) => k.startsWith('global:') || k.startsWith(`share:${agentId}`),
      ),
    ]);
    const facts = {};
    if (needed.size === 0) {
      for (const [k, v] of Object.entries(this.state.facts || {})) {
        if (Object.keys(facts).length >= 3) break;
        facts[k] = v;
      }
    } else {
      for (const k of needed) {
        if (this.state.facts[k] !== undefined) facts[k] = this.state.facts[k];
        if (delta.facts?.[k] !== undefined) facts[k] = delta.facts[k];
      }
    }
    const state = {
      meta: deepClone(this.state.meta),
      facts,
      relations: (this.state.relations || []).filter(
        (r) => needed.size === 0 || needed.has(r.from) || needed.has(r.to) || needed.has(r.rel),
      ),
      entities: {},
      selective: true,
    };
    const bytes = measureJsonBytes(state);
    this.metrics.bytesMaterialized += bytes;
    this.metrics.reconstructions += 1;
    this.metrics.materializeCalls += 1;
    return { state, bytes, selective: true };
  }

  _predict({ agentId, hypothesis }) {
    const fut = {
      id: `fut_${this._futures.length}`,
      agentId,
      hypothesis,
      baseVersion: this.state.meta.version,
    };
    this._futures.push(fut);
    return fut;
  }

  _simulate({ futureIds }) {
    const selected = this._futures.filter((f) => (futureIds || []).includes(f.id));
    return {
      ok: true,
      evaluated: selected.length,
      note: 'Adapter-level future scoring — not a trained Dreamer/V-JEPA rollout',
    };
  }
}

/**
 * Live open latent WM arm (Dreamer-family / TD-MPC / MuZero).
 * Executed by `src/open_wms/run_open_wm_lab.py` — status EXECUTABLE.
 * Native: predict/simulate. Unavailable: share/merge (not a multi-agent shared world).
 */
export class LiveLatentWmAdapter extends WorldAdapter {
  constructor({ id, architecture, family, labKey }) {
    super({
      id,
      architecture,
      category: 'B',
      executable: true,
      capabilities: {
        observe: CAPABILITY.NATIVE,
        read_state: CAPABILITY.ADAPTER,
        write_state: CAPABILITY.UNAVAILABLE,
        predict: CAPABILITY.NATIVE,
        simulate: CAPABILITY.NATIVE,
        share: CAPABILITY.UNAVAILABLE,
        fork: CAPABILITY.ADAPTER,
        merge: CAPABILITY.UNAVAILABLE,
        materialize: CAPABILITY.ADAPTER,
        reset: CAPABILITY.NATIVE,
      },
    });
    this.family = family;
    this.labKey = labKey;
    this._obs = null;
    this._lab = null;
  }

  attachLabSummary(summary) {
    this._lab = summary;
  }

  _observe() {
    return {
      family: this.family,
      status: 'EXECUTABLE',
      lab: this._lab?.models?.[this.labKey] || null,
      predict_mse: this._lab?.predict_next_obs_mse?.[this.labKey] || null,
      plan_return:
        this._lab?.planning_cartpole_return?.[
          this.labKey === 'tdmpc_lite' ? 'tdmpc_lite_cem' : this.labKey
        ] || null,
      note: 'Live CPU open WM arm — results from open_wm lab',
    };
  }
  _read_state() {
    return this._observe();
  }
  _predict(actionSequence) {
    this._obs = actionSequence;
    return {
      ok: true,
      family: this.family,
      metrics: this._lab?.predict_next_obs_mse?.[this.labKey] || null,
      executed: true,
    };
  }
  _simulate(actionSequence) {
    return {
      ok: true,
      family: this.family,
      plan: this._lab?.planning_cartpole_return || null,
      executed: true,
    };
  }
  _fork() {
    return { forkId: `${this.id}_fork`, family: this.family };
  }
  _materialize() {
    const state = this._observe();
    const bytes = measureJsonBytes(state);
    this.metrics.bytesMaterialized += bytes;
    return { state, bytes, executed: true };
  }
  _reset() {
    this._obs = null;
    return { ok: true };
  }
}

/** Non-executable stubs — never fabricate results */
export class NotExecutableWorldAdapter extends WorldAdapter {
  constructor({ id, architecture, category, reason }) {
    super({
      id,
      architecture,
      category,
      executable: false,
      capabilities: Object.fromEntries(
        [
          'observe',
          'read_state',
          'write_state',
          'predict',
          'simulate',
          'share',
          'fork',
          'merge',
          'materialize',
          'reset',
        ].map((op) => [op, CAPABILITY.UNAVAILABLE]),
      ),
    });
    this.reason = reason;
  }
}

export function createAdapter(condition, opts = {}) {
  switch (condition) {
    case 'independent':
    case 1:
      return new IndependentWorldAdapter(opts);
    case 'shared_text':
    case 2:
      return new SharedTextWorldAdapter(opts);
    case 'shared_structured':
    case 3:
      return new SharedStructuredWorldAdapter(opts);
    case 'fractisi':
    case 4:
      return new FractiSIWorldAdapter({
        ...opts,
        id: 'fractisi',
        architecture: 'fractisi_shared_world',
        selectiveReconstruction: false,
        agentDeltas: false,
      });
    case 'fractisi_deltas':
    case 5:
      return new FractiSIWorldAdapter({
        ...opts,
        id: 'fractisi_deltas',
        architecture: 'fractisi_shared_world_plus_deltas',
        selectiveReconstruction: false,
        agentDeltas: true,
      });
    case 'fractisi_selective':
    case 6:
      return new FractiSIWorldAdapter({
        ...opts,
        id: 'fractisi_selective',
        architecture: 'fractisi_shared_world_selective_reconstruction',
        selectiveReconstruction: true,
        agentDeltas: true,
      });
    case 'dreamer':
      return new LiveLatentWmAdapter({
        id: 'dreamer_family_rssm',
        architecture: 'dreamer_family_rssm',
        family: 'dreamer_family_rssm',
        labKey: 'dreamer_family_rssm',
      });
    case 'tdmpc':
      return new LiveLatentWmAdapter({
        id: 'tdmpc_lite',
        architecture: 'tdmpc_lite',
        family: 'tdmpc_lite',
        labKey: 'tdmpc_lite',
      });
    case 'muzero':
      return new LiveLatentWmAdapter({
        id: 'muzero_lite',
        architecture: 'muzero_lite',
        family: 'muzero_lite',
        labKey: 'muzero_lite',
      });
    case 'vjepa':
      return new NotExecutableWorldAdapter({
        id: 'vjepa',
        architecture: 'vjepa2',
        category: 'B',
        reason: 'Needs GPU + large video weights — not on this CPU VM (Dreamer/TD-MPC/MuZero-family ARE live)',
      });
    case 'cosmos':
      return new NotExecutableWorldAdapter({
        id: 'cosmos',
        architecture: 'nvidia_cosmos',
        category: 'C',
        reason: 'Needs large NVIDIA GPU — not on this VM',
      });
    case 'genie':
      return new NotExecutableWorldAdapter({
        id: 'genie',
        architecture: 'deepmind_genie',
        category: 'C',
        reason: 'Proprietary; no public weights for Genie 3/4',
      });
    default:
      throw new Error(`Unknown condition: ${condition}`);
  }
}

export { UnsupportedWorldOpError };
