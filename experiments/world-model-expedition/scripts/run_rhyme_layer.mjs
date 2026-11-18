#!/usr/bin/env node
/**
 * Rhyming vs non-rhyming, same world model.
 * Python: run_rhyme_layer_test.py (private copies vs shared world, three live open WM arms).
 * Node: real rhyme engine bytes on the agents' actual CartPole telemetry.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareRhymeToCache } from '../../../src/experiments/rhyme-vs-cache.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lab = join(root, 'src/open_wms');
const resultPath = join(root, 'results/open_wm/rhyme_layer_wm_test.json');
const trafficPath = join(root, 'results/open_wm/rhyme_layer_traffic.json');

if (process.env.SKIP_PY !== '1' || !existsSync(resultPath)) {
  const res = spawnSync(process.env.PYTHON || 'python3', ['run_rhyme_layer_test.py'], {
    cwd: lab,
    encoding: 'utf8',
    env: { ...process.env, OMP_NUM_THREADS: '2' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (res.status !== 0) throw new Error('run_rhyme_layer_test.py failed');
}

const wm = JSON.parse(readFileSync(resultPath, 'utf8'));
const traffic = JSON.parse(readFileSync(trafficPath, 'utf8'));

function envelope(i, utterance) {
  const octave1 = (i % 7) + 1;
  return {
    kind: 'session',
    schema: 'rhyme_v2',
    motion: 'repeat-mirror-recurse-correct',
    netZero: { kind: 'session', octave: 0, role: 'origin', equilibrium: true },
    organization: {
      kind: 'session',
      role: i % 9 === 0 ? 'lead' : 'user',
      octave: octave1,
      organization: { kind: 'session', role: i % 5 === 0 ? 'lead' : 'user', octave: Math.min(octave1 + 1, 8) },
    },
    utterance,
  };
}

const items = traffic.map((m, i) =>
  envelope(i, `cartpole agent=${m.agent} dim=${m.dim} t=${m.t} value=${m.value}`),
);
const bytes = compareRhymeToCache(items);

const summary = {
  documentId: 'RHYME-LAYER-WM-2026-11-18',
  title: 'Rhyming vs non-rhyming world models: same model, two deployments',
  controller: 'each model drives its own 4-step rollout controller; no hand-written balancing rule',
  returns: Object.fromEntries(
    Object.entries(wm.models).map(([k, v]) => [
      k,
      {
        nonRhymingPrivateWorlds: v.non_rhyming_private_worlds.mean_return,
        rhymingSharedWorld: v.rhyming_shared_world.mean_return,
        nextStateMsePrivate: v.next_state_mse_under_partial_observation.private_worlds_mse,
        nextStateMseShared: v.next_state_mse_under_partial_observation.shared_world_mse,
      },
    ]),
  ),
  randomBaselineReturn: wm.random_baseline.mean_return,
  telemetryBytes: {
    messages: items.length,
    naiveBytes: bytes.naiveBytes,
    exactCacheBytes: bytes.cacheBytes,
    exactTextHits: bytes.exactTextHits,
    rhymeBytes: bytes.rhymeBytes,
    rhymeVersusCache: bytes.rhymeVersusCache,
    equivalent: bytes.equivalent,
  },
};
mkdirSync(join(root, 'results/rhyme_layer'), { recursive: true });
writeFileSync(join(root, 'results/rhyme_layer/summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
