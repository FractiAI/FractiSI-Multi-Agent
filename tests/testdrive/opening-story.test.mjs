import assert from 'node:assert/strict';
import test from 'node:test';
import { OPENING_STORY, openingStoryLines } from '../../src/testdrive/opening-story.mjs';

test('opening story is the restroom valet awareness story', () => {
  const text = OPENING_STORY.tell.join(' ');
  assert.match(text, /restroom valet/i);
  assert.match(text, /aware/i);
  assert.equal(OPENING_STORY.productName, 'FractiSI Multi-Agent');
  assert.match(OPENING_STORY.honesty, /not a controlled psych study/i);
});

test('story lines render', () => {
  assert.ok(openingStoryLines().length > 3);
});
