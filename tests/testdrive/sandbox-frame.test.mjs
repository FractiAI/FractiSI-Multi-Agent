import assert from 'node:assert/strict';
import test from 'node:test';
import { SANDBOX_FRAME, sandboxFrameLines } from '../../src/testdrive/sandbox-frame.mjs';

test('sandbox frame names Base Mainnet bedrock and Syntheverse Sandbox', () => {
  const text = JSON.stringify(SANDBOX_FRAME);
  assert.match(text, /Base Mainnet/);
  assert.match(text, /Syntheverse Sandbox/);
  assert.match(text, /buy anything/i);
});

test('sandbox lines render', () => {
  assert.ok(sandboxFrameLines().length > 2);
});
