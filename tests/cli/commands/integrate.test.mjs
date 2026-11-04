import assert from 'node:assert/strict';
import test from 'node:test';
import { integrate } from '../../../src/cli/commands/integrate.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('integrate succeeds and reports through the log', () => {
  const lines = [];
  const silence = console.log;
  console.log = () => {};
  try {
    assert.equal(integrate(createContext({ argv: ['node', 'tiny', 'integrate'], log: (line) => lines.push(line) })), 0);
  } finally {
    console.log = silence;
  }
  assert.ok(lines.length > 0);
});
