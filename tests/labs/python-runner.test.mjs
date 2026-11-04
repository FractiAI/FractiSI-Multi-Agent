import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { LAB_EXIT_NOT_RUN, resolvePython, runLabScript } from '../../src/labs/python-runner.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tf-runner-'));
// A real lab process, written as a Node script so the test needs no Python.
const node = { command: process.execPath, prefixArgs: [] };

function labScript(dir, body) {
  const script = path.join(dir, 'lab.mjs');
  fs.writeFileSync(script, `import fs from 'node:fs';\nconst out = process.argv[process.argv.indexOf('--out') + 1];\n${body}\n`);
  return script;
}

test('the interpreter defaults by platform and an explicit choice wins', () => {
  assert.deepEqual(resolvePython({ platform: 'win32' }), { command: 'py', prefixArgs: ['-3'] });
  assert.deepEqual(resolvePython({ platform: 'darwin' }), { command: 'python3', prefixArgs: [] });
  assert.deepEqual(resolvePython({ explicit: '/x/python', platform: 'win32' }), { command: '/x/python', prefixArgs: [] });
});

test('a missing interpreter is not_run', () => {
  const report = runLabScript({ script: 'x.py', args: [], python: { command: '/nonexistent/python', prefixArgs: [] }, timeoutMs: 5000 });
  assert.equal(report.status, 'not_run');
  assert.equal(report.reason, 'python_unavailable');
});

test('a receipt written by this run passes through as a live pass', () => {
  const script = labScript(tmp(), `fs.writeFileSync(out, JSON.stringify({ ok: true, value: 7 }));`);
  const report = runLabScript({ script, args: [], python: node, timeoutMs: 10_000 });
  assert.equal(report.status, 'pass');
  assert.equal(report.liveRun, true);
  assert.equal(report.value, 7);
});

test('the not-runnable exit code becomes not_run with the lab reason', () => {
  const script = labScript(tmp(), `fs.writeFileSync(out, JSON.stringify({ ok: false, reason: 'no_runtime', detail: 'd' })); process.exit(${LAB_EXIT_NOT_RUN});`);
  const report = runLabScript({ script, args: [], python: node, timeoutMs: 10_000 });
  assert.equal(report.status, 'not_run');
  assert.equal(report.reason, 'no_runtime');
});

test('a lab that fails is a failure, even with a partial receipt', () => {
  const dir = tmp();
  const crash = runLabScript({ script: labScript(dir, `console.error('boom'); process.exit(1);`), args: [], python: node, timeoutMs: 10_000 });
  assert.equal(crash.status, 'fail');
  assert.match(crash.error, /boom/);
  const partial = runLabScript({ script: labScript(dir, `fs.writeFileSync(out, JSON.stringify({ ok: true, x: 1 })); process.exit(1);`), args: [], python: node, timeoutMs: 10_000 });
  assert.equal(partial.status, 'fail');
  assert.equal(partial.ok, false);
});

test('regression: a lab that writes nothing cannot inherit a stale receipt', () => {
  const dir = tmp();
  // A receipt left in the script's folder is what the old adapter would have read.
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({ ok: true, device: 'NVIDIA GeForce GTX 860M' }));
  const script = labScript(dir, `process.exit(0);`);
  const report = runLabScript({ script, args: [], python: node, timeoutMs: 10_000 });
  assert.notEqual(report.status, 'pass');
  assert.equal(report.device, undefined);
});
