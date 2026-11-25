/**
 * Mirrors `src/expeditions/riemann-zeta23-engine-prompt.mjs`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINE_PROMPT_ID,
  ENGINE_SHELF_PINS,
  INFINITE_OCTAVE_PAPER_CORPUS,
  buildTinyFootprintOctaveEnginePrompt,
} from '../../src/expeditions/riemann-zeta23-engine-prompt.mjs';

describe('riemann zeta23 Infinite Octave ENGINE_SHELF invent prompt', () => {
  it('exports ENGINE_SHELF.v2 prompt id and shelf pins', () => {
    assert.match(ENGINE_PROMPT_ID, /infinite-octave\.engine-shelf\.invent\.v2/);
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 52));
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 53));
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 54));
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 55));
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 56));
    assert.ok(ENGINE_SHELF_PINS.some((p) => p.id === 57));
    assert.ok(INFINITE_OCTAVE_PAPER_CORPUS.length >= 15);
  });

  it('builds large-engine processing instructions citing shelf + papers', () => {
    const text = buildTinyFootprintOctaveEnginePrompt();
    assert.ok(text.length > 4000, 'engine prompt must be substantial, not a thin paraphrase');
    assert.match(text, /ENGINE_SHELF #52/);
    assert.match(text, /ENGINE_SHELF #53/);
    assert.match(text, /ENGINE_SHELF #54/);
    assert.match(text, /ENGINE_SHELF #55/);
    assert.match(text, /ENGINE_SHELF #56/);
    assert.match(text, /ENGINE_SHELF #57/);
    assert.match(text, /Principal Rhyme Theorem/);
    assert.match(text, /LINEAR \/ FLAT \/ AWARE/);
    assert.match(text, /operate AWARE/);
    assert.match(text, /Digits × Octaves 01–99/);
    assert.match(text, /Tiny Footprint/);
    assert.match(text, /Tiny Gateway/);
    assert.match(text, /Infinite Octaves/);
    assert.match(text, /Net Zero/);
    assert.match(text, /library\/papers\/principal-rhyme-theorem/);
    assert.match(text, /library\/papers\/universal-rhyme-wet-lab/);
    assert.match(text, /library\/papers\/compositional-wet-lab-scale/);
    assert.match(text, /library\/papers\/infinite-octaves-omniversal/);
    assert.match(text, /library\/papers\/tiny-gateway-rhyming-templates/);
    assert.match(text, /library\/papers\/holographic-rhyme/);
    assert.match(text, /processing instructions/i);
    assert.doesNotMatch(text, /two_thirds_on_critical_line/);
    assert.equal(text.includes('gsk_'), false);
  });
});
