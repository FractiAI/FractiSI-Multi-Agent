import assert from 'node:assert/strict';
import test from 'node:test';
import { RHYME_DEFINITION, RHYME_FOUR_PILLARS, rhymeDefinitionLines } from '../../src/testdrive/rhyme-definition.mjs';

test('rhyme gate has exactly the four locked pillars', () => {
  assert.deepEqual(RHYME_FOUR_PILLARS.map((p) => p.id), ['repeating', 'self_similar', 'self_correcting', 'recursive']);
});

test('rhyme is rooted at Net Zero and excludes cache-only reuse', () => {
  assert.match(RHYME_DEFINITION.gate, /Net Zero/);
  assert.match(RHYME_DEFINITION.notARhyme.join(' '), /prefix-cache/i);
  assert.match(RHYME_DEFINITION.symposiumKinship, /not framework identity/i);
});

test('definition lines list every pillar', () => {
  const text = rhymeDefinitionLines().join('\n');
  for (const p of RHYME_FOUR_PILLARS) assert.ok(text.includes(p.name), p.name);
});
