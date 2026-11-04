import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { CLAIM_STATUS, evaluateClaims } from '../../src/analysis/claims.mjs';
import { PATHS } from '../../src/core/paths.mjs';

const summary = JSON.parse(fs.readFileSync(`${PATHS.outputData}/analysis_summary.json`, 'utf8'));
const byId = (claims) => Object.fromEntries(claims.map((c) => [c.id, c]));

test('every claim has evidence and a known status', () => {
  const claims = evaluateClaims(summary);
  assert.ok(claims.length >= 10);
  for (const claim of claims) {
    assert.ok(claim.evidence.length > 0, claim.id);
    assert.ok(Object.values(CLAIM_STATUS).includes(claim.status), claim.id);
  }
});

test('latency follows both workloads and their intervals, not one point estimate', () => {
  const faster = (workloads) => {
    const changed = structuredClone(summary);
    for (const row of changed.latency.rows) {
      if (row.condition === 'tiny' && workloads.includes(row.workload)) row.ratioToDuplicated.high = 0.5;
    }
    return byId(evaluateClaims(changed)).latency_in_process.status;
  };
  assert.equal(faster(['ai_context', 'rhyme_differing']), CLAIM_STATUS.REPRODUCED);
  assert.equal(faster(['ai_context']), CLAIM_STATUS.QUALIFIED);
  assert.equal(faster([]), CLAIM_STATUS.NOT_REPRODUCED);
});

test('a shared prompt counts as reproduced only if the heap keeps the JSON promise and beats a reference', () => {
  const withHeap = (reduction) => {
    const changed = structuredClone(summary);
    const largest = Math.max(...changed.heap.rows.map((r) => r.sessions));
    const row = changed.heap.rows.find((r) => r.workload === 'ai_context' && r.condition === 'tiny' && r.sessions === largest);
    row.heapReduction.estimate = reduction;
    return byId(evaluateClaims(changed)).memory_shared_prompt.status;
  };
  assert.equal(withHeap(0.99), CLAIM_STATUS.REPRODUCED);
  assert.equal(withHeap(0.1), CLAIM_STATUS.QUALIFIED);
  assert.equal(withHeap(-0.1), CLAIM_STATUS.NOT_REPRODUCED);
});

test('the memory target follows resident memory measured on a real model', () => {
  const changed = structuredClone(summary);
  assert.equal(byId(evaluateClaims(changed)).dram_target.status, CLAIM_STATUS.NOT_REPRODUCED);
  changed.llm.find((run) => run.status === 'pass').withWeights.reduction = 0.95;
  const claim = byId(evaluateClaims(changed)).dram_target;
  assert.equal(claim.status, CLAIM_STATUS.QUALIFIED);
  assert.doesNotMatch(claim.evidence, /Not established/);
});

test('the corrected defect is checked against this host, so it can come back', () => {
  const changed = structuredClone(summary);
  changed.gpuLive = { status: 'not_run', reason: 'nvcuda_unavailable' };
  changed.suiteRun = { verdict: 'incomplete' };
  assert.equal(byId(evaluateClaims(changed)).receipts_on_your_machine.status, CLAIM_STATUS.CORRECTED);
  changed.suiteRun = { verdict: 'all_pass' };
  assert.equal(byId(evaluateClaims(changed)).receipts_on_your_machine.status, CLAIM_STATUS.NOT_REPRODUCED);
});

test('a run that failed its equivalence check is not evidence for a speedup', () => {
  const changed = structuredClone(summary);
  for (const run of changed.llm) run.status = 'fail';
  assert.equal(byId(evaluateClaims(changed)).prefill.status, CLAIM_STATUS.NOT_TESTABLE);
});

test('the prefill claim says where the equivalence check cannot see a wrong cache', () => {
  const claims = byId(evaluateClaims(summary));
  assert.match(claims.prefill.evidence, /catches a cache built from the wrong prefix/);
  const changed = structuredClone(summary);
  for (const run of changed.llm) if (run.equivalence) run.equivalence.control.detected = false;
  assert.match(byId(evaluateClaims(changed)).prefill.evidence, /On no model does the equivalence check/);
});

test('evidence never says reproduced beside a status that says otherwise', () => {
  const changed = structuredClone(summary);
  changed.historical.aggregate.reproduced = false;
  changed.historical.gpuAllocation.reproducedByArithmetic = false;
  changed.deterministic.suite.rhyme.identicalText.cacheBytes = 999999;
  const claims = byId(evaluateClaims(changed));
  for (const id of ['aggregate', 'gpu_allocation', 'rhyme_vs_cache']) {
    assert.equal(claims[id].status, CLAIM_STATUS.NOT_REPRODUCED, id);
    assert.doesNotMatch(claims[id].evidence, /^Reproduced/, id);
  }
});

test('a broken historical match is reported as not reproduced', () => {
  const changed = structuredClone(summary);
  changed.historical.aggregate.reproduced = false;
  assert.equal(byId(evaluateClaims(changed)).aggregate.status, CLAIM_STATUS.NOT_REPRODUCED);
});

test('a GPU lab that ran here would move the device claims off not-testable', () => {
  const changed = structuredClone(summary);
  changed.gpuLive = { status: 'pass', nvidiaSmi: { reductionRatio: 0.7 }, latency: { comparison: { turnSpeedup: 9 } } };
  assert.equal(byId(evaluateClaims(changed)).gpu_device_memory.status, CLAIM_STATUS.QUALIFIED);
  assert.equal(byId(evaluateClaims(changed)).gpu_turn_latency.status, CLAIM_STATUS.QUALIFIED);
  changed.gpuLive = { status: 'pass', nvidiaSmi: { reductionRatio: 0 }, latency: { comparison: { turnSpeedup: 1 } } };
  assert.equal(byId(evaluateClaims(changed)).gpu_device_memory.status, CLAIM_STATUS.NOT_REPRODUCED);
  assert.equal(byId(evaluateClaims(changed)).gpu_turn_latency.status, CLAIM_STATUS.NOT_REPRODUCED);
});

test('on a host with no GPU the device claims are not testable, not failed', () => {
  const changed = structuredClone(summary);
  changed.gpuLive = { status: 'not_run', reason: 'nvcuda_unavailable' };
  const claims = byId(evaluateClaims(changed));
  assert.equal(claims.gpu_device_memory.status, CLAIM_STATUS.NOT_TESTABLE);
  assert.match(claims.gpu_device_memory.evidence, /not_run/);
});
