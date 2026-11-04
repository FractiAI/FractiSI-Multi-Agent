import assert from 'node:assert/strict';
import { registerTemplate, sessionDelta, reconstruct, measureBytes } from '../../tiny-footprint/sdk/index.mjs';

const t = registerTemplate('sys-v1', { policy: 'shared' });
const d = sessionDelta('sys-v1', { turn: 1 });
const w = reconstruct('sys-v1', d.delta);

assert.equal(t.templateId, 'sys-v1');
assert.equal(d.templateId, 'sys-v1');
assert.equal(d.kind, 'session_delta');
assert.equal(w.workingSet.selective, true);
assert.equal(measureBytes({ text: 'é' }), Buffer.byteLength(JSON.stringify({ text: 'é' }), 'utf8'));
assert.throws(() => measureBytes(undefined), TypeError);

console.log('sdk ok', measureBytes(w));
