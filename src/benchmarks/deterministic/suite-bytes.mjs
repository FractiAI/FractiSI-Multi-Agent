/** Byte accounting for the registered workloads, in the layout analysis consumes. */
import { runDeterministicExperiments } from '../../experiments/suite.mjs';
import { compareRhymeToCache, differingWordSessions, identicalTextSessions } from '../../experiments/rhyme-vs-cache.mjs';

const WORKLOAD_LABELS = Object.freeze({
  B: 'Structured records',
  C: 'Cross-linked graph',
  D: 'Eight-node broadcast',
  E: 'Selective working set',
  F: 'Shared system prompt',
});

export function runSuiteBytes({ seed, validationSeed }) {
  const results = runDeterministicExperiments({ seed, validationSeed });
  const workloads = Object.keys(WORKLOAD_LABELS).map((key) => ({
    key,
    label: WORKLOAD_LABELS[key],
    baselineBytes: results[key].baselineBytes,
    tinyBytes: results[key].tinyBytes,
    ratio: results[key].ratio,
    pass: results[key].pass,
  }));
  return {
    illustrative: {
      reductionPct: results.A.reductionPct,
      nonWeightCutNeededPct: results.A.nonWeightCutNeededPct,
      pass: results.A.pass,
    },
    workloads,
    gateway: results.G,
    rhyme: {
      differingWords: compareRhymeToCache(differingWordSessions()),
      identicalText: compareRhymeToCache(identicalTextSessions()),
    },
    results,
  };
}
