import assert from 'node:assert/strict';
import test from 'node:test';
import { ask, isYes, openPrompt } from '../../src/cli/prompt.mjs';

test('only an explicit yes counts as consent', () => {
  for (const answer of ['y', 'Y', 'yes', 'YES']) assert.equal(isYes(answer), true, answer);
  for (const answer of ['', 'n', 'no', 'maybe', 'yep', 'N']) assert.equal(isYes(answer), false, answer);
});

test('an empty answer falls back to the default and whitespace is trimmed', async () => {
  const replying = (reply) => ({ question: async () => reply });
  assert.equal(await ask(replying('  value '), 'Q'), 'value');
  assert.equal(await ask(replying('   '), 'Q', 'default'), 'default');
});

test('the prompt factory is a function', () => {
  assert.equal(typeof openPrompt, 'function');
});
