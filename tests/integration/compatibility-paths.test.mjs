import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { COMMANDS } from '../../src/cli/main.mjs';
import { PATHS, REPO_ROOT } from '../../src/core/paths.mjs';
import * as shimExperiments from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';
import * as shimMemory from '../../research/synthobs-tiny-gateway-rhyming-templates/src/memory.mjs';
import * as shimRhyming from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rhyming-template.mjs';
import * as shimGateway from '../../research/synthobs-tiny-gateway-rhyming-templates/src/gateway.mjs';
import * as shimVector from '../../research/synthobs-tiny-gateway-rhyming-templates/src/nested-vector.mjs';
import * as shimEight from '../../research/synthobs-tiny-gateway-rhyming-templates/src/eight-node.mjs';
import * as shimConstants from '../../research/synthobs-tiny-gateway-rhyming-templates/src/constants.mjs';
import * as shimRng from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rng.mjs';
import * as shimCache from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rhyme-vs-cache.mjs';
import * as shimLive from '../../research/synthobs-tiny-gateway-rhyming-templates/src/gpu-live-lab.mjs';
import * as shimLlm from '../../research/synthobs-tiny-gateway-rhyming-templates/src/gpu-llm-real-lab.mjs';
import { runAllExperiments } from '../../src/experiments/suite.mjs';
import { bytesOf } from '../../src/core/bytes.mjs';

test('the v1.3 module paths export the canonical functions', async () => {
  const suite = '../../research/synthobs-tiny-gateway-rhyming-templates/src';
  const gate = await import(`${suite}/holographic-rhyme-gate.mjs`);
  const route = await import(`${suite}/geometric-rhyme-route.mjs`);
  const buffer = await import(`${suite}/context-buffer.mjs`);
  const hooks = await import(`${suite}/context-compress-hooks.mjs`);
  const energy = await import(`${suite}/energy-proxy.mjs`);
  const sim = await import(`${suite}/h100-rhyme-sim.mjs`);
  assert.equal(typeof gate.auditRhyme, 'function');
  assert.equal(typeof route.routeBySignature, 'function');
  assert.equal(typeof buffer.createRecursiveContextBuffer, 'function');
  assert.equal(typeof hooks.createCompressionHookRegistry, 'function');
  assert.equal(typeof energy.scaleUnderBudget, 'function');
  assert.equal(typeof sim.runH100RhymeSim, 'function');
  assert.equal(sim.RHYME_SHARED_ORG_FRACTION, 1 - 121 / 198);
  for (const name of ['structuralSignature', 'shapesRhyme', 'diffDelta', 'mergeDelta', 'reconstructExpressionWithState']) {
    assert.equal(typeof shimRhyming[name], 'function', name);
  }
});

test('every old module path still exports the same functions', () => {
  assert.equal(shimExperiments.runAllExperiments, runAllExperiments);
  assert.equal(shimMemory.bytesOf, bytesOf);
  assert.equal(typeof shimMemory.illustrativeMemoryModel, 'function');
  assert.equal(typeof shimRhyming.createTemplateCatalog, 'function');
  assert.equal(typeof shimGateway.createGateway, 'function');
  assert.equal(typeof shimVector.createVectorStore, 'function');
  assert.equal(shimEight.NODE_COUNT, 8);
  assert.equal(shimConstants.DIGITAL_SEED, 20261103);
  assert.equal(typeof shimRng.mulberry32, 'function');
  assert.equal(typeof shimCache.compareRhymeToCache, 'function');
  assert.equal(typeof shimLive.runGpuLiveChatLab, 'function');
  assert.equal(typeof shimLlm.runGpuLlmRealLab, 'function');
});

test('the old rhyme script path still runs and reports equivalence', () => {
  const run = spawnSync(process.execPath, [`${PATHS.suite}/scripts/rhyme_vs_cache_sim.mjs`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(JSON.parse(run.stdout).cases.every((c) => c.equivalent), true);
});

test('every command the website tells readers to run exists in the CLI', () => {
  const pages = ['product/index.html', 'research/index.html'];
  const published = new Set();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(REPO_ROOT, page), 'utf8');
    for (const [, command] of html.matchAll(/node scripts\/tiny\.mjs (\w+)/g)) published.add(command);
  }
  assert.ok(published.size >= 5, `found only ${[...published].join(', ')}`);
  for (const command of published) assert.ok(Object.hasOwn(COMMANDS, command), `${command} is published but gone from the CLI`);
});
