import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { captureWorkingTree, partitionPaths } from '../../src/platform/workload-capture.mjs';
import { runRealWorkloadFlow } from '../../src/platform/real-workload-flow.mjs';
import { runTryFlow } from '../../src/platform/try-flow.mjs';

function initRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-wl-'));
  spawnSync('git', ['init'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 't'], { cwd: dir });
  fs.writeFileSync(path.join(dir, 'README.md'), 'base\n');
  spawnSync('git', ['add', '.'], { cwd: dir });
  spawnSync('git', ['commit', '-m', 'i'], { cwd: dir });
  return dir;
}

test('partitionPaths splits a single top-level group', () => {
  const groups = partitionPaths(['a.txt', 'b.txt', 'c.txt']);
  assert.equal(groups.length, 2);
  assert.ok(groups[0].paths.length >= 1);
});

test('captureWorkingTree reads dirty files without cloud token', () => {
  const dir = initRepo();
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/app.js'), 'console.log(1)\n');
  fs.writeFileSync(path.join(dir, 'docs/note.md'), 'hi\n');
  const captured = captureWorkingTree(dir);
  assert.equal(captured.ok, true);
  assert.ok(captured.contributions.length >= 1);
  const files = captured.contributions.flatMap((c) => Object.keys(c.files));
  assert.ok(files.includes('src/app.js'));
});

test('real workload composes + commits without deploy or cloud token', async () => {
  const dir = initRepo();
  fs.writeFileSync(path.join(dir, 'feature.txt'), 'real work\n');
  const result = await runRealWorkloadFlow({
    repoRoot: dir,
    env: {}, // no token
    deploy: false,
    noDeploy: true,
    log: () => {},
  });
  assert.equal(result.ok, true);
  assert.equal(result.deployed, false);
  assert.ok(result.sha);
  assert.ok(result.written?.length >= 1);
  const show = spawnSync('git', ['show', '--name-only', '--pretty=', result.sha], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.match(show.stdout, /feature\.txt/);
});

test('sandbox try-flow can skip deploy', async () => {
  const dir = initRepo();
  const result = await runTryFlow({
    cwd: dir,
    env: {},
    skipDeploy: true,
    log: () => {},
  });
  assert.equal(result.ok, true);
  assert.equal(result.deployed, false);
  assert.ok(result.sha);
});
