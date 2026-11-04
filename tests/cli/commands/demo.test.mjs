import assert from 'node:assert/strict';
import test from 'node:test';
import { demo } from '../../../src/cli/commands/demo.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('demo succeeds and reports through the log', () => {
  const lines = [];
  const silence = console.log;
  console.log = () => {};
  try {
    assert.equal(demo(createContext({ argv: ['node', 'tiny', 'demo'], log: (line) => lines.push(line) })), 0);
  } finally {
    console.log = silence;
  }
  assert.ok(lines.length > 0);
});
