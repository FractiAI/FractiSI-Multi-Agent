import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { repoPath } from '../../../src/core/paths.mjs';
import { share } from '../../../src/cli/commands/share.mjs';

test('the command is exported', () => {
  assert.equal(typeof share, 'function');
});

test('answering no cancels and sends nothing', () => {
  const run = spawnSync(process.execPath, [repoPath('scripts/tiny.mjs'), 'share'], { input: 'n\n', encoding: 'utf8', timeout: 30_000 });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Share cancelled — nothing sent/);
});
