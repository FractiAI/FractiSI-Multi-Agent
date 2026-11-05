import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompressionHookRegistry, nestedDeltaFoldHook, octaveScaleCapHook, workingSetBoundHook } from '../../../src/engine/context/hooks.mjs';

test('hooks run in registration order and record that they fired', () => {
  const registry = createCompressionHookRegistry();
  registry.registerHook('add', { onEncode: (value) => ({ ...value, a: 1 }), onReconstruct: (value) => ({ ...value, r: 1 }) });
  registry.registerHook('more', { onEncode: (value) => ({ ...value, b: value.a + 1 }) });
  assert.deepEqual(registry.applyEncodeHooks({}), { a: 1, b: 2 });
  assert.deepEqual(registry.applyReconstructHooks({}), { r: 1 });
  assert.deepEqual(registry.list(), ['add', 'more']);
  assert.deepEqual(registry.fired().map((f) => `${f.hook}:${f.phase}`), ['add:encode', 'more:encode', 'add:reconstruct']);
  registry.clearFired();
  assert.deepEqual(registry.fired(), []);
});

test('a hook needs a name and handlers', () => {
  assert.throws(() => createCompressionHookRegistry().registerHook('', {}), /invalid hook/);
});

test('the fold hook replaces a value with its delta from the pattern', () => {
  const hook = nestedDeltaFoldHook({ a: 1, b: 2 });
  const folded = hook.onEncode({ delta: {}, value: { a: 1, b: 3 } });
  assert.deepEqual(folded.delta, { b: 3 });
  assert.equal(folded.folded, true);
  assert.equal(folded.value, undefined);
  assert.deepEqual(hook.onEncode({ delta: {} }), { delta: {} });
});

test('the depth cap marks what it caps and leaves the rest alone', () => {
  const hook = octaveScaleCapHook({ maxDepth: 2 });
  assert.deepEqual(hook.onEncode({ nestDepth: 5 }), { nestDepth: 2, capped: true });
  assert.deepEqual(hook.onEncode({ nestDepth: 1 }), { nestDepth: 1 });
});

test('meters report bytes, and the bound says when a snapshot is over budget', () => {
  const registry = createCompressionHookRegistry();
  registry.registerHook('bound', workingSetBoundHook({ maxBytes: 5 }));
  const meters = registry.collectMeters({ text: 'long enough to exceed it' });
  assert.equal(meters.bound.overBudget, true);
  assert.equal(workingSetBoundHook({ maxBytes: 1000 }).onMeter({}).overBudget, false);
});
