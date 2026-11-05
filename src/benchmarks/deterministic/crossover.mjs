/**
 * Where the exact-text cache overtakes the rhyme as sessions become duplicates.
 * All three arms store the same sessions; every byte count is UTF-8 JSON in process.
 */
import { compareRhymeToCache, mixedSessions } from '../../experiments/rhyme-vs-cache.mjs';

export function rhymeCacheCrossover({ sessions, duplicateFractions }) {
  const points = duplicateFractions.map((duplicateFraction) => {
    const c = compareRhymeToCache(mixedSessions(duplicateFraction, sessions));
    return {
      duplicateFraction,
      naiveBytes: c.naiveBytes,
      cacheBytes: c.cacheBytes,
      rhymeBytes: c.rhymeBytes,
      equivalent: c.equivalent,
      smaller: c.cacheBytes < c.rhymeBytes ? 'cache' : 'rhyme',
    };
  });
  const firstCacheWin = points.find((p) => p.smaller === 'cache');
  return {
    sessions,
    points,
    allEquivalent: points.every((p) => p.equivalent),
    cacheFirstSmallerAt: firstCacheWin?.duplicateFraction ?? null,
  };
}
