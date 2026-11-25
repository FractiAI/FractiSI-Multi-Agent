/**
 * Mirrors `src/expeditions/riemann-zeta23-llm.mjs`.
 * Unit tests only — no live Groq calls; never assert on key values.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GROQ_DEFAULT_MODEL,
  GROQ_FALLBACK_MODELS,
  extractLeanTacticBody,
  groqKeyPresent,
  listLlmKeysPresent,
} from '../../src/expeditions/riemann-zeta23-llm.mjs';

describe('riemann zeta23 llm helpers', () => {
  it('exports a default Groq model and fallbacks', () => {
    assert.equal(typeof GROQ_DEFAULT_MODEL, 'string');
    assert.ok(GROQ_DEFAULT_MODEL.length > 0);
    assert.ok(Array.isArray(GROQ_FALLBACK_MODELS));
    assert.ok(GROQ_FALLBACK_MODELS.length >= 1);
  });

  it('reports key presence as boolean without echoing values', () => {
    const present = groqKeyPresent();
    assert.equal(typeof present, 'boolean');
    const keys = listLlmKeysPresent();
    assert.equal(typeof keys.GROQ_API_KEY, 'boolean');
    assert.equal(typeof keys.ANTHROPIC_API_KEY, 'boolean');
    assert.equal(typeof keys.OPENAI_API_KEY, 'boolean');
    // Never leak secret material into assertions / objects under test.
    assert.equal(JSON.stringify(keys).includes('gsk_'), false);
  });

  it('extracts a plain Lean tactic body', () => {
    assert.equal(extractLeanTacticBody('aesop'), 'aesop');
    assert.equal(extractLeanTacticBody('intro ε hε\nexact ⟨0, fun T _ => by aesop⟩'), 'intro ε hε\nexact ⟨0, fun T _ => by aesop⟩');
  });

  it('strips fences and theorem wrappers', () => {
    const fenced = '```lean\ntheorem foo : True := by\n  aesop\n```';
    assert.equal(extractLeanTacticBody(fenced), 'aesop');
    const wrapped = 'theorem bar : True := by\nsimp';
    assert.equal(extractLeanTacticBody(wrapped), 'simp');
  });

  it('rejects empty, sorry-only, and English prose dumps', () => {
    assert.equal(extractLeanTacticBody(''), null);
    assert.equal(extractLeanTacticBody('sorry'), null);
    assert.equal(
      extractLeanTacticBody(
        'We could use False.elim. However therefore thus we cannot invent a real proof. Actually better: wait.',
      ),
      null,
    );
  });
});
