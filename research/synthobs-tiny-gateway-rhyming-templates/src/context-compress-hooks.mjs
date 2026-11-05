/**
 * Recursive context compression hooks — pluggable lab meters.
 *
 * In-process fold hooks + demo meters only.
 * Not a KV-cache compression product. Not infinite lossless context.
 */
import { bytesOf } from './memory.mjs';
import { diffDelta } from './rhyming-template.mjs';

export function createCompressionHookRegistry() {
  /** @type {Map<string, { onEncode?: Function, onReconstruct?: Function, onMeter?: Function }>} */
  const hooks = new Map();
  const fired = [];

  return {
    registerHook(name, handlers) {
      if (!name || !handlers) throw new Error('invalid hook');
      hooks.set(name, handlers);
      return name;
    },
    list() {
      return [...hooks.keys()];
    },
    fired() {
      return [...fired];
    },
    clearFired() {
      fired.length = 0;
    },
    applyEncodeHooks(encoded, ctx = {}) {
      let cur = encoded;
      for (const [name, h] of hooks) {
        if (typeof h.onEncode !== 'function') continue;
        cur = h.onEncode(cur, ctx) ?? cur;
        fired.push({ hook: name, phase: 'encode' });
      }
      return cur;
    },
    applyReconstructHooks(value, ctx = {}) {
      let cur = value;
      for (const [name, h] of hooks) {
        if (typeof h.onReconstruct !== 'function') continue;
        cur = h.onReconstruct(cur, ctx) ?? cur;
        fired.push({ hook: name, phase: 'reconstruct' });
      }
      return cur;
    },
    collectMeters(snapshot, ctx = {}) {
      const meters = {};
      for (const [name, h] of hooks) {
        if (typeof h.onMeter === 'function') {
          meters[name] = h.onMeter(snapshot, ctx);
          fired.push({ hook: name, phase: 'meter' });
        }
      }
      return meters;
    },
  };
}

/** Built-in: fold nested deltas against a base pattern when present. */
export function nestedDeltaFoldHook(basePattern) {
  return {
    onEncode(encoded) {
      if (!encoded || basePattern == null) return encoded;
      if (encoded.delta != null && encoded.value != null) {
        const folded = diffDelta(basePattern, encoded.value);
        return { ...encoded, delta: folded || {}, value: undefined, folded: true };
      }
      return encoded;
    },
    onMeter(snapshot) {
      return { kind: 'nested_delta_fold', bytes: bytesOf(snapshot) };
    },
  };
}

/** Built-in: refuse encode trees deeper than maxDepth (scale cap). */
export function octaveScaleCapHook({ maxDepth = 6 } = {}) {
  return {
    onEncode(encoded) {
      const depth = encoded?.nestDepth ?? encoded?.delta?._depth ?? 0;
      if (depth > maxDepth) {
        return { ...encoded, capped: true, nestDepth: maxDepth };
      }
      return encoded;
    },
    onMeter(snapshot) {
      return { kind: 'octave_scale_cap', maxDepth, bytes: bytesOf(snapshot) };
    },
  };
}

/** Built-in: soft bound on working-set payload size (meter + flag). */
export function workingSetBoundHook({ maxBytes = 64_000 } = {}) {
  return {
    onMeter(snapshot) {
      const b = bytesOf(snapshot);
      return { kind: 'working_set_bound', maxBytes, bytes: b, overBudget: b > maxBytes };
    },
  };
}
