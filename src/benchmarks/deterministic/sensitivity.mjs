/**
 * How much the headline aggregate depends on which workloads are in it and how
 * they are weighted. The aggregate sums bytes, so each workload's influence is its
 * baseline size, which is an arbitrary parameter of that workload.
 */
import { aggregateReduction } from '../../core/bytes.mjs';

/** Workloads whose "tiny" form still holds all the information of the baseline. */
export const LOSSLESS_KEYS = Object.freeze(['B', 'C', 'D', 'F']);
/** Lossless workloads whose baseline is not constructed as a deliberate anti-pattern. */
export const NON_STRAWMAN_KEYS = Object.freeze(['B', 'D', 'F']);

/**
 * @param {ReadonlyArray<{key: string, baselineBytes: number, tinyBytes: number, ratio: number}>} workloads
 * @param {number} target
 */
export function aggregateSensitivity(workloads, target) {
  const pick = (keys) => workloads.filter((w) => keys.includes(w.key));
  const summarize = (label, selected) => {
    const aggregate = aggregateReduction(selected);
    return { label, keys: selected.map((w) => w.key), ratio: aggregate.ratio, clearsTarget: aggregate.ratio >= target };
  };
  const all = aggregateReduction(workloads);
  const unweighted = workloads.reduce((sum, w) => sum + w.ratio, 0) / workloads.length;
  return {
    target,
    published: summarize('All five workloads, byte-weighted', workloads),
    unweightedMean: { label: 'All five workloads, equal weight', ratio: unweighted, clearsTarget: unweighted >= target },
    lossless: summarize('Lossless workloads only', pick(LOSSLESS_KEYS)),
    nonStrawman: summarize('Lossless, without the anti-pattern baseline', pick(NON_STRAWMAN_KEYS)),
    leaveOneOut: workloads.map((left) => ({
      leftOut: left.key,
      ...summarize(`Without ${left.key}`, workloads.filter((w) => w.key !== left.key)),
    })),
    byteShare: workloads.map((w) => ({ key: w.key, share: w.baselineBytes / all.baselineBytes })),
  };
}
