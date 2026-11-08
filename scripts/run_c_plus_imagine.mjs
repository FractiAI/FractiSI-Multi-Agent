#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprintBenchSummary, runCPlusImagineBench } from '../src/experiments/c-plus-imagine-bench.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'output/data/world-model-assimilation');
mkdirSync(outDir, { recursive: true });

const bench = runCPlusImagineBench({
  agentCounts: [1, 4, 16, 32, 100],
  runs: 5,
  seed: 20261106,
});

const latest = join(outDir, 'c-plus-imagine-latest.json');
writeFileSync(latest, JSON.stringify(bench, null, 2));

console.log(JSON.stringify({
  ok: true,
  ms: bench.elapsedMsTotal,
  fingerprint: fingerprintBenchSummary(bench),
  latest,
  rows: bench.byAgents.map((a) => ({
    agents: a.agents,
    C: a.C.usefulCompletedTasks.mean,
    C_imagine: a.C_imagine.usefulCompletedTasks.mean,
    C_imagine_select: a.C_imagine_select.usefulCompletedTasks.mean,
    deltaSelect: a.deltaUsefulSelect.mean,
    selectImproved: a.selectImproved,
    usefulRegression: a.usefulRegression,
    selectRegression: a.selectRegression,
  })),
}, null, 2));
