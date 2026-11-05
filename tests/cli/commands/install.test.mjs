import assert from 'node:assert/strict';
import test from 'node:test';
import { install } from '../../../src/cli/commands/install.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('install succeeds and reports through the log', () => {
  const lines = [];
  const silence = console.log;
  console.log = () => {};
  try {
    assert.equal(install(createContext({ argv: ['node', 'tiny', 'install'], log: (line) => lines.push(line) })), 0);
  } finally {
    console.log = silence;
  }
  assert.ok(lines.length > 0);
});

test('a missing suite is an error', () => {
  const ctx = createContext({ log: () => {} });
  assert.equal(install({ ...ctx, config: { ...ctx.config, suite: '/nonexistent' } }), 1);
});
