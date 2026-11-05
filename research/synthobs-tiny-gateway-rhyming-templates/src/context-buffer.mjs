/**
 * Recursive context buffer — fold older turns into template refs + deltas.
 *
 * Demo / lab meters for ultra-low footprint historical context.
 * Not production KV compression. Not infinite lossless history.
 */
import { bytesOf } from './memory.mjs';
import { diffDelta, deepEqual } from './rhyming-template.mjs';

export function createRecursiveContextBuffer({
  maxLevels = 4,
  maxBytesPerLevel = 8_192,
  pattern = null,
  hooks = null,
} = {}) {
  /** @type {{ turn: number, raw: object, folded: object|null }[]} */
  const turns = [];
  let hooksFired = [];

  function foldTurn(raw) {
    if (pattern == null) {
      return { ref: 'raw', payload: raw };
    }
    const delta = diffDelta(pattern, raw) || {};
    let folded = { templateRef: true, delta };
    if (hooks) {
      folded = hooks.applyEncodeHooks(folded, { pattern, raw }) ?? folded;
      hooksFired = hooks.fired();
    }
    return folded;
  }

  function foldOlderLevels() {
    // Drop overflowed history first (keep folded receipt only while shifting out).
    while (turns.length > maxLevels) {
      const oldest = turns.shift();
      if (oldest && oldest.folded == null && oldest.raw != null) {
        oldest.folded = foldTurn(oldest.raw);
      }
      if (oldest) oldest.raw = null;
    }
    // Keep newest turn raw; fold + drop raw for every older retained level.
    for (let i = 0; i < turns.length; i++) {
      const age = turns.length - 1 - i;
      if (age >= 1) {
        if (turns[i].folded == null && turns[i].raw != null) {
          turns[i].folded = foldTurn(turns[i].raw);
        }
        turns[i].raw = null;
      }
    }
    // Soft bound: even newest may drop raw if over maxBytesPerLevel once folded.
    for (const t of turns) {
      if (t.folded && t.raw != null && bytesOf(t.raw) > maxBytesPerLevel) {
        t.raw = null;
      }
    }
  }

  return {
    pushTurn(raw) {
      const entry = { turn: turns.length, raw: structuredClone(raw), folded: null };
      turns.push(entry);
      foldOlderLevels();
      return entry.turn;
    },
    foldOlderLevels,
    /** Reconstruct retained window (folded merges when raw dropped). */
    reconstructWindow(mergeFn) {
      const out = [];
      for (const t of turns) {
        if (t.raw != null) {
          out.push(structuredClone(t.raw));
          continue;
        }
        if (t.folded && pattern != null && typeof mergeFn === 'function') {
          out.push(mergeFn(pattern, t.folded.delta || {}));
        } else if (t.folded) {
          out.push(structuredClone(t.folded));
        }
      }
      return out;
    },
    snapshotMeters() {
      const rawBytes = turns.reduce((s, t) => s + (t.raw != null ? bytesOf(t.raw) : 0), 0);
      const foldedBytes = turns.reduce((s, t) => {
        if (t.raw != null) return s + bytesOf(t.raw);
        return s + bytesOf(t.folded || {});
      }, 0);
      // Baseline: one full raw turn-size × levels (use newest raw, or folded×3 proxy).
      const sampleRaw =
        [...turns].reverse().find((t) => t.raw != null)?.raw ??
        null;
      const perTurnRaw = sampleRaw
        ? bytesOf(sampleRaw)
        : Math.max(64, foldedBytes / Math.max(1, turns.length)) * 3;
      const allRawWouldBe = perTurnRaw * turns.length;
      const foldRatio = allRawWouldBe > 0 ? Math.max(0, 1 - foldedBytes / allRawWouldBe) : 0;
      const hookMeters = hooks ? hooks.collectMeters({ turns: turns.length, foldedBytes }) : {};
      return {
        levels: turns.length,
        maxLevels,
        maxBytesPerLevel,
        rawBytes,
        foldedBytes,
        allRawWouldBe,
        foldRatio,
        hooksFired: hooks ? hooks.fired() : hooksFired,
        hookMeters,
        honesty:
          'Recursive context-fold hooks and demo meters — not a KV-cache compression product, not infinite lossless context.',
      };
    },
    size() {
      return turns.length;
    },
    /** Exactness check for turns that still retain raw vs folded reconstruct. */
    exactWithinRetained(mergeFn) {
      for (const t of turns) {
        if (t.raw == null || t.folded == null || pattern == null) continue;
        const recon = mergeFn(pattern, t.folded.delta || {});
        if (!deepEqual(recon, t.raw)) return false;
      }
      return true;
    },
  };
}
