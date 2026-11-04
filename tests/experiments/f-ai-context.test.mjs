import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildAiContextWorkload, experimentF_aiContextProxy } from '../../src/experiments/f-ai-context.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-0dcf9d2.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentF_aiContextProxy()), JSON.stringify(golden.F));
});

test('the same seed gives the same workload and another seed gives another', () => {
  assert.equal(JSON.stringify(buildAiContextWorkload(1).tiny), JSON.stringify(buildAiContextWorkload(1).tiny));
  assert.notEqual(JSON.stringify(buildAiContextWorkload(1).tiny), JSON.stringify(buildAiContextWorkload(2).tiny));
});

test('the experiment reports its own identity and passes its bar', () => {
  const result = experimentF_aiContextProxy();
  assert.equal(result.id, 'F_ai_context_proxy');
  assert.equal(result.pass, true);
  assert.ok(result.tinyBytes < result.baselineBytes);
});
