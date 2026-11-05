import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { PATHS, repoPath } from '../../src/core/paths.mjs';
import { renderEvidenceBlock, renderResultsDoc, replaceEvidenceBlock, verdictFacts } from '../../src/reporting/results-doc.mjs';

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

test('the short answer states what works and what does not, with values from the data', () => {
  const page = renderResultsDoc(summary);
  const facts = verdictFacts(summary);
  assert.match(page, /## The short answer/);
  assert.ok(page.indexOf('## The short answer') < page.indexOf('## Representation bytes'));
  for (const value of [facts.prefill, facts.kvDevice, facts.kvWithWeights, facts.promptTiny, facts.promptAliased, facts.shapeTiny, facts.shapeAliased, facts.shapeCompact, facts.rebuild, facts.rebuildNoClone]) {
    assert.ok(page.includes(value), value);
  }
  assert.match(renderEvidenceBlock(summary), /\*\*In short:\*\*/);
});

test('negative control: an engine that beats a plain reference removes the short answer', () => {
  const changed = structuredClone(summary);
  const largest = Math.max(...changed.heap.rows.map((r) => r.sessions));
  changed.heap.rows.find((r) => r.workload === 'rhyme_differing' && r.condition === 'tiny' && r.sessions === largest).heapReduction.estimate = 0.9;
  assert.equal(verdictFacts(changed), null);
  assert.doesNotMatch(renderResultsDoc(changed), /## The short answer/);
  assert.doesNotMatch(renderEvidenceBlock(changed), /In short/);
});

test('negative control: a faster rebuild, or a prefix that saves no time, removes the short answer', () => {
  const faster = structuredClone(summary);
  for (const row of faster.latency.rows) if (row.condition === 'tiny') row.ratioToDuplicated.estimate = 0.5;
  assert.equal(verdictFacts(faster), null);
  const noGain = structuredClone(summary);
  for (const run of noGain.llm) if (run.prefillCall) run.prefillCall.speedup.estimate = 1;
  assert.equal(verdictFacts(noGain), null);
});

test('a host with no allocator reading gets no short answer', () => {
  assert.equal(verdictFacts({ ...summary, llm: [] }), null);
});
