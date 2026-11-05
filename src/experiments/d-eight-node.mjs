/** D: one originating story broadcast to eight nodes at once. */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { mulberry32 } from '../core/rng.mjs';
import { NODE_COUNT, conventionalEightCopies, reconstructNodeView, tinySharedBroadcast } from '../engine/broadcast/eight-node.mjs';
import { deepEqual } from '../engine/rhyming/index.mjs';
import { DIGITAL_SEED } from './constants.mjs';

export function buildEightNodeWorkload(seed = DIGITAL_SEED) {
  const rng = mulberry32(seed);
  const story = {
    id: 'story-1',
    title: 'originating pattern',
    body: Array.from({ length: 400 }, (_, i) => `tok${i}_${(rng() * 1e6) | 0}`).join(' '),
    meta: { octave: 12, version: 1 },
  };
  return { story, conventional: conventionalEightCopies(story), tiny: tinySharedBroadcast(story) };
}

export function experimentD_eightNode(seed = DIGITAL_SEED) {
  const { story, conventional, tiny } = buildEightNodeWorkload(seed);
  const r = reduction(bytesOf(conventional), bytesOf(tiny));
  let exact = true;
  for (let i = 0; i < NODE_COUNT; i++) {
    const view = reconstructNodeView(tiny, i);
    if (!deepEqual(view.story, story) || view.state.node !== i) {
      exact = false;
      break;
    }
  }
  // Theoretical floor ~ 1/8 story + states; expect high reduction
  return {
    id: 'D_eight_node_broadcast',
    title: 'Workload C · eight-node shared originating story',
    ...r,
    exact,
    pass: r.ratio >= 0.7 && exact,
  };
}
