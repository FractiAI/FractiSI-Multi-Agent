import assert from 'node:assert/strict';
import test from 'node:test';
import { createGitIntegration } from '../../src/platform/git.mjs';
import { createStore } from '../../src/platform/store.mjs';
import { REPO_ROOT } from '../../src/core/paths.mjs';

test('git inspect reads the kit repository', () => {
  const store = createStore();
  store.state.project = { root: REPO_ROOT, name: 'kit' };
  const git = createGitIntegration(store);
  const info = git.inspect();
  assert.equal(info.ok, true);
  assert.ok(info.branch);
  assert.ok(info.head);
});
