import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { init } from '../../../src/cli/commands/init.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('init command runs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-cli-'));
  const lines = [];
  const ctx = {
    ...createContext({ argv: ['node', 'tiny', 'init'], log: (l) => lines.push(l) }),
    root: dir,
    reports: path.join(dir, 'reports'),
  };
  const code = init(ctx);
  assert.ok(code === 0 || code === 2);
  assert.ok(lines.length > 0);
});
