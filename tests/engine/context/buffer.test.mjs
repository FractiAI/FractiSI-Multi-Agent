import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecursiveContextBuffer } from '../../../src/engine/context/buffer.mjs';
import { createCompressionHookRegistry, octaveScaleCapHook } from '../../../src/engine/context/hooks.mjs';
import { mergeDelta } from '../../../src/engine/rhyming/codec.mjs';

const pattern = { kind: 'turn', role: 'user', text: '', meta: { session: 's1', i: 0 } };
const turn = (i) => ({ kind: 'turn', role: i % 2 ? 'assistant' : 'user', text: `message ${i}`, meta: { session: 's1', i } });

test('history is bounded by the level count, and older turns are folded', () => {
  const buffer = createRecursiveContextBuffer({ maxLevels: 3, pattern });
  for (let i = 0; i < 10; i++) buffer.pushTurn(turn(i));
  const meters = buffer.snapshotMeters();
  assert.equal(buffer.size(), 3);
  assert.equal(meters.levels, 3);
  assert.ok(meters.foldedBytes < meters.allRawWouldBe);
  assert.ok(meters.foldRatio > 0);
});

test('negative control: history beyond the retained window is gone, so this is not lossless context', () => {
  const buffer = createRecursiveContextBuffer({ maxLevels: 3, pattern });
  for (let i = 0; i < 10; i++) buffer.pushTurn(turn(i));
  assert.deepEqual(buffer.reconstructWindow(mergeDelta).map((t) => t.meta.i), [7, 8, 9]);
});

test('retained turns reconstruct exactly', () => {
  const buffer = createRecursiveContextBuffer({ maxLevels: 4, pattern });
  for (let i = 0; i < 4; i++) buffer.pushTurn(turn(i));
  assert.deepEqual(buffer.reconstructWindow(mergeDelta), [turn(0), turn(1), turn(2), turn(3)]);
  assert.equal(buffer.exactWithinRetained(mergeDelta), true);
});

test('with no pattern, turns are kept whole', () => {
  const buffer = createRecursiveContextBuffer({ maxLevels: 2 });
  buffer.pushTurn(turn(0));
  buffer.pushTurn(turn(1));
  assert.equal(buffer.reconstructWindow(mergeDelta).length, 2);
});

test('a raw copy is held, so changing the caller\'s object changes nothing here', () => {
  const buffer = createRecursiveContextBuffer({ maxLevels: 2, pattern });
  const mine = turn(0);
  buffer.pushTurn(mine);
  mine.text = 'changed';
  assert.equal(buffer.reconstructWindow(mergeDelta)[0].text, 'message 0');
});

test('hooks run on the folded form and appear in the meters', () => {
  const hooks = createCompressionHookRegistry();
  hooks.registerHook('cap', octaveScaleCapHook({ maxDepth: 1 }));
  const buffer = createRecursiveContextBuffer({ maxLevels: 2, pattern, hooks });
  for (let i = 0; i < 3; i++) buffer.pushTurn(turn(i));
  const meters = buffer.snapshotMeters();
  assert.ok(meters.hooksFired.some((fired) => fired.hook === 'cap'));
  assert.equal(meters.hookMeters.cap.kind, 'octave_scale_cap');
});
