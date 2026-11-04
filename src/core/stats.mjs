/**
 * Dependency-free descriptive statistics used by the measured benchmarks.
 * Quantiles use linear interpolation between order statistics (Hyndman-Fan
 * type 7); bootstrap intervals use the percentile method with an explicit seed.
 */
import { mulberry32 } from './rng.mjs';

/**
 * @param {readonly number[]} sortedAscending
 * @param {number} q quantile in [0, 1]
 */
export function quantileSorted(sortedAscending, q) {
  if (!(q >= 0 && q <= 1)) throw new RangeError(`quantile out of range: ${q}`);
  const n = sortedAscending.length;
  if (n === 0) throw new RangeError('quantile of an empty sample');
  const position = (n - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  if (low === high) return sortedAscending[low];
  return sortedAscending[low] + (position - low) * (sortedAscending[high] - sortedAscending[low]);
}

/** @param {readonly number[]} samples */
export function median(samples) {
  return quantileSorted(ascending(samples), 0.5);
}

/** @param {readonly number[]} samples */
export function mean(samples) {
  if (samples.length === 0) throw new RangeError('mean of an empty sample');
  return samples.reduce((sum, x) => sum + x, 0) / samples.length;
}

/** @param {readonly number[]} samples */
export function summarize(samples) {
  const sorted = ascending(samples);
  return {
    n: sorted.length,
    mean: mean(sorted),
    p50: quantileSorted(sorted, 0.5),
    p95: quantileSorted(sorted, 0.95),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

/**
 * Percentile bootstrap confidence interval. The unit of resampling is whatever
 * the caller passes as a sample; callers pass per-process values, not raw
 * per-iteration timings, so that within-process correlation is not counted as
 * independent evidence.
 *
 * @param {readonly number[]} samples
 * @param {object} [options]
 * @param {(values: number[]) => number} [options.statistic]
 * @param {number} [options.resamples]
 * @param {number} [options.confidence]
 * @param {number} [options.seed]
 */
export function bootstrapCi(samples, options = {}) {
  const { statistic = median, resamples = 2000, confidence = 0.95, seed = 1 } = options;
  if (samples.length === 0) throw new RangeError('bootstrap of an empty sample');
  if (!(confidence > 0 && confidence < 1)) throw new RangeError(`confidence out of range: ${confidence}`);
  const rng = mulberry32(seed);
  const estimates = new Array(resamples);
  const draw = new Array(samples.length);
  for (let r = 0; r < resamples; r++) {
    for (let i = 0; i < samples.length; i++) draw[i] = samples[Math.floor(rng() * samples.length)];
    estimates[r] = statistic(draw);
  }
  estimates.sort((a, b) => a - b);
  const tail = (1 - confidence) / 2;
  return {
    estimate: statistic([...samples]),
    low: quantileSorted(estimates, tail),
    high: quantileSorted(estimates, 1 - tail),
    confidence,
    resamples,
    seed,
    n: samples.length,
  };
}

/**
 * Percentile bootstrap interval for the ratio of two independent samples' statistics.
 *
 * @param {readonly number[]} numerator
 * @param {readonly number[]} denominator
 * @param {object} [options] as for {@link bootstrapCi}
 */
export function bootstrapRatioCi(numerator, denominator, options = {}) {
  const { statistic = median, resamples = 2000, confidence = 0.95, seed = 1 } = options;
  if (numerator.length === 0 || denominator.length === 0) throw new RangeError('bootstrap of an empty sample');
  if (denominator.some((value) => !(value > 0))) throw new RangeError('a ratio needs a positive denominator sample');
  const rng = mulberry32(seed);
  const resample = (values) => Array.from(values, () => values[Math.floor(rng() * values.length)]);
  const estimates = new Array(resamples);
  for (let r = 0; r < resamples; r++) estimates[r] = statistic(resample(numerator)) / statistic(resample(denominator));
  estimates.sort((a, b) => a - b);
  const tail = (1 - confidence) / 2;
  return {
    estimate: statistic([...numerator]) / statistic([...denominator]),
    low: quantileSorted(estimates, tail),
    high: quantileSorted(estimates, 1 - tail),
    confidence,
    resamples,
    seed,
  };
}

function ascending(samples) {
  return [...samples].sort((a, b) => a - b);
}
