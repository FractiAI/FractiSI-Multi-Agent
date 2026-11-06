import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { compose } from '../../../src/cli/commands/compose.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('compose command runs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-cli-'));
  const lines = [];
  const ctx = {
    ...createContext({ argv: ['node', 'tiny', 'compose'], log: (l) => lines.push(l) }),
    root: dir,
    reports: path.join(dir, 'reports'),
  };
  const code = compose(ctx);
  // Without init → 1; with empty contributions after init → 0; incompatible → 2
  assert.ok(code === 0 || code === 1 || code === 2);
  assert.ok(lines.length > 0);
});
