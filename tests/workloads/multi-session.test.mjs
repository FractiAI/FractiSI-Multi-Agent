import assert from 'node:assert/strict';
import test from 'node:test';
import { conventionalStore, demoPassed, demoSummaryLines, parseSessionCount, prefixReuseStore, rhymeCohort, runMultiSessionDemo } from '../../src/workloads/multi-session.mjs';

test('session counts parse strictly and fall back to the default', () => {
  assert.equal(parseSessionCount('5'), 5);
  for (const bad of [undefined, 'x', '0', '-2']) assert.equal(parseSessionCount(bad), 12);
});

test('the shared prompt is smaller, grows with sessions, and says it is not a rhyme proof', () => {
  assert.ok(prefixReuseStore(12).bytes < conventionalStore(12).bytes);
  const reduction = (n) => runMultiSessionDemo(n).prefixByteReduction;
  assert.ok(reduction(64) > reduction(2));
  assert.match(prefixReuseStore(2).note, /not a rhyme proof/);
});

test('the rhyme cohort passes its audit, rebuilds exactly and refuses the brick wall', () => {
  const rhyme = rhymeCohort(12);
  assert.equal(rhyme.rhymeAuditPass, true);
  assert.equal(rhyme.brickWallPass, false);
  assert.equal(rhyme.exact, true);
  assert.ok(rhyme.rhymeBytes < rhyme.naiveBytes);
  assert.equal(rhyme.byteReduction, 1 - rhyme.rhymeBytes / rhyme.naiveBytes);
});

test('repeating the demo gives the same bytes', () => {
  assert.equal(rhymeCohort(8).rhymeBytes, rhymeCohort(8).rhymeBytes);
});

test('one session has no saving to speak of, and reports its cohort as not run instead of failing', () => {
  const result = runMultiSessionDemo(1);
  assert.ok(result.prefixByteReduction < 0.05);
  assert.equal(result.holographicRhyme.status, 'not_run');
  assert.equal(demoPassed(result), true);
  assert.match(demoSummaryLines(result)[1], /not run: a rhyme needs at least two sessions/);
});

test('the summary reports both the prefix and the rhyme', () => {
  const [prefix, rhyme] = demoSummaryLines(runMultiSessionDemo(12));
  assert.match(prefix, /prefix-reuse \d+\.\d% · conventional \d+ B → prefix \d+ B/);
  assert.match(rhyme, /rhyme audit true · brick wall false · rhyme bytes \d+ vs naive \d+ · exact true/);
});

test('negative control: a failed audit, a passing brick wall or an inexact rebuild fails the demo', () => {
  const good = runMultiSessionDemo(4);
  assert.equal(demoPassed(good), true);
  for (const change of [{ rhymeAuditPass: false }, { brickWallPass: true }, { exact: false }]) {
    assert.equal(demoPassed({ ...good, holographicRhyme: { ...good.holographicRhyme, ...change } }), false, JSON.stringify(change));
  }
});
