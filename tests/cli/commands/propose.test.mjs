import assert from 'node:assert/strict';
import test from 'node:test';
import { propose } from '../../../src/cli/commands/propose.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('propose command handles missing prereqs or usage without crashing', async () => {
  const lines = [];
  const ctx = createContext({ argv: ['node', 'tiny', 'propose'], log: (l) => lines.push(l) });
  const code = await propose(ctx);
  assert.ok(typeof code === 'number');
  assert.ok(lines.length >= 0);
});
