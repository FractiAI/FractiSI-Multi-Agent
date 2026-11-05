import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { claimsTable, gpuSweepTable, heapTable, latencyTable, llmTable, residencyTable, rssTable, workloadsTable } from '../../src/manuscript/tables.mjs';

const summary = JSON.parse(fs.readFileSync(`${PATHS.outputData}/analysis_summary.json`, 'utf8'));

function assertWellFormed(table, rowCount) {
  const lines = table.split('\n');
  const cells = (line) => line.split('|').length;
  assert.equal(lines.length, rowCount + 2);
  assert.ok(lines.every((line) => cells(line) === cells(lines[0])), 'every row has the same column count');
  assert.match(lines[1], /^\| -+:? \|/);
  assert.equal(/undefined|NaN|null/.test(table), false);
}

test('every table is a well-formed pipe table with no empty values', () => {
  assertWellFormed(workloadsTable(summary), summary.deterministic.suite.workloads.length);
  assertWellFormed(rssTable(summary), summary.rss.rows.length);
  assertWellFormed(latencyTable(summary), summary.latency.rows.length);
  assertWellFormed(claimsTable(summary), summary.claims.length);
  assertWellFormed(gpuSweepTable(summary), summary.deterministic.gpuProxy.sweep.length);
});

test('tables list the runs and sizes in the data', () => {
  const largest = Math.max(...summary.heap.rows.map((r) => r.sessions));
  assertWellFormed(heapTable(summary), summary.heap.rows.filter((r) => r.sessions === largest).length);
  const completed = summary.llm.filter((r) => r.status !== 'not_run');
  assertWellFormed(llmTable(summary), completed.length);
  assertWellFormed(residencyTable(summary), completed.length);
});

test('a non-lossless workload is labelled as such', () => {
  assert.match(workloadsTable(summary), /not lossless/);
});

test('a backend with no allocator reads n/a, not zero', () => {
  const changed = structuredClone(summary);
  const run = changed.llm.find((r) => r.status !== 'not_run');
  run.residency.reduction.device = null;
  assert.match(residencyTable(changed), /n\/a/);
});
