/**
 * Mirrors `src/expeditions/riemann-zeta23-llm.mjs`.
 * Unit tests only — no live Groq calls; never assert on key values.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GROQ_DEFAULT_MODEL,
  GROQ_FALLBACK_MODELS,
  ENGINE_PROMPT_ID,
  buildFractisiInventAwareness,
  buildTinyFootprintOctaveEnginePrompt,
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

  it('separates engine processing prompt from shared-world data', () => {
    const engine = buildTinyFootprintOctaveEnginePrompt();
    assert.match(engine, /processing instructions/i);
    assert.match(engine, /Infinite Octave/);
    assert.equal(engine.includes(ENGINE_PROMPT_ID.split('.').slice(-1)[0]) || engine.includes('promptId='), true);

    const proofs = new Map([
      ['two_thirds_on_critical_line', { closed: false, body: 'aesop', tacticId: 'llm:test' }],
      ['five_sixths_distinct', { closed: false, body: 'sorry', tacticId: 'sorry_hold' }],
    ]);
    const data = buildFractisiInventAwareness({
      platform: {
        banner: 'FractiSI · FractiSI Multi-Agent 0.2.0 · core tech Tiny Footprint',
        version: '0.2.0',
        status: () => ({ agents: 2, activeAgents: 2, tasks: 1, contributions: 1, compositions: 0 }),
        store: {
          snapshot: () => ({
            agents: [{ name: 'invent-thmA', status: 'active', framework: 'expedition-zeta23-invent-llm' }],
            contributions: [{ id: 'c1', summary: 'llm invent round 1 invent-thmA', state: 'submitted' }],
          }),
        },
      },
      agentName: 'invent-thmA',
      theorem: 'two_thirds_on_critical_line',
      proofs,
      attempts: [{ round: 1, agent: 'invent-thmBC', theorem: 'five_sixths_distinct', strategy: 'llm:test', ok: true }],
      round: 2,
      priorError: 'error: build failed',
    });
    assert.match(data, /Shared-world DATA/);
    assert.match(data, /process through Tiny Footprint \/ Infinite Octave engine/);
    assert.match(data, /two_thirds_on_critical_line/);
    assert.match(data, /Shared lake build feedback/);
    assert.equal(data.includes('gsk_'), false);
  });
});
