import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { RSS_INGEST, measureRss } from '../../../src/benchmarks/measured/rss-measure.mjs';
import { runChild } from '../../../src/benchmarks/measured/child-runner.mjs';
import { getWorkload } from '../../../src/benchmarks/measured/session-stores.mjs';

const wires = getWorkload('ai_context').wires({ sessions: 6, seed: 1, turns: 2 });
const buffer = Buffer.from(wires.join('\n'));

test('streaming ingest holds the same sessions as the batch stores', () => {
  assert.deepEqual(RSS_INGEST.duplicated(buffer), wires.map((wire) => JSON.parse(wire)));
  const aliased = RSS_INGEST.aliased(buffer);
  assert.equal(aliased[0].messages[0], aliased[5].messages[0]);
  assert.deepEqual(aliased, wires.map((wire) => JSON.parse(wire)));
  const tiny = RSS_INGEST.tiny(buffer);
  assert.equal(tiny.sessions.length, 6);
  assert.deepEqual(tiny.catalog.get('tpl_sys').pattern, JSON.parse(wires[0]).messages[0]);
});

test('a child reads RSS and leaves the temporary path out of its result', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-rss-'));
  const wiresPath = path.join(dir, 'wires.jsonl');
  fs.writeFileSync(wiresPath, wires.join('\n'));
  const result = runChild({ kind: 'rss', condition: 'tiny', wiresPath, trial: 0 });
  assert.equal(result.heldSessions, wires.length);
  assert.ok(result.peakRssBytes > 0);
  assert.equal('wiresPath' in result, false);
});

test('an unknown store and a missing collector are refused', () => {
  assert.throws(() => runChild({ kind: 'rss', condition: 'nope', wiresPath: 'x', trial: 0 }), /unknown condition/);
  if (typeof globalThis.gc !== 'function') assert.throws(() => measureRss({ condition: 'tiny', wiresPath: 'x' }), /expose-gc/);
});
