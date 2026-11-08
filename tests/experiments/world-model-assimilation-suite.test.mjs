import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { runWorldModelAssimilationSuite } from '../../src/experiments/world-model-assimilation-suite.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('assimilation suite returns baseline + five measured experiments', () => {
  const suite = runWorldModelAssimilationSuite({
    baseline: { agentCounts: [1, 4], runs: 1 },
    e1: { agents: 4, runs: 1 },
    e2: { agents: 4, runs: 1 },
    e3: { steps: 8, runs: 1 },
    e4: { agentCounts: [1, 4], runs: 1 },
    e5: { agents: 4, size: 8, runs: 1 },
  });
  assert.equal(suite.suite, 'world_model_assimilation');
  assert.equal(suite.experiments.length, 5);
  assert.equal(suite.baseline.id, 'baseline_fractisi_comparative_bench');
  assert.equal(suite.experiments[1].summary.unapprovedAlwaysBlocked, true);
  assert.ok(suite.experiments[0].summary.tinyVsConventionalReduction > 0.5);
});

test('initiative deliverable documents exist', () => {
  const dir = join(root, 'docs/research/world-model-assimilation');
  for (const name of [
    'FRACTISI_WORLD_MODEL_RESEARCH.md',
    'WORLD_MODEL_CAPABILITY_CROSSWALK.md',
    'PREDICTIVE_SHARED_STATE_ARCHITECTURE.md',
    'OPEN_SOURCE_LICENSE_AUDIT.md',
    'BENCHMARK_BASELINE.md',
    'EXPERIMENT_RESULTS.md',
    'INTEGRATION_ROADMAP.md',
    'EXECUTIVE_RECOMMENDATION.md',
  ]) {
    assert.equal(existsSync(join(dir, name)), true, name);
  }
});

test('experiment results doc does not claim external WFM weights were loaded', () => {
  const text = readFileSync(
    join(root, 'docs/research/world-model-assimilation/EXPERIMENT_RESULTS.md'),
    'utf8',
  );
  assert.match(text, /No external WFM weights/i);
  assert.doesNotMatch(text, /downloaded Cosmos weights/i);
});
