import assert from 'node:assert/strict';
import test from 'node:test';
import { createContext, logShareResult } from '../../src/cli/context.mjs';

test('the context reads flags and configuration', () => {
  const ctx = createContext({ argv: ['node', 'tiny', 'report', '--share'], log: () => {} });
  assert.equal(ctx.flag('--share'), true);
  assert.equal(ctx.flag('--other'), false);
  assert.equal(ctx.config.product, 'Tiny Footprint');
});

test('share results are logged by how they went', () => {
  const lines = [];
  const log = (line) => lines.push(line);
  logShareResult(log, { emailedViaSmtp: true, to: 't' }, 'Share');
  logShareResult(log, { mailtoOpened: true, to: 't' }, 'Share');
  logShareResult(log, { jsonPath: '/p' }, 'Share');
  assert.match(lines[0], /emailed via SMTP/);
  assert.match(lines[1], /mail client opened/);
  assert.match(lines[2], /not sent.*\/p/);
});

test('a mail link says that the packet still has to be attached', () => {
  const lines = [];
  logShareResult((line) => lines.push(line), { mailtoOpened: true, to: 't', jsonPath: '/p/share.json' }, 'Share');
  assert.match(lines[1], /cannot attach files/);
  assert.match(lines[1], /\/p\/share\.json/);
});

test('the reports folder can be redirected', () => {
  const saved = process.env.TINY_FOOTPRINT_REPORTS_DIR;
  process.env.TINY_FOOTPRINT_REPORTS_DIR = '/tmp/elsewhere';
  try {
    assert.equal(createContext({ log: () => {} }).reports, '/tmp/elsewhere');
  } finally {
    if (saved === undefined) delete process.env.TINY_FOOTPRINT_REPORTS_DIR;
    else process.env.TINY_FOOTPRINT_REPORTS_DIR = saved;
  }
});
