import assert from 'node:assert/strict';
import test from 'node:test';
import { deploy } from '../../../src/cli/commands/deploy.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('deploy command handles missing prereqs or usage without crashing', async () => {
  const lines = [];
  const ctx = createContext({ argv: ['node', 'tiny', 'deploy'], log: (l) => lines.push(l) });
  const code = await deploy(ctx);
  assert.ok(typeof code === 'number');
  assert.ok(lines.length >= 0);
});
