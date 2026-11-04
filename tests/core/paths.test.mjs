import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { PATHS, REPO_ROOT, repoPath } from '../../src/core/paths.mjs';

test('the repository root is the folder holding package.json', () => {
  assert.ok(fs.existsSync(path.join(REPO_ROOT, 'package.json')));
});

test('repoPath joins under the root', () => {
  assert.equal(repoPath('a', 'b'), path.join(REPO_ROOT, 'a', 'b'));
});

test('tracked inputs exist where the path table says', () => {
  for (const key of ['config', 'packageJson', 'plan', 'suite', 'historicalReceipts', 'manuscriptSource', 'webDocs', 'adaptersGuide', 'labScripts']) {
    assert.ok(fs.existsSync(PATHS[key]), `${key}: ${PATHS[key]}`);
  }
});
