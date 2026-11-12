import assert from 'node:assert/strict';
import test from 'node:test';
import { runGitAwarenessBench, buildGitLabWorkload } from '../../src/platform/git-bench.mjs';

test('fixed git lab workload always overlaps router.mjs for first three agents', () => {
  const w = buildGitLabWorkload(6);
  assert.equal(w.tasks.length, 6);
  assert.ok(w.tasks.slice(0, 3).every((t) => t.paths.includes('router.mjs')));
});

test('portable git awareness bench reduces failed merges on overlapping workload', async () => {
  const lab = await runGitAwarenessBench({ agents: 6, engine: 'portable' });
  assert.equal(lab.ok, true);
  assert.equal(lab.engine, 'portable');
  assert.equal(lab.conclusive, true);
  assert.equal(lab.improved, true);
  assert.ok(lab.conventional.failedMerges >= 2);
  assert.equal(lab.fractisi.failedMerges, 0);
  assert.ok(lab.fractisi.blockedBeforeGit >= 2);
  assert.equal(lab.fractisi.mergeConflicts, 0);
});
