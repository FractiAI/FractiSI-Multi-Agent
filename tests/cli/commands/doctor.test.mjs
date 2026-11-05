import assert from 'node:assert/strict';
import test from 'node:test';
import { doctor } from '../../../src/cli/commands/doctor.mjs';
import { createContext } from '../../../src/cli/context.mjs';

test('doctor succeeds and reports through the log', () => {
  const lines = [];
  const silence = console.log;
  console.log = () => {};
  try {
    assert.equal(doctor(createContext({ argv: ['node', 'tiny', 'doctor'], log: (line) => lines.push(line) })), 0);
  } finally {
    console.log = silence;
  }
  assert.ok(lines.length > 0);
});

test('doctor says how labs behave when no GPU is present', () => {
  const lines = [];
  doctor(createContext({ log: (line) => lines.push(line) }));
  assert.ok(lines.some((line) => /^gpu: /.test(line)));
  assert.ok(lines.some((line) => /share recipient/.test(line)));
});
