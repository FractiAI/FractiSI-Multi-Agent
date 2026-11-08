#!/usr/bin/env node
/**
 * Isolated runner for the World Model Assimilation research suite.
 * Does not mutate product entitlements or deploy paths.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runWorldModelAssimilationSuite } from '../src/experiments/world-model-assimilation-suite.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'output/data/world-model-assimilation');
mkdirSync(outDir, { recursive: true });

const suite = runWorldModelAssimilationSuite({
  baseline: { agentCounts: [1, 4, 16, 32], runs: 3 },
  e1: { agents: 16, runs: 5 },
  e2: { agents: 8, runs: 5 },
  e3: { steps: 40, agents: 4, runs: 3 },
  e4: { agentCounts: [1, 4, 16, 32], runs: 3 },
  e5: { size: 16, agents: 8, runs: 3 },
});

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const latest = join(outDir, 'latest.json');
const stamped = join(outDir, `suite-${stamp}.json`);
writeFileSync(latest, JSON.stringify(suite, null, 2));
writeFileSync(stamped, JSON.stringify(suite, null, 2));

console.log(JSON.stringify({
  ok: true,
  ms: suite.ms,
  latest,
  stamped,
  experiments: suite.experiments.map((e) => e.id),
}, null, 2));
