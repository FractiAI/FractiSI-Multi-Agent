import assert from 'node:assert/strict';
import test from 'node:test';
import { NODE_COUNT, conventionalEightCopies, reconstructNodeView, tinySharedBroadcast } from '../../../src/engine/broadcast/eight-node.mjs';

const story = { id: 's', body: 'text', meta: { v: 1 } };

test('the conventional arm holds an independent copy per node', () => {
  const copies = conventionalEightCopies(story);
  assert.equal(copies.length, NODE_COUNT);
  assert.notEqual(copies[0].story, copies[1].story);
});

test('the shared arm holds one story and references to it', () => {
  const tiny = tinySharedBroadcast(story);
  assert.equal(tiny.nodes.length, NODE_COUNT);
  assert.ok(tiny.nodes.every((node) => node.originRef === 'origin' && !('story' in node)));
});

test('a node view reconstructs exactly the conventional copy, as independent data', () => {
  const tiny = tinySharedBroadcast(story);
  const copies = conventionalEightCopies(story);
  for (let i = 0; i < NODE_COUNT; i++) assert.deepEqual(reconstructNodeView(tiny, i), copies[i]);
  reconstructNodeView(tiny, 0).story.meta.v = 2;
  assert.equal(tiny.origin.story.meta.v, 1);
});
