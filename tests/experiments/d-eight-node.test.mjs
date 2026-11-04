import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildEightNodeWorkload, experimentD_eightNode } from '../../src/experiments/d-eight-node.mjs';

const golden = JSON.parse(readFileSync(new URL('../fixtures/golden-experiments-0dcf9d2.json', import.meta.url), 'utf8'));

test('output is byte-identical to the result captured before modularization', () => {
  assert.equal(JSON.stringify(experimentD_eightNode()), JSON.stringify(golden.D));
});

test('the same seed gives the same workload and another seed gives another', () => {
  assert.equal(JSON.stringify(buildEightNodeWorkload(1).tiny), JSON.stringify(buildEightNodeWorkload(1).tiny));
  assert.notEqual(JSON.stringify(buildEightNodeWorkload(1).tiny), JSON.stringify(buildEightNodeWorkload(2).tiny));
});

test('the experiment reports its own identity and passes its bar', () => {
  const result = experimentD_eightNode();
  assert.equal(result.id, 'D_eight_node_broadcast');
  assert.equal(result.pass, true);
  assert.ok(result.tinyBytes < result.baselineBytes);
});
