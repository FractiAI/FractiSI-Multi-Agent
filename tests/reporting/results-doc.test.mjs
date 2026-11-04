import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { PATHS, repoPath } from '../../src/core/paths.mjs';
import { renderEvidenceBlock, renderResultsDoc, replaceEvidenceBlock } from '../../src/reporting/results-doc.mjs';

const summary = JSON.parse(fs.readFileSync(`${PATHS.outputData}/analysis_summary.json`, 'utf8'));

test('the page names its source and every section', () => {
  const text = renderResultsDoc(summary);
  assert.match(text, /Do not edit/);
  for (const heading of ['Representation bytes', 'Live V8 heap', 'Resident set size', 'Materialization latency', 'Real models', 'Claim ledger']) {
    assert.match(text, new RegExp(`## ${heading}`));
  }
});

test('the committed page matches the committed data', () => {
  assert.equal(fs.readFileSync(repoPath('docs/benchmarks/RESULTS.md'), 'utf8'), renderResultsDoc(summary));
});

test('the evidence block states what is not established, and names the tier of each line', () => {
  const block = renderEvidenceBlock(summary);
  assert.match(block, /Not established/);
  assert.match(block, /\(deterministic\)/);
  assert.match(block, /\(measured/);
});

test('a host with no real-model runs gets a block without those lines', () => {
  const block = renderEvidenceBlock({ ...summary, llm: [] });
  assert.doesNotMatch(block, /Real models/);
  assert.match(block, /Live memory/);
});

test('only the marked block in a README changes', () => {
  const readme = 'before\n<!-- BEGIN GENERATED EVIDENCE -->\nold\n<!-- END GENERATED EVIDENCE -->\nafter\n';
  const updated = replaceEvidenceBlock(readme, 'new');
  assert.match(updated, /^before\n/);
  assert.match(updated, /\nnew\n/);
  assert.match(updated, /after\n$/);
  assert.doesNotMatch(updated, /old/);
});

test('negative control: a README with no markers is refused', () => {
  assert.throws(() => replaceEvidenceBlock('no markers', 'x'), /no generated evidence block/);
});

test('the committed README block matches the committed data', () => {
  const readme = fs.readFileSync(repoPath('README.md'), 'utf8');
  assert.equal(replaceEvidenceBlock(readme, renderEvidenceBlock(summary)), readme);
});
