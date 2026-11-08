import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  armC_imagine_select,
  armC_plus_imagine,
  createPathFutureBoard,
  runCPlusImagineBench,
} from '../../src/experiments/c-plus-imagine-bench.mjs';
import { armC_fractisi, buildWorkload } from '../../src/platform/comparative-bench.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('path future board blocks unapproved commits and selects non-overlapping futures', () => {
  const board = createPathFutureBoard({ seed: 3 });
  const a = board.imagine('A0', ['src/shared/x.mjs']);
  const b = board.imagine('A1', ['src/shared/x.mjs']);
  const c = board.imagine('A2', ['src/agents/a2/y.mjs']);
  const evald = board.evaluate([a.id, b.id, c.id]);
  assert.equal(evald.composable, false);
  const selected = board.rankAndSelect([a.id, b.id, c.id]);
  assert.ok(selected.kept.length >= 1);
  assert.ok(selected.rejected.length >= 1);
  assert.equal(board.commitKept(selected.kept, { approved: false }).ok, false);
  assert.equal(board.commitKept(selected.kept, { approved: true }).ok, true);
  assert.equal(board.snapshotAuth().version, 1);
});

test('C+imagine matches C useful work on the same workload seed (hard gate)', () => {
  const workload = buildWorkload(16, 20261106 + 16 * 100, {});
  const c = armC_fractisi(workload);
  const imag = armC_plus_imagine(workload, { seed: 99 });
  assert.equal(imag.usefulCompletedTasks, c.usefulCompletedTasks);
  assert.equal(imag.mergeConflicts, c.mergeConflicts);
  assert.equal(imag.predictedCommitOk, true);
});

test('C+imagine_select never regresses >5% vs C on a fixed seed and can beat C', () => {
  const workload = buildWorkload(32, 20261106 + 32 * 100, {});
  const c = armC_fractisi(workload);
  const sel = armC_imagine_select(workload, { seed: 42 });
  assert.ok(sel.usefulCompletedTasks >= c.usefulCompletedTasks * 0.95);
  assert.ok(sel.futuresImagined === 32);
  assert.ok(sel.futuresKept + sel.futuresRejected === 32);
});

test('full C vs C+imagine bench reports all agent counts without useful regression', () => {
  const bench = runCPlusImagineBench({ agentCounts: [1, 4, 16], runs: 2 });
  assert.equal(bench.kind, 'c_plus_imagine_bench');
  assert.equal(bench.byAgents.length, 3);
  for (const row of bench.byAgents) {
    assert.equal(row.usefulRegression, false);
    assert.equal(row.selectRegression, false);
    assert.ok(row.sharedVsConventionalReduction !== undefined);
  }
});

test('receipt and results doc exist after initiative', () => {
  assert.equal(
    existsSync(join(root, 'docs/research/world-model-assimilation/C_PLUS_IMAGINE_RESULTS.md')),
    true,
  );
  const receipt = join(root, 'output/data/world-model-assimilation/c-plus-imagine-latest.json');
  if (existsSync(receipt)) {
    const data = JSON.parse(readFileSync(receipt, 'utf8'));
    assert.equal(data.kind, 'c_plus_imagine_bench');
    assert.ok(data.byAgents.some((r) => r.agents === 100));
  }
});
