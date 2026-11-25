/**
 * Mirrors `src/expeditions/riemann-zeta23-engine-prompt.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINE_PROMPT_ID,
  buildTinyFootprintOctaveEnginePrompt,
} from '../../src/expeditions/riemann-zeta23-engine-prompt.mjs';

describe('riemann zeta23 Tiny Footprint / Infinite Octave engine prompt', () => {
  it('exports a stable engine prompt id', () => {
    assert.match(ENGINE_PROMPT_ID, /tiny-footprint\.infinite-octave/);
  });

  it('builds processing instructions (how to process), not a mere status dump', () => {
    const text = buildTinyFootprintOctaveEnginePrompt();
    assert.match(text, /Tiny Gateway/);
    assert.match(text, /Tiny Footprint/);
    assert.match(text, /Infinite Octave/);
    assert.match(text, /Net Zero/);
    assert.match(text, /processing instructions/i);
    assert.match(text, /Four pillars/);
    assert.match(text, /Repeating/);
    assert.match(text, /Self-Similar/);
    assert.match(text, /Self-Correcting/);
    assert.match(text, /Recursive/);
    assert.match(text, /delta/i);
    assert.match(text, /N private full copies/i);
    // Must instruct HOW to process — not only list theorems
    assert.doesNotMatch(text, /two_thirds_on_critical_line/);
    assert.equal(text.includes('gsk_'), false);
  });
});
