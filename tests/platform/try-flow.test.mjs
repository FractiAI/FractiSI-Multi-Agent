import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runTryFlow } from '../../src/platform/try-flow.mjs';

test('try-flow fails closed without cloud token', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-try-'));
  spawnSync('git', ['init'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
  fs.writeFileSync(path.join(dir, 'README.md'), 'x\n');
  spawnSync('git', ['add', '.'], { cwd: dir });
  spawnSync('git', ['commit', '-m', 'i'], { cwd: dir });
  const result = await runTryFlow({ cwd: dir, env: {}, log: () => {} });
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'prereqs');
});
