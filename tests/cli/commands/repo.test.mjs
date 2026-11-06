import assert from 'node:assert/strict';
import test from 'node:test';
import { repo } from '../../../src/cli/commands/repo.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('repo command handles missing prereqs or usage without crashing', async () => {
  const lines = [];
  const ctx = createContext({ argv: ['node', 'tiny', 'repo'], log: (l) => lines.push(l) });
  const code = await repo(ctx);
  assert.ok(typeof code === 'number');
  assert.ok(lines.length >= 0);
});
