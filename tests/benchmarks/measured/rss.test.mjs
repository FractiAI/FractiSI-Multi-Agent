import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import test from 'node:test';
import { runRssBenchmark } from '../../../src/benchmarks/measured/rss.mjs';

test('the design covers every store and trial and removes its temporary file', () => {
  const before = new Set(fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('tiny-footprint-rss-')));
  const samples = runRssBenchmark(
    { workload: 'ai_context', turns: 1, sessions: 8, trials: 2, conditions: ['duplicated', 'tiny'] },
    { primary: 1, orderShuffle: 2 },
  );
  assert.equal(samples.length, 4);
  assert.ok(samples.every((s) => s.kind === 'rss' && s.sessions === 8 && !('wiresPath' in s)));
  const after = fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('tiny-footprint-rss-'));
  assert.ok(after.every((name) => before.has(name)));
});
