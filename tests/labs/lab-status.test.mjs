import assert from 'node:assert/strict';
import test from 'node:test';
import { LAB_STATUS, notRunReport } from '../../src/labs/lab-status.mjs';

test('not_run is its own outcome and carries a reason', () => {
  assert.deepEqual(new Set(Object.values(LAB_STATUS)), new Set(['pass', 'fail', 'not_run']));
  assert.deepEqual(notRunReport('x', 'y'), { ok: false, status: 'not_run', liveRun: false, reason: 'x', detail: 'y' });
  assert.equal('detail' in notRunReport('x'), false);
});
