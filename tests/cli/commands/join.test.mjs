import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { join } from '../../../src/cli/commands/join.mjs';
import { repoPath } from '../../../src/core/paths.mjs';

/** Drive the real CLI, answering each prompt as it appears, with no mail path on PATH. */
function runJoin(answers, reportsDir) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [repoPath('scripts/tiny.mjs'), 'join'], {
      env: { ...process.env, TINY_FOOTPRINT_SMTP_HOST: '', PATH: '', TINY_FOOTPRINT_REPORTS_DIR: reportsDir },
    });
    let stdout = '';
    let next = 0;
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (/: $/.test(stdout) && next < answers.length) child.stdin.write(`${answers[next++]}\n`);
    });
    child.on('close', (status) => resolve({ status, stdout }));
  });
}

const reportsDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-join-'));
const answers = (share) => ['Test', 'test@example.com', 'Org', 'Role', 'CPU', 'notes', share];

test('the command is exported', () => {
  assert.equal(typeof join, 'function');
});

test('declining to share sends contact details only and reads no receipts', async () => {
  const dir = reportsDir();
  const { status, stdout } = await runJoin(answers('n'), dir);
  assert.equal(status, 0);
  assert.match(stdout, /No benchmark receipts were read or attached/);
  assert.equal(fs.existsSync(path.join(dir, 'share-packets')), false);
  const record = JSON.parse(fs.readFileSync(path.join(dir, 'validation-join.json'), 'utf8'));
  assert.equal(record.shareResults, false);
  if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(dir, 'validation-join.json')).mode & 0o777, 0o600);
});

test('choosing to share builds a packet from this folder', async () => {
  const dir = reportsDir();
  fs.writeFileSync(path.join(dir, 'empirical_report.md'), 'report');
  const { status, stdout } = await runJoin(answers('y'), dir);
  assert.equal(status, 0);
  assert.match(stdout, /Packet on disk/);
  assert.ok(fs.readdirSync(path.join(dir, 'share-packets')).length > 0);
});
