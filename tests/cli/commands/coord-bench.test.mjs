import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { coordBench } from '../../../src/cli/commands/coord-bench.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('coord-bench command runs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-cli-'));
  const lines = [];
  const ctx = {
    ...createContext({ argv: ['node', 'tiny', 'coord-bench'], log: (l) => lines.push(l) }),
    root: dir,
    reports: path.join(dir, 'reports'),
  };
  const code = coordBench(ctx);
  assert.ok(code === 0 || code === 2);
  assert.ok(lines.length > 0);
});
