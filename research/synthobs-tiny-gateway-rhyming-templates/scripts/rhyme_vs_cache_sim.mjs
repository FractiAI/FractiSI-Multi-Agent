/**
 * Print the rhyme-versus-cache comparison.
 * A rhyme matches shape. A cache matches identical text.
 * In-process JSON bytes. Not a GPU measurement.
 */
import { compareRhymeToCache, differingWordSessions, identicalTextSessions } from '../src/rhyme-vs-cache.mjs';

const report = {
  ok: true,
  kind: 'simulation',
  simulator: 'rhyming-template shape match versus exact-text cache',
  notAMeasurement: true,
  notGpu: true,
  definition: 'Rhyme = same fields and same value kinds. Cache = identical JSON text stored once.',
  cases: [
    { name: 'sameShapeDifferentWords', ...compareRhymeToCache(differingWordSessions()) },
    { name: 'identicalText', ...compareRhymeToCache(identicalTextSessions()) },
  ],
};
if (report.cases.some((c) => !c.equivalent)) process.exit(1);
console.log(JSON.stringify(report, null, 2));
