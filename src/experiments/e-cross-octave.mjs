/**
 * E: a cross-octave lattice versus one request's selective working set.
 *
 * This compares the whole lattice with one localized request's closure. The
 * working set does not contain the rest of the lattice, so this "reduction" is
 * scope selection, not lossless compression; the aggregate sensitivity analysis
 * reports results with and without it.
 */
import { bytesOf, reduction } from '../core/bytes.mjs';
import { mulberry32 } from '../core/rng.mjs';
import { createVectorStore } from '../engine/vectors/store.mjs';
import { DIGITAL_SEED } from './constants.mjs';

export function buildCrossOctaveWorkload(seed = DIGITAL_SEED, octaves = 16, perOct = 48) {
  const rng = mulberry32(seed);
  const store = createVectorStore();
  for (let o = 0; o < octaves; o++) {
    for (let i = 0; i < perOct; i++) {
      const id = `o${o}_v${i}`;
      store.put({
        id,
        octave: o,
        payload: { blob: Array.from({ length: 48 }, () => rng()) },
        // Sibling mesh within octave (conventional full load is large)
        children: [],
        cross:
          i + 1 < perOct
            ? [`o${o}_v${i + 1}`]
            : o + 1 < octaves
              ? [`o${o + 1}_v0`]
              : [],
        deps: [],
      });
    }
  }
  // Localized request: short hop only (selective reconstruction)
  return { store, conventional: store.all(), working: store.resolveWorkingSet('o3_v0', { maxDepth: 3 }) };
}

export function experimentE_crossOctave(seed = DIGITAL_SEED, octaves = 16, perOct = 48) {
  const { conventional, working } = buildCrossOctaveWorkload(seed, octaves, perOct);
  const r = reduction(bytesOf(conventional), bytesOf(working));
  return {
    id: 'E_cross_octave',
    title: 'Workload D · selective cross-octave reconstruction',
    nVectors: conventional.length,
    workingN: working.length,
    ...r,
    pass: r.ratio >= 0.7 && working.length < conventional.length / 4,
  };
}
