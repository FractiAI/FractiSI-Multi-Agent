/**
 * The deterministic tier: byte-stable on any machine with the same plan and source.
 * Nothing here reads a clock or describes the host.
 */
import { compressionReference, normalizedCrossLinkedBaseline } from './baselines.mjs';
import { rhymeCacheCrossover } from './crossover.mjs';
import { fullExactness } from './exactness.mjs';
import { gpuProxySensitivity } from './gpu-proxy.mjs';
import { rhymeByteFraction, rhymeGateProbe } from './rhyme-gate.mjs';
import { sessionScaling } from './scaling.mjs';
import { aggregateSensitivity } from './sensitivity.mjs';
import { runSuiteBytes } from './suite-bytes.mjs';

/** @param {object} plan validated benchmark plan */
export function runDeterministicBenchmarks(plan) {
  const seed = plan.seeds.primary;
  const validationSeed = plan.seeds.validation;
  const { results, ...suite } = runSuiteBytes({ seed, validationSeed });
  const { K, L, M } = results;
  return {
    suite,
    companions: {
      K: { pass: K.pass, bucketCompares: K.bucketCompares, linearCompares: K.linearCompares },
      L: { pass: L.pass, foldRatio: L.foldRatio, levels: L.levels },
      M: { pass: M.pass, baselineDepth: M.baselineDepth, scaledDepth: M.scaledDepth },
    },
    sensitivity: aggregateSensitivity(suite.workloads, plan.deterministic.target),
    exactness: fullExactness({ seed }),
    baselines: normalizedCrossLinkedBaseline({ seed }),
    scaling: sessionScaling({ seed, ...plan.deterministic.scaling }),
    crossover: rhymeCacheCrossover(plan.deterministic.crossover),
    gpuProxy: gpuProxySensitivity(plan.deterministic.gpuProxy),
    rhymeGate: rhymeGateProbe(),
    rhymeByteFraction: rhymeByteFraction(),
  };
}

export { compressionReference };
