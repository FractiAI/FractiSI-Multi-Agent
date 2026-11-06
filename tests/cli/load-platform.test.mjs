import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadPlatform } from '../../src/cli/load-platform.mjs';
import { createContext } from '../../src/cli/context.mjs';

test('loadPlatform creates state under .fractisi', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractisi-load-'));
  const platform = loadPlatform({ ...createContext({ log: () => {} }), root: dir });
  assert.equal(platform.product, 'FractiSI Multi-Agent');
  platform.persist();
  assert.ok(fs.existsSync(path.join(dir, '.fractisi', 'state.json')));
});
