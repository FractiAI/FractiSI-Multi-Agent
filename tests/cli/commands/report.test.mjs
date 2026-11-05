import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { report, writeReport } from '../../../src/cli/commands/report.mjs';
import { createContext } from '../../../src/cli/context.mjs';

const context = (argv = []) => {
  const lines = [];
  const reports = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-cli-'));
  return { ctx: { ...createContext({ argv: ['node', 'tiny', 'report', ...argv], log: (line) => lines.push(line) }), reports }, lines, reports };
};

test('report writes the HTML and sends nothing without --share', () => {
  const { ctx, lines, reports } = context();
  assert.equal(report(ctx), 0);
  assert.ok(fs.existsSync(path.join(reports, 'customer-benchmark.html')));
  assert.ok(lines.some((line) => line.startsWith('Tip:')));
  assert.equal(fs.existsSync(path.join(reports, 'share-packets')), false);
});

test('writeReport returns the path it wrote', () => {
  const { ctx } = context();
  assert.ok(fs.existsSync(writeReport(ctx)));
});
