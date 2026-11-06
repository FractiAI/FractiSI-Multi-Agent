import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createGitIntegration } from '../../src/platform/git.mjs';
import { createStore } from '../../src/platform/store.mjs';
import { createAgentRegistry } from '../../src/platform/agents.mjs';
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

test('git worktree + integrateComposition commits files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-git-'));
  const store = createStore();
  store.state.project = { root: dir, name: 'sandbox' };
  const agents = createAgentRegistry(store);
  const git = createGitIntegration(store, { useWorktrees: true });
  git.ensureGitRepo(dir);
  const a = agents.register({ name: 'writer' });
  const wt = git.allocateScopedWorkspace(a.id, { cwd: dir, useWorktree: true });
  assert.equal(wt.ok, true, wt.error);
  store.state.contributions = store.state.contributions || new Map();
  // minimal composition record
  store.state.compositions.set('comp1', {
    id: 'comp1',
    contributionIds: ['c1'],
    state: 'validated',
  });
  store.state.contributions.set('c1', {
    id: 'c1',
    agentId: a.id,
    paths: ['hello.txt'],
    files: { 'hello.txt': 'hi\n' },
    state: 'validated',
  });
  const integrated = git.integrateComposition('comp1', { cwd: dir, message: 'test integrate' });
  assert.equal(integrated.ok, true, integrated.error);
  assert.ok(fs.existsSync(path.join(dir, 'hello.txt')));
  assert.ok(integrated.sha);
});
