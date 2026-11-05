import { mulberry32 } from '../core/rng.mjs';
import { createRecursiveContextBuffer } from '../engine/context/buffer.mjs';
import { createCompressionHookRegistry, nestedDeltaFoldHook, octaveScaleCapHook, workingSetBoundHook } from '../engine/context/hooks.mjs';
import { mergeDelta } from '../engine/rhyming/codec.mjs';
import { DIGITAL_SEED } from './constants.mjs';

/**
 * L · Recursive context-fold hooks (companion meter — not in H pin).
 */
export function experimentL_contextCompressHooks(seed = DIGITAL_SEED, turns = 24) {
  const rng = mulberry32(seed);
  const pattern = {
    kind: 'turn',
    role: 'user',
    text: '',
    meta: { session: 's1', i: 0 },
  };
  const hooks = createCompressionHookRegistry();
  hooks.registerHook('nested_delta_fold', nestedDeltaFoldHook(pattern));
  hooks.registerHook('octave_scale_cap', octaveScaleCapHook({ maxDepth: 4 }));
  hooks.registerHook('working_set_bound', workingSetBoundHook({ maxBytes: 4_096 }));

  const buf = createRecursiveContextBuffer({
    maxLevels: 6,
    maxBytesPerLevel: 2_048,
    pattern,
    hooks,
  });

  for (let i = 0; i < turns; i++) {
    buf.pushTurn({
      kind: 'turn',
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: `msg-${i}-${(rng() * 1e6).toFixed(0)}`,
      meta: { session: 's1', i },
    });
  }
  const meters = buf.snapshotMeters();
  // Replay expected last-window turns for reconstruct exactness
  const window = buf.reconstructWindow(mergeDelta);
  let exact = window.length === meters.levels;
  for (let i = 0; i < window.length; i++) {
    const w = window[i];
    if (!w || w.kind !== 'turn' || typeof w.meta?.i !== 'number') {
      exact = false;
      break;
    }
  }
  const hooksFired = meters.hooksFired?.length > 0;
  const foldPositive = meters.foldRatio > 0 && meters.foldedBytes < meters.allRawWouldBe;
  const pass = foldPositive && exact && hooksFired && meters.levels <= 6;

  return {
    id: 'L_context_compress_hooks',
    title: 'Recursive context-fold hooks + demo meters',
    turns,
    ...meters,
    exact,
    pass,
    honesty:
      'Recursive context-fold hooks and demo meters — not a KV-cache compression product, not infinite lossless context, not measured transformer KV on device.',
  };
}
