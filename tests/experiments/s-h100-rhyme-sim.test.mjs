import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PATHS } from '../../src/core/paths.mjs';
import { RHYME_SHARED_ORG_FRACTION, assertH100RhymeSimInvariants, experimentS_h100RhymeVsPrefixSim } from '../../src/experiments/s-h100-rhyme-sim.mjs';
import { notRunReport } from '../../src/labs/lab-status.mjs';

const receipt = JSON.parse(readFileSync(`${PATHS.historicalReceipts}/h100_prefix_cache_sim.json`, 'utf8'));

test('the stored simulation meets its own invariants', () => {
  const result = experimentS_h100RhymeVsPrefixSim(receipt);
  assert.equal(result.pass, true);
  assert.equal(result.status, 'pass');
  assert.ok(result.tinyKvReductionVersusPrefixCache > 0.3);
  assert.ok(result.tinyMaterializeSpeedupVersusPrefixCache > 1.2);
  assert.equal(result.report.workloads.identicalPrefix.comparison.tinyVersusPrefixCacheResidentBytes, 0);
  assert.equal(result.report.workloads.rhymingDifferentWording.arms.tinyFootprintRhyme.sameResidentSetAsPrefixCache, false);
  assert.equal(receipt.workload.rhymeSharedOrgFraction, RHYME_SHARED_ORG_FRACTION);
});

test('a host that could not run it records not_run, never a pass', () => {
  const result = experimentS_h100RhymeVsPrefixSim(notRunReport('python_unavailable'));
  assert.equal(result.status, 'not_run');
  assert.equal(result.pass, false);
});

test('negative control: a different fraction or a broken tie fails', () => {
  const wrongFraction = structuredClone(receipt);
  wrongFraction.workload.rhymeSharedOrgFraction = 0.5;
  assert.equal(assertH100RhymeSimInvariants(wrongFraction).fractionLock, false);
  const noTie = structuredClone(receipt);
  noTie.workloads.identicalPrefix.comparison.tinyVersusPrefixCacheResidentBytes = -1;
  const invariants = assertH100RhymeSimInvariants(noTie);
  assert.equal(invariants.identicalTie, false);
  assert.equal(invariants.pass, false);
  assert.equal(experimentS_h100RhymeVsPrefixSim(noTie).status, 'fail');
});

test('a missing report fails its invariants', () => {
  assert.equal(assertH100RhymeSimInvariants({ ok: false }).pass, false);
  assert.equal(assertH100RhymeSimInvariants({ ok: true }).reason, 'missing_workloads');
});
