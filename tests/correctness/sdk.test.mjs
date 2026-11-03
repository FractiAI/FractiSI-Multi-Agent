import { registerTemplate, sessionDelta, reconstruct, measureBytes } from '../../tiny-footprint/sdk/index.mjs';

const t = registerTemplate('sys-v1', { policy: 'shared' });
const d = sessionDelta('sys-v1', { turn: 1 });
const w = reconstruct('sys-v1', d.delta);
if (!t.templateId || !w.workingSet) {
  console.error('sdk smoke failed');
  process.exit(1);
}
console.log('sdk ok', measureBytes(w));
