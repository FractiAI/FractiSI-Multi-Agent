import assert from 'node:assert/strict';
import test from 'node:test';
import { runGitAwarenessBench } from '../../src/platform/git-bench.mjs';

test('git awareness bench reduces failed merges on overlapping workload', () => {
  const lab = runGitAwarenessBench({ agents: 6 });
  assert.equal(lab.ok, true);
  assert.equal(lab.improved, true);
  assert.ok(lab.conventional.failedMerges > 0);
  assert.equal(lab.fractisi.failedMerges, 0);
  assert.ok(lab.fractisi.blockedBeforeGit > 0);
  assert.equal(lab.fractisi.mergeConflicts, 0);
});
