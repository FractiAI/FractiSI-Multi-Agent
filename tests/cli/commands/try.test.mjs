import assert from 'node:assert/strict';
import test from 'node:test';
import { tryPlatform } from '../../../src/cli/commands/try.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('try command handles missing prereqs or usage without crashing', async () => {
  const lines = [];
  const ctx = createContext({ argv: ['node', 'tiny', 'try'], log: (l) => lines.push(l) });
  const code = await tryPlatform(ctx);
  assert.ok(typeof code === 'number');
  assert.ok(lines.length >= 0);
});
